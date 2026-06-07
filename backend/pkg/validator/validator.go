package validator

import (
	"net/mail"
	"regexp"
	"strings"
)

var phoneRegex = regexp.MustCompile(`^\+?\d[\d\s\-]{7,18}$`)

func IsEmail(s string) bool {
	_, err := mail.ParseAddress(s)
	return err == nil
}

func IsPhone(s string) bool {
	return phoneRegex.MatchString(strings.TrimSpace(s))
}

func IsStrongPassword(s string) bool {
	if len(s) < 8 {
		return false
	}
	hasUpper, hasDigit := false, false
	for _, r := range s {
		switch {
		case r >= 'A' && r <= 'Z':
			hasUpper = true
		case r >= '0' && r <= '9':
			hasDigit = true
		}
	}
	return hasUpper && hasDigit
}
