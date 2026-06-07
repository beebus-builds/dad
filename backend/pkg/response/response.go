package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Envelope struct {
	Data  any            `json:"data,omitempty"`
	Meta  any            `json:"meta,omitempty"`
	Error *ErrorEnvelope `json:"error,omitempty"`
}

type ErrorEnvelope struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

type Pagination struct {
	Page       int `json:"page"`
	PageSize   int `json:"pageSize"`
	Total      int `json:"total"`
	TotalPages int `json:"totalPages"`
}

func OK(c *gin.Context, data any) {
	c.JSON(http.StatusOK, Envelope{Data: data})
}

func Created(c *gin.Context, data any) {
	c.JSON(http.StatusCreated, Envelope{Data: data})
}

func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

func Paginated(c *gin.Context, data any, p Pagination) {
	c.JSON(http.StatusOK, Envelope{Data: data, Meta: p})
}

func Error(c *gin.Context, status int, code, message string, details ...any) {
	body := Envelope{Error: &ErrorEnvelope{Code: code, Message: message}}
	if len(details) > 0 {
		body.Error.Details = details[0]
	}
	c.AbortWithStatusJSON(status, body)
}
