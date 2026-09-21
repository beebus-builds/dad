package mail

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// ResendSender implements Mailer via the Resend HTTP API
// (https://resend.com/docs/api-reference/emails/send-email). An alternative
// to raw SMTP for higher-volume/campaign sending; chosen via MAIL_PROVIDER.
type ResendSender struct {
	apiKey string
	from   string
	client *http.Client
}

func NewResendSender(apiKey, from string) *ResendSender {
	return &ResendSender{apiKey: apiKey, from: from, client: &http.Client{Timeout: 15 * time.Second}}
}

type resendPayload struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Text    string   `json:"text,omitempty"`
	HTML    string   `json:"html,omitempty"`
}

func (s *ResendSender) send(to, subject, text, html string) error {
	payload := resendPayload{From: s.from, To: []string{to}, Subject: subject, Text: text, HTML: html}
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	req, err := http.NewRequest(http.MethodPost, "https://api.resend.com/emails", bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("resend request: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return fmt.Errorf("resend responded with status %d", resp.StatusCode)
	}
	return nil
}

func (s *ResendSender) Send(to, subject, body string) error {
	return s.send(to, subject, body, "")
}

func (s *ResendSender) SendHTML(to, subject, html string) error {
	return s.send(to, subject, "", html)
}
