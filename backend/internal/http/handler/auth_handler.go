package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/internal/http/middleware"
	"github.com/shramjagaran/cms-backend/internal/usecase"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
	"github.com/shramjagaran/cms-backend/pkg/response"
)

func (h *Handlers) Login(c *gin.Context) {
	var in usecase.LoginInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	res, err := h.Auth.Login(c.Request.Context(), in)
	if err != nil {
		handleErr(c, err)
		return
	}
	setAuthCookies(c, res.AccessToken, res.RefreshToken)
	response.OK(c, res)
}

func (h *Handlers) Register(c *gin.Context) {
	var in usecase.RegisterInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	res, err := h.Auth.Register(c.Request.Context(), in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, res)
}

func (h *Handlers) VerifyEmail(c *gin.Context) {
	var in usecase.VerifyEmailInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	res, err := h.Auth.VerifyEmail(c.Request.Context(), in)
	if err != nil {
		handleErr(c, err)
		return
	}
	setAuthCookies(c, res.AccessToken, res.RefreshToken)
	response.OK(c, res)
}

func (h *Handlers) ResendOTP(c *gin.Context) {
	var body struct{ UserID string `json:"userId" binding:"required"` }
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	if err := h.Auth.ResendOTP(c.Request.Context(), body.UserID); err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, gin.H{"message": "verification code resent"})
}

func (h *Handlers) Logout(c *gin.Context) {
	c.SetCookie("sj_token", "", -1, "/", "", false, true)
	c.SetCookie("sj_refresh", "", -1, "/", "", false, true)
	response.OK(c, gin.H{"message": "logged out"})
}

func (h *Handlers) Refresh(c *gin.Context) {
	var body struct{ RefreshToken string `json:"refreshToken"` }
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	if body.RefreshToken == "" {
		if cookie, err := c.Cookie("sj_refresh"); err == nil {
			body.RefreshToken = cookie
		}
	}
	res, err := h.Auth.Refresh(c.Request.Context(), body.RefreshToken)
	if err != nil {
		handleErr(c, err)
		return
	}
	setAuthCookies(c, res.AccessToken, res.RefreshToken)
	response.OK(c, res)
}

func (h *Handlers) ForgotPassword(c *gin.Context) {
	var body struct{ Email string `json:"email"` }
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	_ = h.Auth.ForgotPassword(c.Request.Context(), body.Email)
	response.OK(c, gin.H{"message": "If the account exists, an email has been sent."})
}

func (h *Handlers) ResetPassword(c *gin.Context) {
	var body struct {
		Token       string `json:"token"`
		NewPassword string `json:"newPassword"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	if err := h.Auth.ResetPassword(c.Request.Context(), body.Token, body.NewPassword); err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, gin.H{"message": "Password has been reset successfully."})
}

func (h *Handlers) Me(c *gin.Context) {
	uid, _ := c.Get(middleware.CtxUserID)
	userID, _ := uid.(string)
	u, err := h.Auth.Me(c.Request.Context(), userID)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, u)
}

func (h *Handlers) ListUsers(c *gin.Context) {
	page, size := listOpts(c)
	opts := repository.ListUsersOptions{
		Page: page, PageSize: size,
		Search:   c.Query("search"),
		Role:     c.Query("role"),
		BranchID: c.Query("branchId"),
	}
	list, total, err := h.Auth.ListUsers(c.Request.Context(), opts)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Paginated(c, list, response.Pagination{
		Page: page, PageSize: size, Total: total, TotalPages: totalPages(total, size),
	})
}

func (h *Handlers) CreateUser(c *gin.Context) {
	var in usecase.CreateUserInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	u, err := h.Auth.CreateUser(c.Request.Context(), in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, u)
}

func (h *Handlers) GetUser(c *gin.Context) {
	u, err := h.Auth.Me(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, u)
}

func (h *Handlers) UpdateUser(c *gin.Context) {
	var in usecase.UpdateUserInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	u, err := h.Auth.UpdateUser(c.Request.Context(), c.Param("id"), in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, u)
}

func (h *Handlers) DeactivateUser(c *gin.Context) {
	if err := h.Auth.DeactivateUser(c.Request.Context(), c.Param("id")); err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, gin.H{"message": "user deactivated"})
}

func (h *Handlers) DeleteUser(c *gin.Context) {
	if err := h.Auth.DeleteUser(c.Request.Context(), c.Param("id")); err != nil {
		handleErr(c, err)
		return
	}
	response.NoContent(c)
}

func (h *Handlers) ListAuditLogs(c *gin.Context) {
	page, size := listOpts(c)
	opts := repository.ListAuditOptions{
		Page: page, PageSize: size,
		UserID:   c.Query("userId"),
		Resource: c.Query("resource"),
		Action:   c.Query("action"),
	}
	list, total, err := h.AuditLog.List(c.Request.Context(), opts)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Paginated(c, list, response.Pagination{
		Page: page, PageSize: size, Total: total, TotalPages: totalPages(total, size),
	})
}

func setAuthCookies(c *gin.Context, access, refresh string) {
	secure := c.Request.TLS != nil
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("sj_token", access, 900, "/", "", secure, true)
	c.SetCookie("sj_refresh", refresh, 604800, "/", "", secure, true)
}

func handleErr(c *gin.Context, err error) {
	if e, ok := apperror.As(err); ok {
		response.Error(c, e.Status, e.Code, e.Message)
		return
	}
	response.Error(c, 500, "INTERNAL", err.Error())
}

func totalPages(total, pageSize int) int {
	if pageSize <= 0 {
		return 0
	}
	pages := total / pageSize
	if total%pageSize > 0 {
		pages++
	}
	return pages
}

func listOpts(c *gin.Context) (int, int) {
	page := atoiDefault(c.Query("page"), 1)
	size := atoiDefault(c.Query("pageSize"), 20)
	if size > 100 {
		size = 100
	}
	return page, size
}

func atoiDefault(s string, def int) int {
	if s == "" {
		return def
	}
	n := 0
	for _, r := range s {
		if r < '0' || r > '9' {
			return def
		}
		n = n*10 + int(r-'0')
	}
	if n == 0 {
		return def
	}
	return n
}

func buildListOpts(c *gin.Context, page, size int) repository.ListMembersOptions {
	return repository.ListMembersOptions{
		Page: page, PageSize: size,
		Search:   c.Query("search"),
		BranchID: c.Query("branchId"),
		Status:   c.Query("status"),
		Tier:     c.Query("tier"),
	}
}
