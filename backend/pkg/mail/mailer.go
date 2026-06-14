package mail

import (
	"crypto/tls"
	"fmt"
	"net"
	"net/smtp"
	"strings"
	"time"

	"github.com/shramjagaran/cms-backend/internal/config"
)

type Sender struct {
	cfg config.SMTPConfig
}

func NewSender(cfg config.SMTPConfig) *Sender {
	return &Sender{cfg: cfg}
}

func (s *Sender) sendMail(to, subject, body, contentType string) error {
	auth := smtp.PlainAuth("", s.cfg.User, s.cfg.Pass, s.cfg.Host)
	from := fmt.Sprintf("%s <%s>", s.cfg.FromName, s.cfg.From)
	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: %s; charset=UTF-8\r\n\r\n%s\r\n",
		from, to, subject, contentType, body)
	addr := fmt.Sprintf("%s:%d", s.cfg.Host, s.cfg.Port)

	d := net.Dialer{Timeout: 10 * time.Second}
	conn, err := d.Dial("tcp", addr)
	if err != nil {
		return fmt.Errorf("smtp dial: %w", err)
	}

	client, err := smtp.NewClient(conn, s.cfg.Host)
	if err != nil {
		conn.Close()
		return fmt.Errorf("smtp client: %w", err)
	}

	if ok, _ := client.Extension("STARTTLS"); ok {
		tlsCfg := &tls.Config{ServerName: s.cfg.Host}
		if err := client.StartTLS(tlsCfg); err != nil {
			client.Close()
			return fmt.Errorf("smtp starttls: %w", err)
		}
	}
	if err := client.Auth(auth); err != nil {
		client.Close()
		return fmt.Errorf("smtp auth: %w", err)
	}
	if err := client.Mail(s.cfg.From); err != nil {
		client.Close()
		return fmt.Errorf("smtp mail from: %w", err)
	}
	if err := client.Rcpt(to); err != nil {
		client.Close()
		return fmt.Errorf("smtp rcpt: %w", err)
	}
	w, err := client.Data()
	if err != nil {
		client.Close()
		return fmt.Errorf("smtp data: %w", err)
	}
	if _, err := w.Write([]byte(msg)); err != nil {
		w.Close()
		client.Close()
		return fmt.Errorf("smtp write: %w", err)
	}
	if err := w.Close(); err != nil {
		client.Close()
		return fmt.Errorf("smtp close: %w", err)
	}
	return client.Quit()
}

func (s *Sender) Send(to, subject, body string) error {
	return s.sendMail(to, subject, body, "text/plain")
}

func (s *Sender) SendHTML(to, subject, html string) error {
	return s.sendMail(to, subject, html, "text/html")
}

func (s *Sender) PasswordResetEmail(to, resetLink string) string {
	return fmt.Sprintf(`नमस्ते,

हामीले तपाईंको श्रम जागरण खाताको पासवर्ड रिसेट गर्न अनुरोध प्राप्त गर्यौं।

आफ्नो पासवर्ड रिसेट गर्न तलको लिङ्कमा क्लिक गर्नुहोस् (१ घण्टामा म्याद समाप्त हुन्छ):
%s

यदि तपाईंले यो अनुरोध गर्नुभएको होइन भने, तपाईं सुरक्षित रूपमा यो इमेललाई बेवास्ता गर्न सक्नुहुन्छ।

— श्रम जागरण टोली`, resetLink)
}

func (s *Sender) PasswordResetHTML(to, resetLink, appName string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;padding:24px;max-width:560px;margin:0 auto;">
<div style="background:#f5f5f5;border-radius:8px;padding:32px;">
<h2 style="margin:0 0 16px;color:#d32f2f;">%s</h2>
<p>हामीले तपाईंको पासवर्ड रिसेट गर्न अनुरोध प्राप्त गरेका छौं।</p>
<a href="%s" style="display:inline-block;background:#d32f2f;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;margin:16px 0;">पासवर्ड रिसेट गर्नुहोस्</a>
<p style="color:#666;font-size:13px;">लिङ्कको म्याद १ घण्टामा समाप्त हुन्छ। यदि तपाईंले यो अनुरोध गर्नुभएको होइन भने, यो इमेललाई बेवास्ता गर्नुहोस्।</p>
<hr style="border:none;border-top:1px solid #ddd;margin:16px 0;">
<p style="color:#999;font-size:12px;">श्रम जागरण | कोटेश्वर-३२, काठमाडौं, नेपाल</p>
</div>
</body>
</html>`, appName, resetLink)
}

func (s *Sender) FromAddress() string { return s.cfg.From }

func (s *Sender) VerificationOTPHTML(code, appName string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;padding:24px;max-width:560px;margin:0 auto;">
<div style="background:#f5f5f5;border-radius:8px;padding:32px;text-align:center;">
<h2 style="margin:0 0 16px;color:#d32f2f;">%s</h2>
<p style="font-size:16px;color:#333;">तपाईंको इमेल प्रमाणीकरण कोड</p>
<div style="background:#fff;border-radius:8px;padding:24px;margin:16px 0;font-size:36px;font-weight:bold;letter-spacing:8px;color:#d32f2f;">%s</div>
<p style="color:#666;font-size:13px;">यो कोड १० मिनेटमा समाप्त हुन्छ। यदि तपाईंले खाता सिर्जना गर्नुभएको होइन भने, यो इमेललाई बेवास्ता गर्नुहोस्।</p>
<hr style="border:none;border-top:1px solid #ddd;margin:16px 0;">
<p style="color:#999;font-size:12px;">श्रम जागरण | कोटेश्वर-३२, काठमाडौं, नेपाल</p>
</div>
</body>
</html>`, appName, code)
}

func BuildResetLink(frontendURL, token, locale string) string {
	frontendURL = strings.TrimRight(frontendURL, "/")
	return fmt.Sprintf("%s/%s/reset-password?token=%s", frontendURL, locale, token)
}
