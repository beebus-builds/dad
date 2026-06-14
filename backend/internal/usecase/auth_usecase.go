package usecase

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"math/big"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/rbac"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
	"github.com/shramjagaran/cms-backend/pkg/jwt"
	"github.com/shramjagaran/cms-backend/pkg/logger"
	"github.com/shramjagaran/cms-backend/pkg/mail"
	"github.com/shramjagaran/cms-backend/pkg/password"
	"github.com/shramjagaran/cms-backend/pkg/validator"
	"go.uber.org/zap"
)

type Mailer interface {
	SendHTML(to, subject, html string) error
	PasswordResetHTML(to, resetLink, appName string) string
	VerificationOTPHTML(code, appName string) string
}

type AuthService struct {
	users       repository.UserRepository
	audit       repository.AuditLogRepository
	tokens      repository.PasswordResetTokenRepository
	codes       repository.VerificationCodeRepository
	jwtMgr      *jwt.Manager
	mailer      Mailer
	frontendURL string
	appName     string
}

func NewAuthService(u repository.UserRepository, a repository.AuditLogRepository, t repository.PasswordResetTokenRepository, c repository.VerificationCodeRepository, j *jwt.Manager) *AuthService {
	return &AuthService{users: u, audit: a, tokens: t, codes: c, jwtMgr: j}
}

func (s *AuthService) SetJWTManager(j *jwt.Manager) { s.jwtMgr = j }

func (s *AuthService) SetMailer(m Mailer, frontendURL, appName string) {
	s.mailer = m
	s.frontendURL = frontendURL
	s.appName = appName
}

func (s *AuthService) SetTokenRepo(t repository.PasswordResetTokenRepository) {
	s.tokens = t
}

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

type RegisterResult struct {
	UserID string `json:"userId"`
	Email  string `json:"email"`
	Message string `json:"message"`
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

func (s *AuthService) Register(ctx context.Context, in RegisterInput) (*RegisterResult, error) {
	if !validator.IsPhone(in.Phone) {
		return nil, apperror.New(422, "VALIDATION", "invalid phone number")
	}
	if !validator.IsStrongPassword(in.Password) {
		return nil, apperror.New(422, "VALIDATION", "password must be 8+ chars with uppercase and number")
	}

	email := strings.ToLower(in.Email)
	existing, _ := s.users.GetByEmail(ctx, email)

	// If email exists and is already verified, reject
	if existing != nil && existing.EmailVerifiedAt != nil {
		return nil, apperror.New(409, "CONFLICT", "email already registered")
	}

	// If email exists but is unverified, update the record and resend OTP
	if existing != nil {
		hash, err := password.Hash(in.Password)
		if err != nil {
			return nil, err
		}
		existing.FullName = in.FullName
		existing.Phone = &in.Phone
		if err := s.users.Update(ctx, existing.ID, existing); err != nil {
			return nil, err
		}
		if err := s.users.UpdatePassword(ctx, existing.ID, hash); err != nil {
			return nil, err
		}
		if err := s.sendVerificationOTP(ctx, existing.ID, existing.Email); err != nil {
			logger.L.Error("send verification otp failed", zap.String("email", existing.Email), zap.Error(err))
		}
		_ = s.audit.Create(ctx, &entity.AuditLog{
			UserID: &existing.ID, Action: "REGISTER", Resource: "User",
			ResourceID: &existing.ID,
		})
		msg := "verification code sent to email"
		if s.mailer == nil {
			msg = "account exists — email verification unavailable (SMTP not configured)"
		}
		return &RegisterResult{UserID: existing.ID, Email: existing.Email, Message: msg}, nil
	}

	hash, err := password.Hash(in.Password)
	if err != nil {
		return nil, err
	}
	u := &entity.User{
		ID:           uuid.NewString(),
		Email:        email,
		PasswordHash: hash,
		FullName:     in.FullName,
		Phone:        &in.Phone,
		Role:         entity.RoleMember,
		IsActive:     false,
	}
	if err := s.users.Create(ctx, u); err != nil {
		return nil, err
	}
	if err := s.sendVerificationOTP(ctx, u.ID, u.Email); err != nil {
		logger.L.Error("send verification otp failed", zap.String("email", u.Email), zap.Error(err))
	}
	_ = s.audit.Create(ctx, &entity.AuditLog{
		UserID: &u.ID, Action: "REGISTER", Resource: "User",
		ResourceID: &u.ID,
	})
	msg := "verification code sent to email"
	if s.mailer == nil {
		msg = "account created — email verification unavailable (SMTP not configured)"
	}
	return &RegisterResult{UserID: u.ID, Email: u.Email, Message: msg}, nil
}

func (s *AuthService) sendVerificationOTP(ctx context.Context, userID, email string) error {
	if s.codes == nil || s.mailer == nil {
		return apperror.New(500, "CONFIG", "email verification is not configured")
	}
	code, err := generateOTP()
	if err != nil {
		return err
	}
	if err := s.codes.DeleteByUserID(ctx, userID, "EMAIL_VERIFICATION"); err != nil {
		return err
	}
	v := &entity.VerificationCode{
		ID:        uuid.NewString(),
		UserID:    userID,
		Code:      code,
		Type:      "EMAIL_VERIFICATION",
		ExpiresAt: time.Now().Add(10 * time.Minute),
	}
	if err := s.codes.Create(ctx, v); err != nil {
		return err
	}
	html := s.mailer.VerificationOTPHTML(code, s.appName)
	return s.mailer.SendHTML(email, "श्रम जागरण — तपाईंको इमेल प्रमाणित गर्नुहोस्", html)
}

func generateOTP() (string, error) {
	code := make([]byte, 6)
	for i := range code {
		n, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", fmt.Errorf("generate otp: %w", err)
		}
		code[i] = byte('0') + byte(n.Int64())
	}
	return string(code), nil
}

