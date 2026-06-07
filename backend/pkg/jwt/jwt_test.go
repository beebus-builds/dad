package jwt

import (
	"strings"
	"testing"
	"time"
)

const testSecret = "test-secret-key-must-be-at-least-32-chars-long-xx"

func newTestManager() *Manager {
	return NewManager(testSecret, 15*time.Minute, 24*time.Hour, "shram-jagaran-test")
}

func TestGenerateAndParseAccessToken(t *testing.T) {
	m := newTestManager()
	tok, exp, err := m.Generate("user-1", "user@example.com", "MEMBER", "branch-1", []string{"member.read"}, "access")
	if err != nil {
		t.Fatalf("Generate failed: %v", err)
	}
	if tok == "" {
		t.Fatal("expected non-empty token")
	}
	if exp.IsZero() {
		t.Fatal("expected non-zero expiry")
	}
	parts := strings.Split(tok, ".")
	if len(parts) != 3 {
		t.Fatalf("expected 3-part JWT, got %d parts", len(parts))
	}
	claims, err := m.Parse(tok)
	if err != nil {
		t.Fatalf("Parse failed: %v", err)
	}
	if claims.UserID != "user-1" {
		t.Errorf("UserID = %q, want user-1", claims.UserID)
	}
	if claims.Email != "user@example.com" {
		t.Errorf("Email = %q, want user@example.com", claims.Email)
	}
	if claims.Role != "MEMBER" {
		t.Errorf("Role = %q, want MEMBER", claims.Role)
	}
	if claims.BranchID != "branch-1" {
		t.Errorf("BranchID = %q, want branch-1", claims.BranchID)
	}
	if claims.Type != "access" {
		t.Errorf("Type = %q, want access", claims.Type)
	}
	if len(claims.Permissions) != 1 || claims.Permissions[0] != "member.read" {
		t.Errorf("Permissions = %v, want [member.read]", claims.Permissions)
	}
	if claims.Issuer != "shram-jagaran-test" {
		t.Errorf("Issuer = %q, want shram-jagaran-test", claims.Issuer)
	}
}

func TestGenerateRefreshTokenHasLongerExpiry(t *testing.T) {
	m := newTestManager()
	_, accessExp, _ := m.Generate("u", "u@x.com", "MEMBER", "", nil, "access")
	_, refreshExp, _ := m.Generate("u", "u@x.com", "MEMBER", "", nil, "refresh")
	if !refreshExp.After(accessExp) {
		t.Errorf("refresh expiry %v should be after access expiry %v", refreshExp, accessExp)
	}
}

func TestParseRejectsTamperedToken(t *testing.T) {
	m := newTestManager()
	tok, _, _ := m.Generate("u", "u@x.com", "MEMBER", "", nil, "access")
	tampered := tok[:len(tok)-2] + "AA"
	if _, err := m.Parse(tampered); err == nil {
		t.Fatal("expected error for tampered token, got nil")
	}
}

func TestParseRejectsWrongSecret(t *testing.T) {
	m1 := NewManager("secret-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", time.Minute, time.Hour, "iss")
	m2 := NewManager("secret-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", time.Minute, time.Hour, "iss")
	tok, _, _ := m1.Generate("u", "u@x.com", "MEMBER", "", nil, "access")
	if _, err := m2.Parse(tok); err == nil {
		t.Fatal("expected error parsing token with different secret, got nil")
	}
}

func TestParseRejectsExpiredToken(t *testing.T) {
	m := NewManager(testSecret, -1*time.Second, -1*time.Second, "iss")
	tok, _, _ := m.Generate("u", "u@x.com", "MEMBER", "", nil, "access")
	if _, err := m.Parse(tok); err == nil {
		t.Fatal("expected error for expired token, got nil")
	}
}
