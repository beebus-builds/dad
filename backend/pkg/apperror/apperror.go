package apperror

import (
	"errors"
	"fmt"
	"net/http"
)

type Error struct {
	Code    string
	Message string
	Status  int
	Cause   error
}

func (e *Error) Error() string {
	if e.Cause != nil {
		return fmt.Sprintf("%s: %s: %v", e.Code, e.Message, e.Cause)
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

func (e *Error) Unwrap() error { return e.Cause }

func New(status int, code, message string) *Error {
	return &Error{Status: status, Code: code, Message: message}
}

func Wrap(status int, code, message string, cause error) *Error {
	return &Error{Status: status, Code: code, Message: message, Cause: cause}
}

var (
	ErrNotFound        = New(http.StatusNotFound, "NOT_FOUND", "resource not found")
	ErrUnauthorized    = New(http.StatusUnauthorized, "UNAUTHORIZED", "authentication required")
	ErrForbidden       = New(http.StatusForbidden, "FORBIDDEN", "permission denied")
	ErrBadRequest      = New(http.StatusBadRequest, "BAD_REQUEST", "invalid request")
	ErrConflict        = New(http.StatusConflict, "CONFLICT", "resource already exists")
	ErrInternal        = New(http.StatusInternalServerError, "INTERNAL", "internal server error")
	ErrValidation      = New(http.StatusUnprocessableEntity, "VALIDATION", "validation failed")
	ErrTooManyRequests = New(http.StatusTooManyRequests, "RATE_LIMIT", "too many requests")
)

func As(err error) (*Error, bool) {
	var e *Error
	if errors.As(err, &e) {
		return e, true
	}
	return nil, false
}
