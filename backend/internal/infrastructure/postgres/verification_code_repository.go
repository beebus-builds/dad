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

type verificationCodeRepo struct{ pool *pgxpool.Pool }

func NewVerificationCodeRepository(p *pgxpool.Pool) repository.VerificationCodeRepository {
	return &verificationCodeRepo{pool: p}
}

func (r *verificationCodeRepo) Create(ctx context.Context, v *entity.VerificationCode) error {
	const q = `INSERT INTO verification_codes (user_id,code,type,expires_at) VALUES ($1,$2,$3,$4) RETURNING id,created_at`
	return r.pool.QueryRow(ctx, q, v.UserID, v.Code, v.Type, v.ExpiresAt).Scan(&v.ID, &v.CreatedAt)
}

func (r *verificationCodeRepo) GetByUserIDAndCode(ctx context.Context, userID, code, codeType string) (*entity.VerificationCode, error) {
	v := &entity.VerificationCode{}
	err := r.pool.QueryRow(ctx,
		`SELECT id,user_id,code,type,expires_at,used_at,created_at FROM verification_codes WHERE user_id=$1 AND code=$2 AND type=$3 AND used_at IS NULL`,
		userID, code, codeType,
	).Scan(&v.ID, &v.UserID, &v.Code, &v.Type, &v.ExpiresAt, &v.UsedAt, &v.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return v, err
}

func (r *verificationCodeRepo) MarkUsed(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `UPDATE verification_codes SET used_at=NOW() WHERE id=$1`, id)
	return err
}

func (r *verificationCodeRepo) DeleteByUserID(ctx context.Context, userID, codeType string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM verification_codes WHERE user_id=$1 AND type=$2`, userID, codeType)
	return err
}

var _ time.Time // keep import
