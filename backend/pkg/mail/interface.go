package mail

// Mailer is the provider-agnostic contract for sending email. *Sender (raw
// SMTP) satisfies it today; a Resend-backed implementation can be added
// later behind the same interface without touching call sites.
type Mailer interface {
	Send(to, subject, body string) error
	SendHTML(to, subject, html string) error
}
