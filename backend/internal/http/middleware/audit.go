package middleware

import (
	"bytes"
	"io"

	"github.com/gin-gonic/gin"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
)

func Audit(auditRepo repository.AuditLogRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		if c.Request.Method == "GET" || c.Writer.Status() >= 400 {
			return
		}
		uid, _ := c.Get(CtxUserID)
		userID, _ := uid.(string)
		var userPtr *string
		if userID != "" {
			userPtr = &userID
		}
		var meta []byte
		if c.Request.Body != nil && c.Request.Method != "GET" {
			body, _ := io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(body))
			if len(body) > 0 && len(body) < 4096 {
				meta = body
			}
		}
		ip := c.ClientIP()
		ua := c.Request.UserAgent()
		log := &entity.AuditLog{
			UserID:    userPtr,
			Action:    c.Request.Method,
			Resource:  fullPath(c),
			IP:        &ip,
			UserAgent: &ua,
			Metadata:  meta,
		}
		_ = auditRepo.Create(c.Request.Context(), log)
	}
}

func fullPath(c *gin.Context) string {
	if c.FullPath() != "" {
		return c.FullPath()
	}
	return c.Request.URL.Path
}
