package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
	"github.com/shramjagaran/cms-backend/pkg/jwt"
	"github.com/shramjagaran/cms-backend/pkg/response"
)

const (
	CtxClaims = "claims"
	CtxUserID = "userID"
	CtxRole   = "role"
)

func Auth(jm *jwt.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" {
			cookie, err := c.Cookie("sj_token")
			if err == nil {
				header = "Bearer " + cookie
			}
		}
		if header == "" {
			response.Error(c, 401, "UNAUTHORIZED", "missing authorization header")
			return
		}
		parts := strings.SplitN(header, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			response.Error(c, 401, "UNAUTHORIZED", "invalid authorization header")
			return
		}
		claims, err := jm.Parse(parts[1])
		if err != nil {
			response.Error(c, 401, "UNAUTHORIZED", "invalid or expired token")
			return
		}
		if claims.Type != "access" {
			response.Error(c, 401, "UNAUTHORIZED", "wrong token type")
			return
		}
		c.Set(CtxClaims, claims)
		c.Set(CtxUserID, claims.UserID)
		c.Set(CtxRole, claims.Role)
		c.Next()
	}
}

func RequirePerm(perm string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, ok := c.Get(CtxClaims)
		if !ok {
			response.Error(c, 401, "UNAUTHORIZED", "auth required")
			return
		}
		cl, _ := claims.(*jwt.Claims)
		for _, p := range cl.Permissions {
			if p == perm {
				c.Next()
				return
			}
		}
		response.Error(c, 403, "FORBIDDEN", "missing permission: "+perm)
	}
}

func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get(CtxRole)
		s, _ := role.(string)
		for _, r := range roles {
			if r == s {
				c.Next()
				return
			}
		}
		e := apperror.ErrForbidden
		response.Error(c, e.Status, e.Code, "insufficient role")
	}
}

func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				response.Error(c, 500, "INTERNAL", "internal server error")
			}
		}()
		c.Next()
	}
}
