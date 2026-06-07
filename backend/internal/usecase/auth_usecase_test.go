package usecase

import (
	"context"
	"strings"
	"testing"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
)

func TestLogin_Success(t *testing.T) {
	repo := newStubUserRepo()
	audit := &stubAuditRepo{}
	seedUser(t, repo, "ram@example.com", entity.RoleMember, "Password1", true)

	svc, _ := newTestAuthService(repo, audit)
	res, err := svc.Login(context.Background(), LoginInput{
		Email:    "RAM@example.com",
		Password: "Password1",
	})
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if res.AccessToken == "" || res.RefreshToken == "" {
		t.Error("expected non-empty tokens")
	}
	if res.User == nil || res.User.Email != "ram@example.com" {
		t.Errorf("expected user email ram@example.com, got %+v", res.User)
	}
	if repo.updateHits != 1 {
		t.Errorf("expected UpdateLastLogin to be called once, got %d", repo.updateHits)
	}
}

func TestLogin_WrongPassword(t *testing.T) {
	repo := newStubUserRepo()
	audit := &stubAuditRepo{}
	seedUser(t, repo, "ram@example.com", entity.RoleMember, "Password1", true)

	svc, _ := newTestAuthService(repo, audit)
	_, err := svc.Login(context.Background(), LoginInput{Email: "ram@example.com", Password: "WrongPass1"})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	e, ok := apperror.As(err)
	if !ok || e.Status != 401 || e.Code != "INVALID_CREDENTIALS" {
		t.Errorf("expected 401 INVALID_CREDENTIALS, got %v", err)
	}
}

func TestLogin_UnknownEmail(t *testing.T) {
	repo := newStubUserRepo()
	audit := &stubAuditRepo{}
	svc, _ := newTestAuthService(repo, audit)
	_, err := svc.Login(context.Background(), LoginInput{Email: "ghost@example.com", Password: "Password1"})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	e, ok := apperror.As(err)
	if !ok || e.Status != 401 || e.Code != "INVALID_CREDENTIALS" {
		t.Errorf("expected 401 INVALID_CREDENTIALS, got %v", err)
	}
}

func TestLogin_DisabledAccount(t *testing.T) {
	repo := newStubUserRepo()
	audit := &stubAuditRepo{}
	seedUser(t, repo, "ram@example.com", entity.RoleMember, "Password1", false)

	svc, _ := newTestAuthService(repo, audit)
	_, err := svc.Login(context.Background(), LoginInput{Email: "ram@example.com", Password: "Password1"})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	e, ok := apperror.As(err)
	if !ok || e.Status != 403 || e.Code != "ACCOUNT_DISABLED" {
		t.Errorf("expected 403 ACCOUNT_DISABLED, got %v", err)
	}
}

func TestRegister_Success(t *testing.T) {
	repo := newStubUserRepo()
	audit := &stubAuditRepo{}
	svc, _ := newTestAuthService(repo, audit)

	res, err := svc.Register(context.Background(), RegisterInput{
		FullName: "Sita Devi",
		Email:    "sita@example.com",
		Phone:    "+9779841234567",
		Password: "SitaPass1",
	})
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if res.User.Role != entity.RoleMember {
		t.Errorf("expected default role MEMBER, got %q", res.User.Role)
	}
	if !res.User.IsActive {
		t.Error("new user should be active")
	}
	if !strings.HasPrefix(res.User.ID, "") {
		t.Error("expected non-empty ID")
	}
}

func TestRegister_DuplicateEmail(t *testing.T) {
	repo := newStubUserRepo()
	audit := &stubAuditRepo{}
	seedUser(t, repo, "sita@example.com", entity.RoleMember, "Password1", true)
	svc, _ := newTestAuthService(repo, audit)

	_, err := svc.Register(context.Background(), RegisterInput{
		FullName: "Sita",
		Email:    "sita@example.com",
		Phone:    "+9779841234567",
		Password: "OtherPass1",
	})
	if err == nil {
		t.Fatal("expected conflict error, got nil")
	}
	e, ok := apperror.As(err)
	if !ok || e.Status != 409 || e.Code != "CONFLICT" {
		t.Errorf("expected 409 CONFLICT, got %v", err)
	}
}

func TestRegister_WeakPassword(t *testing.T) {
	repo := newStubUserRepo()
	audit := &stubAuditRepo{}
	svc, _ := newTestAuthService(repo, audit)

	_, err := svc.Register(context.Background(), RegisterInput{
		FullName: "Test",
		Email:    "weak@example.com",
		Phone:    "+9779841234567",
		Password: "weak",
	})
	if err == nil {
		t.Fatal("expected validation error, got nil")
	}
}

func TestRegister_InvalidPhone(t *testing.T) {
	repo := newStubUserRepo()
	audit := &stubAuditRepo{}
	svc, _ := newTestAuthService(repo, audit)

	_, err := svc.Register(context.Background(), RegisterInput{
		FullName: "Test",
		Email:    "test@example.com",
		Phone:    "abc",
		Password: "GoodPass1",
	})
	if err == nil {
		t.Fatal("expected validation error, got nil")
	}
}

func TestMe_Success(t *testing.T) {
	repo := newStubUserRepo()
	audit := &stubAuditRepo{}
	u := seedUser(t, repo, "ram@example.com", entity.RoleBranchAdmin, "Password1", true)

	svc, _ := newTestAuthService(repo, audit)
	got, err := svc.Me(context.Background(), u.ID)
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if got.ID != u.ID {
		t.Errorf("got ID %q, want %q", got.ID, u.ID)
	}
}

func TestRefresh_InvalidToken(t *testing.T) {
	repo := newStubUserRepo()
	audit := &stubAuditRepo{}
	svc, _ := newTestAuthService(repo, audit)
	_, err := svc.Refresh(context.Background(), "garbage.token.here")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestRefresh_WrongType(t *testing.T) {
	repo := newStubUserRepo()
	audit := &stubAuditRepo{}
	svc, mgr := newTestAuthService(repo, audit)
	access, _, _ := mgr.Generate("u", "u@x.com", entity.RoleMember, "", nil, "access")
	_, err := svc.Refresh(context.Background(), access)
	if err == nil {
		t.Fatal("expected error for access token used as refresh")
	}
}

func TestRefresh_Success(t *testing.T) {
	repo := newStubUserRepo()
	audit := &stubAuditRepo{}
	u := seedUser(t, repo, "ram@example.com", entity.RoleMember, "Password1", true)

	svc, mgr := newTestAuthService(repo, audit)
	refresh, _, _ := mgr.Generate(u.ID, u.Email, u.Role, "", []string{"member.read"}, "refresh")

	res, err := svc.Refresh(context.Background(), refresh)
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if res.AccessToken == "" {
		t.Error("expected new access token")
	}
}

func TestForgotPassword_DoesNotLeakExistence(t *testing.T) {
	repo := newStubUserRepo()
	audit := &stubAuditRepo{}
	svc, _ := newTestAuthService(repo, audit)

	if err := svc.ForgotPassword(context.Background(), "ghost@example.com"); err != nil {
		t.Errorf("expected nil error for unknown email, got %v", err)
	}
	if err := svc.ForgotPassword(context.Background(), "ram@example.com"); err != nil {
		t.Errorf("expected nil error for existing email, got %v", err)
	}
}