type VerifyEmailInput struct {
	UserID string `json:"userId" binding:"required"`
	Code   string `json:"code" binding:"required,len=6"`
}

func (s *AuthService) VerifyEmail(ctx context.Context, in VerifyEmailInput) (*AuthResult, error) {
	if s.codes == nil {
		return nil, apperror.New(500, "CONFIG", "email verification is not configured")
	}
	v, err := s.codes.GetByUserIDAndCode(ctx, in.UserID, in.Code, "EMAIL_VERIFICATION")
	if err != nil {
		return nil, apperror.New(400, "INVALID_CODE", "verification code is invalid or expired")
	}
	if v.UsedAt != nil {
		return nil, apperror.New(400, "CODE_USED", "verification code has already been used")
	}
	if time.Now().After(v.ExpiresAt) {
		return nil, apperror.New(400, "CODE_EXPIRED", "verification code has expired")
	}
	if err := s.codes.MarkUsed(ctx, v.ID); err != nil {
		return nil, err
	}
	if err := s.users.MarkEmailVerified(ctx, in.UserID); err != nil {
		return nil, err
	}
	u, err := s.users.GetByID(ctx, in.UserID)
	if err != nil {
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
	_ = s.audit.Create(ctx, &entity.AuditLog{
		UserID: &u.ID, Action: "EMAIL_VERIFIED", Resource: "User",
		ResourceID: &u.ID,
	})
	return &AuthResult{User: u, AccessToken: access, RefreshToken: refresh}, nil
}

func (s *AuthService) ResendOTP(ctx context.Context, userID string) error {
	u, err := s.users.GetByID(ctx, userID)
	if err != nil {
		return apperror.New(404, "NOT_FOUND", "user not found")
	}
	if u.EmailVerifiedAt != nil {
		return apperror.New(400, "ALREADY_VERIFIED", "email is already verified")
	}
	return s.sendVerificationOTP(ctx, u.ID, u.Email)
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
	lower := strings.ToLower(email)
	u, err := s.users.GetByEmail(ctx, lower)
	if err != nil {
		return nil
	}
	if u.IsActive == false {
		return nil
	}
	if s.tokens == nil || s.mailer == nil {
		return nil
	}

	raw, err := generateResetToken()
	if err != nil {
		return nil
	}
	hash := hashToken(raw)
	expiresAt := time.Now().Add(1 * time.Hour)

	if err := s.tokens.Create(ctx, u.ID, hash, expiresAt); err != nil {
		return nil
	}

	locale := "ne"
	resetLink := mail.BuildResetLink(s.frontendURL, raw, locale)
	html := s.mailer.PasswordResetHTML(lower, resetLink, s.appName)
	_ = s.mailer.SendHTML(lower, "श्रम जागरण — पासवर्ड रिसेट", html)
	return nil
}

func (s *AuthService) ResetPassword(ctx context.Context, rawToken, newPassword string) error {
	if s.tokens == nil {
		return apperror.New(500, "CONFIG", "password reset is not configured")
	}
	if !validator.IsStrongPassword(newPassword) {
		return apperror.New(422, "VALIDATION", "password must be 8+ chars with uppercase and number")
	}
	hash := hashToken(rawToken)
	tok, err := s.tokens.GetByTokenHash(ctx, hash)
	if err != nil {
		return apperror.New(400, "INVALID_TOKEN", "reset token is invalid or expired")
	}
	if tok.UsedAt != nil {
		return apperror.New(400, "TOKEN_USED", "reset token has already been used")
	}
	if time.Now().After(tok.ExpiresAt) {
		return apperror.New(400, "TOKEN_EXPIRED", "reset token has expired")
	}
	newHash, err := password.Hash(newPassword)
	if err != nil {
		return apperror.New(500, "INTERNAL", "failed to process password")
	}
	if err := s.users.UpdatePassword(ctx, tok.UserID, newHash); err != nil {
		return err
	}
	if err := s.tokens.MarkUsed(ctx, tok.ID); err != nil {
		return err
	}
	_ = s.audit.Create(ctx, &entity.AuditLog{
		UserID: &tok.UserID, Action: "PASSWORD_RESET", Resource: "User",
		ResourceID: &tok.UserID,
	})
	return nil
}

func generateResetToken() (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("generate token: %w", err)
	}
	return hex.EncodeToString(buf), nil
}

func hashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
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

type CreateUserInput struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
	Role     string `json:"role"`
	BranchID string `json:"branchId"`
}

func (s *AuthService) CreateUser(ctx context.Context, in CreateUserInput) (*entity.User, error) {
	if strings.TrimSpace(in.FullName) == "" || strings.TrimSpace(in.Email) == "" {
		return nil, apperror.New(422, "VALIDATION", "fullName and email are required")
	}
	existing, _ := s.users.GetByEmail(ctx, strings.ToLower(in.Email))
	if existing != nil {
		return nil, apperror.New(409, "CONFLICT", "email already in use")
	}
	hash, err := password.Hash(in.Password)
	if err != nil {
		return nil, err
	}
	branchPtr := strPtr(in.BranchID)
	u := &entity.User{
		ID:           uuid.NewString(),
		Email:        strings.ToLower(in.Email),
		PasswordHash: hash,
		FullName:     in.FullName,
		Phone:        strPtr(in.Phone),
		Role:         in.Role,
		BranchID:     branchPtr,
		IsActive:     true,
	}
	if err := s.users.Create(ctx, u); err != nil {
		return nil, err
	}
	return u, nil
}

type UpdateUserInput struct {
	FullName *string `json:"fullName"`
	Phone    *string `json:"phone"`
	Role     *string `json:"role"`
	BranchID *string `json:"branchId"`
	IsActive *bool   `json:"isActive"`
}

func (s *AuthService) UpdateUser(ctx context.Context, id string, in UpdateUserInput) (*entity.User, error) {
	u, err := s.users.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if in.FullName != nil {
		u.FullName = *in.FullName
	}
	if in.Phone != nil {
		u.Phone = in.Phone
	}
	if in.Role != nil {
		u.Role = *in.Role
	}
	if in.BranchID != nil {
		u.BranchID = in.BranchID
	}
	if in.IsActive != nil {
		u.IsActive = *in.IsActive
	}
	if err := s.users.Update(ctx, id, u); err != nil {
		return nil, err
	}
	return u, nil
}

func (s *AuthService) DeactivateUser(ctx context.Context, id string) error {
	return s.users.Deactivate(ctx, id)
}

func (s *AuthService) ListUsers(ctx context.Context, opts repository.ListUsersOptions) ([]entity.User, int, error) {
	return s.users.List(ctx, opts)
}

var _ = time.Now
