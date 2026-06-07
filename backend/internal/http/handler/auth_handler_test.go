package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/http/middleware"
	"github.com/shramjagaran/cms-backend/internal/usecase"
	"github.com/shramjagaran/cms-backend/pkg/jwt"
)

func init() {
	gin.SetMode(gin.TestMode)
}

type authTestEnv struct {
	router *gin.Engine
	svc    *usecase.AuthService
	mgr    *jwt.Manager
	repo   *hStubUserRepo
}

func newAuthTestEnv(t *testing.T) *authTestEnv {
	t.Helper()
	svc, mgr, repo := hNewTestAuthService()

	h := &Handlers{Auth: svc}
	r := gin.New()
	r.POST("/api/v1/auth/login", h.Login)
	r.POST("/api/v1/auth/register", h.Register)
	r.POST("/api/v1/auth/refresh", h.Refresh)
	r.POST("/api/v1/auth/forgot-password", h.ForgotPassword)
	r.POST("/api/v1/auth/logout", h.Logout)

	authed := r.Group("/api/v1")
	authed.Use(middleware.Auth(mgr))
	authed.GET("/auth/me", h.Me)
	return &authTestEnv{router: r, svc: svc, mgr: mgr, repo: repo}
}

func (e *authTestEnv) seed(t *testing.T, email string) *entity.User {
	t.Helper()
	return hSeedUser(e.repo, email)
}

func doJSON(t *testing.T, r http.Handler, method, path string, body any, cookies ...*http.Cookie) *httptest.ResponseRecorder {
	t.Helper()
	var buf bytes.Buffer
	if body != nil {
		if err := json.NewEncoder(&buf).Encode(body); err != nil {
			t.Fatalf("encode body: %v", err)
		}
	}
	req := httptest.NewRequest(method, path, &buf)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	for _, c := range cookies {
		req.AddCookie(c)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestHandler_Login_InvalidJSON(t *testing.T) {
	env := newAuthTestEnv(t)
	w := doJSON(t, env.router, http.MethodPost, "/api/v1/auth/login", map[string]string{"email": "bad"})
	if w.Code != 422 {
		t.Errorf("expected 422, got %d (%s)", w.Code, w.Body.String())
	}
}

func TestHandler_Login_Success(t *testing.T) {
	env := newAuthTestEnv(t)
	env.seed(t, "ram@example.com")

	w := doJSON(t, env.router, http.MethodPost, "/api/v1/auth/login", map[string]string{
		"email": "ram@example.com", "password": "Password1",
	})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d (%s)", w.Code, w.Body.String())
	}
	var resp struct {
		Data usecase.AuthResult `json:"data"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if resp.Data.AccessToken == "" {
		t.Error("expected access token in response")
	}
	if got := w.Result().Cookies(); len(got) < 2 {
		t.Errorf("expected 2 cookies, got %d", len(got))
	}
}

func TestHandler_Login_InvalidCredentials(t *testing.T) {
	env := newAuthTestEnv(t)
	env.seed(t, "ram@example.com")
	w := doJSON(t, env.router, http.MethodPost, "/api/v1/auth/login", map[string]string{
		"email": "ram@example.com", "password": "WrongPass1",
	})
	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestHandler_Register_Success(t *testing.T) {
	env := newAuthTestEnv(t)
	w := doJSON(t, env.router, http.MethodPost, "/api/v1/auth/register", map[string]string{
		"fullName": "Sita Devi", "email": "sita@example.com",
		"phone": "+9779841234567", "password": "SitaPass1",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d (%s)", w.Code, w.Body.String())
	}
}

func TestHandler_Register_ValidationError(t *testing.T) {
	env := newAuthTestEnv(t)
	w := doJSON(t, env.router, http.MethodPost, "/api/v1/auth/register", map[string]string{
		"fullName": "Sita Devi", "email": "sita@example.com",
		"phone": "abc", "password": "GoodPass1",
	})
	if w.Code != http.StatusUnprocessableEntity {
		t.Errorf("expected 422, got %d (%s)", w.Code, w.Body.String())
	}
}

func TestHandler_Me_MissingAuth(t *testing.T) {
	env := newAuthTestEnv(t)
	w := doJSON(t, env.router, http.MethodGet, "/api/v1/auth/me", nil)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestHandler_Me_WithBearerToken(t *testing.T) {
	env := newAuthTestEnv(t)
	u := env.seed(t, "ram@example.com")
	tok, _, _ := env.mgr.Generate(u.ID, u.Email, u.Role, "", []string{"member.read"}, "access")

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	req.Header.Set("Authorization", "Bearer "+tok)
	w := httptest.NewRecorder()
	env.router.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d (%s)", w.Code, w.Body.String())
	}
	var resp struct {
		Data struct {
			ID    string `json:"id"`
			Email string `json:"email"`
		} `json:"data"`
	}
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	if resp.Data.Email != "ram@example.com" {
		t.Errorf("got email %q, want ram@example.com", resp.Data.Email)
	}
}

func TestHandler_Refresh_FromCookie(t *testing.T) {
	env := newAuthTestEnv(t)
	u := env.seed(t, "ram@example.com")
	refresh, _, _ := env.mgr.Generate(u.ID, u.Email, u.Role, "", nil, "refresh")

	ck := &http.Cookie{Name: "sj_refresh", Value: refresh, Expires: time.Now().Add(time.Hour)}
	w := doJSON(t, env.router, http.MethodPost, "/api/v1/auth/refresh", map[string]string{}, ck)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d (%s)", w.Code, w.Body.String())
	}
}

func TestHandler_ForgotPassword_AlwaysOK(t *testing.T) {
	env := newAuthTestEnv(t)
	w := doJSON(t, env.router, http.MethodPost, "/api/v1/auth/forgot-password",
		map[string]string{"email": "ghost@example.com"})
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

func TestHandler_Logout_ClearsCookies(t *testing.T) {
	env := newAuthTestEnv(t)
	w := doJSON(t, env.router, http.MethodPost, "/api/v1/auth/logout", nil)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var count int
	for _, c := range w.Result().Cookies() {
		if c.MaxAge < 0 {
			count++
		}
	}
	if count < 2 {
		t.Errorf("expected at least 2 cleared cookies, got %d", count)
	}
}
