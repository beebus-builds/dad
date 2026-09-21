package repository

import (
	"context"
	"time"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
)

type UserRepository interface {
	Create(ctx context.Context, u *entity.User) error
	GetByID(ctx context.Context, id string) (*entity.User, error)
	GetByEmail(ctx context.Context, email string) (*entity.User, error)
	Update(ctx context.Context, id string, u *entity.User) error
	UpdatePassword(ctx context.Context, id, passwordHash string) error
	List(ctx context.Context, opts ListUsersOptions) ([]entity.User, int, error)
	UpdateLastLogin(ctx context.Context, id string) error
	Deactivate(ctx context.Context, id string) error
	MarkEmailVerified(ctx context.Context, id string) error
	Delete(ctx context.Context, id string) error
}

type ListUsersOptions struct {
	Page     int
	PageSize int
	Search   string
	Role     string
	BranchID string
}

type VerificationCodeRepository interface {
	Create(ctx context.Context, v *entity.VerificationCode) error
	GetByUserIDAndCode(ctx context.Context, userID, code, codeType string) (*entity.VerificationCode, error)
	MarkUsed(ctx context.Context, id string) error
	DeleteByUserID(ctx context.Context, userID, codeType string) error
}

type PasswordResetTokenRepository interface {
	Create(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error
	GetByTokenHash(ctx context.Context, hash string) (*entity.PasswordResetToken, error)
	MarkUsed(ctx context.Context, id string) error
}