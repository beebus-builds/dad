package mail

import (
	"fmt"
	"net/smtp"
	"strings"

	"github.com/shramjagaran/cms-backend/internal/config"
)

type Sender struct {
	cfg config.SMTPConfig
}

func NewSender(cfg config.SMTPConfig) *Sender {
	return &Sender{cfg: cfg}
}

func (s *Sender) Send(to, subject, body string) error {
	auth := smtp.PlainAuth("", s.cfg.User, s.cfg.Pass, s.cfg.Host)
	from := fmt.Sprintf("%s <%s>", s.cfg.FromName, s.cfg.From)
	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n%s\r\n",
		from, to, subject, body)
	addr := fmt.Sprintf("%s:%d", s.cfg.Host, s.cfg.Port)
	return smtp.SendMail(addr, auth, s.cfg.From, []string{to}, []byte(msg))
}

func (s *Sender) SendHTML(to, subject, html string) error {
	auth := smtp.PlainAuth("", s.cfg.User, s.cfg.Pass, s.cfg.Host)
	from := fmt.Sprintf("%s <%s>", s.cfg.FromName, s.cfg.From)
	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s\r\n",
		from, to, subject, html)
	addr := fmt.Sprintf("%s:%d", s.cfg.Host, s.cfg.Port)
	return smtp.SendMail(addr, auth, s.cfg.From, []string{to}, []byte(msg))
}

func (s *Sender) PasswordResetEmail(to, resetLink string) string {
	return fmt.Sprintf(`Dear user,

We received a request to reset your Shram Jagaran account password.

Click the link below to reset your password (expires in 1 hour):
%s

If you did not request this, you can safely ignore this email.

— Shram Jagaran Team`, resetLink)
}

func (s *Sender) PasswordResetHTML(to, resetLink, appName string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;padding:24px;max-width:560px;margin:0 auto;">
<div style="background:#f5f5f5;border-radius:8px;padding:32px;">
<h2 style="margin:0 0 16px;color:#d32f2f;">%s</h2>
<p>We received a request to reset your password.</p>
<a href="%s" style="display:inline-block;background:#d32f2f;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;margin:16px 0;">Reset Password</a>
<p style="color:#666;font-size:13px;">Link expires in 1 hour. If you did not request this, ignore this email.</p>
<hr style="border:none;border-top:1px solid #ddd;margin:16px 0;">
<p style="color:#999;font-size:12px;">Shram Jagaran | Koteshwar-32, Kathmandu, Nepal</p>
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
<p style="font-size:16px;color:#333;">Your email verification code</p>
<div style="background:#fff;border-radius:8px;padding:24px;margin:16px 0;font-size:36px;font-weight:bold;letter-spacing:8px;color:#d32f2f;">%s</div>
<p style="color:#666;font-size:13px;">This code expires in 10 minutes. If you did not create an account, ignore this email.</p>
<hr style="border:none;border-top:1px solid #ddd;margin:16px 0;">
<p style="color:#999;font-size:12px;">Shram Jagaran | Koteshwar-32, Kathmandu, Nepal</p>
</div>
</body>
</html>`, appName, code)
}

func BuildResetLink(frontendURL, token, locale string) string {
	frontendURL = strings.TrimRight(frontendURL, "/")
	return fmt.Sprintf("%s/%s/reset-password?token=%s", frontendURL, locale, token)
}
