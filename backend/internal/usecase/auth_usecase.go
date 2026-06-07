package usecase

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/rbac"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
	"github.com/shramjagaran/cms-backend/pkg/jwt"
	"github.com/shramjagaran/cms-backend/pkg/password"
	"github.com/shramjagaran/cms-backend/pkg/validator"
)

type AuthService struct {
	users   repository.UserRepository
	audit   repository.AuditLogRepository
	jwtMgr  *jwt.Manager
}

func NewAuthService(u repository.UserRepository, a repository.AuditLogRepository, j *jwt.Manager) *AuthService {
	return &AuthService{users: u, audit: a, jwtMgr: j}
}

func (s *AuthService) SetJWTManager(j *jwt.Manager) { s.jwtMgr = j }

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type RegisterInput struct {
	FullName string `json:"fullName" binding:"required,min=2"`
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
}

type AuthResult struct {
	User         *entity.User `json:"user"`
	AccessToken  string       `json:"accessToken"`
	RefreshToken string       `json:"refreshToken"`
}

func (s *AuthService) Login(ctx context.Context, in LoginInput) (*AuthResult, error) {
	u, err := s.users.GetByEmail(ctx, strings.ToLower(in.Email))
	if err != nil {
		if errors.Is(err, apperror.ErrNotFound) {
			return nil, apperror.New(401, "INVALID_CREDENTIALS", "invalid email or password")
		}
		return nil, err
	}
	if !u.IsActive {
		return nil, apperror.New(403, "ACCOUNT_DISABLED", "account is disabled")
	}
	if !password.Verify(u.PasswordHash, in.Password) {
		return nil, apperror.New(401, "INVALID_CREDENTIALS", "invalid email or password")
	}
	_ = s.users.UpdateLastLogin(ctx, u.ID)
	perms := rbac.PermissionsForRole(u.Role)
	access, _, err := s.jwtMgr.Generate(u.ID, u.Email, u.Role, derefStr(u.BranchID), perms, "access")
	if err != nil {
		return nil, err
	}
	refresh, _, err := s.jwtMgr.Generate(u.ID, u.Email, u.Role, derefStr(u.BranchID), perms, "refresh")
	if err != nil {
		return nil, err
	}
	return &AuthResult{User: u, AccessToken: access, RefreshToken: refresh}, nil
}

func (s *AuthService) Register(ctx context.Context, in RegisterInput) (*AuthResult, error) {
	if !validator.IsPhone(in.Phone) {
		return nil, apperror.New(422, "VALIDATION", "invalid phone number")
	}
	if !validator.IsStrongPassword(in.Password) {
		return nil, apperror.New(422, "VALIDATION", "password must be 8+ chars with uppercase and number")
	}
	existing, _ := s.users.GetByEmail(ctx, strings.ToLower(in.Email))
	if existing != nil {
		return nil, apperror.New(409, "CONFLICT", "email already registered")
	}
	hash, err := password.Hash(in.Password)
	if err != nil {
		return nil, err
	}
	u := &entity.User{
		ID:           uuid.NewString(),
		Email:        strings.ToLower(in.Email),
		PasswordHash: hash,
		FullName:     in.FullName,
		Phone:        &in.Phone,
		Role:         entity.RoleMember,
		IsActive:     true,
	}
	if err := s.users.Create(ctx, u); err != nil {
		return nil, err
	}
	perms := rbac.PermissionsForRole(u.Role)
	access, _, err := s.jwtMgr.Generate(u.ID, u.Email, u.Role, "", perms, "access")
	if err != nil {
		return nil, err
	}
	refresh, _, err := s.jwtMgr.Generate(u.ID, u.Email, u.Role, "", perms, "refresh")
	if err != nil {
		return nil, err
	}
	return &AuthResult{User: u, AccessToken: access, RefreshToken: refresh}, nil
}

func (s *AuthService) Me(ctx context.Context, userID string) (*entity.User, error) {
	return s.users.GetByID(ctx, userID)
}

func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (*AuthResult, error) {
	claims, err := s.jwtMgr.Parse(refreshToken)
	if err != nil {
		return nil, apperror.New(401, "UNAUTHORIZED", "invalid refresh token")
	}
	if claims.Type != "refresh" {
		return nil, apperror.New(401, "UNAUTHORIZED", "not a refresh token")
	}
	u, err := s.users.GetByID(ctx, claims.UserID)
	if err != nil {
		return nil, apperror.New(401, "UNAUTHORIZED", "user not found")
	}
	perms := rbac.PermissionsForRole(u.Role)
	access, _, err := s.jwtMgr.Generate(u.ID, u.Email, u.Role, derefStr(u.BranchID), perms, "access")
	if err != nil {
		return nil, err
	}
	newRefresh, _, err := s.jwtMgr.Generate(u.ID, u.Email, u.Role, derefStr(u.BranchID), perms, "refresh")
	if err != nil {
		return nil, err
	}
	return &AuthResult{User: u, AccessToken: access, RefreshToken: newRefresh}, nil
}

func (s *AuthService) ForgotPassword(ctx context.Context, email string) error {
	_, _ = s.users.GetByEmail(ctx, strings.ToLower(email))
	return nil
}

func derefStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func (s *AuthService) Logout(_ context.Context, _ string) error {
	return nil
}

var _ = time.Now
