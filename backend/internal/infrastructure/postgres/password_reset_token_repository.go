package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
)

type passwordResetTokenRepo struct{ pool *pgxpool.Pool }

func NewPasswordResetTokenRepository(p *pgxpool.Pool) repository.PasswordResetTokenRepository {
	return &passwordResetTokenRepo{pool: p}
}

func (r *passwordResetTokenRepo) Create(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		userID, tokenHash, expiresAt)
	return err
}

func (r *passwordResetTokenRepo) GetByTokenHash(ctx context.Context, hash string) (*entity.PasswordResetToken, error) {
	t := &entity.PasswordResetToken{}
	err := r.pool.QueryRow(ctx,
		`SELECT id, user_id, token_hash, expires_at, used_at, created_at FROM password_reset_tokens WHERE token_hash = $1`,
		hash).Scan(&t.ID, &t.UserID, &t.TokenHash, &t.ExpiresAt, &t.UsedAt, &t.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return t, err
}

func (r *passwordResetTokenRepo) MarkUsed(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`, id)
	return err
}
