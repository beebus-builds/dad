package postgres

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
)

type userRepo struct{ pool *pgxpool.Pool }

func NewUserRepository(p *pgxpool.Pool) repository.UserRepository { return &userRepo{pool: p} }

const userColumns = `id,email,password_hash,full_name,phone,avatar_url,role,branch_id,province_code,district_code,is_active,email_verified_at,last_login_at,created_at,updated_at`

func scanUser(u *entity.User, scanner pgx.Row) error {
	return scanner.Scan(
		&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &u.Phone, &u.AvatarURL, &u.Role,
		&u.BranchID, &u.ProvinceCode, &u.DistrictCode, &u.IsActive, &u.EmailVerifiedAt, &u.LastLoginAt, &u.CreatedAt, &u.UpdatedAt,
	)
}

func (r *userRepo) Create(ctx context.Context, u *entity.User) error {
	const q = `INSERT INTO users (email,password_hash,full_name,phone,avatar_url,role,branch_id,province_code,district_code,is_active)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id,created_at,updated_at`
	return r.pool.QueryRow(ctx, q, u.Email, u.PasswordHash, u.FullName, u.Phone, u.AvatarURL, u.Role,
		u.BranchID, u.ProvinceCode, u.DistrictCode, u.IsActive).Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
}

func (r *userRepo) GetByID(ctx context.Context, id string) (*entity.User, error) {
	u := &entity.User{}
	err := scanUser(u, r.pool.QueryRow(ctx, `SELECT `+userColumns+` FROM users WHERE id=$1 AND deleted_at IS NULL`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return u, err
}

func (r *userRepo) GetByEmail(ctx context.Context, email string) (*entity.User, error) {
	u := &entity.User{}
	err := scanUser(u, r.pool.QueryRow(ctx, `SELECT `+userColumns+` FROM users WHERE email=$1 AND deleted_at IS NULL`, email))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return u, err
}

func (r *userRepo) Update(ctx context.Context, id string, u *entity.User) error {
	const q = `UPDATE users SET full_name=$2,phone=$3,avatar_url=$4,role=$5,branch_id=$6,is_active=$7,updated_at=NOW() WHERE id=$1`
	_, err := r.pool.Exec(ctx, q, id, u.FullName, u.Phone, u.AvatarURL, u.Role, u.BranchID, u.IsActive)
	return err
}

func (r *userRepo) UpdatePassword(ctx context.Context, id, passwordHash string) error {
	_, err := r.pool.Exec(ctx, `UPDATE users SET password_hash=$2,updated_at=NOW() WHERE id=$1`, id, passwordHash)
	return err
}

func (r *userRepo) UpdateLastLogin(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `UPDATE users SET last_login_at=NOW() WHERE id=$1`, id)
	return err
}

func (r *userRepo) Deactivate(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `UPDATE users SET is_active=FALSE,updated_at=NOW() WHERE id=$1`, id)
	return err
}

func (r *userRepo) MarkEmailVerified(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `UPDATE users SET email_verified_at=NOW(),is_active=TRUE,updated_at=NOW() WHERE id=$1`, id)
	return err
}

func (r *userRepo) List(ctx context.Context, opts repository.ListUsersOptions) ([]entity.User, int, error) {
	conds := []string{"deleted_at IS NULL"}
	args := []any{}
	if opts.Search != "" {
		args = append(args, "%"+opts.Search+"%")
		conds = append(conds, fmt.Sprintf("(full_name ILIKE $%d OR email ILIKE $%d)", len(args), len(args)))
	}
	if opts.Role != "" {
		args = append(args, opts.Role)
		conds = append(conds, fmt.Sprintf("role=$%d", len(args)))
	}
	if opts.BranchID != "" {
		args = append(args, opts.BranchID)
		conds = append(conds, fmt.Sprintf("branch_id=$%d", len(args)))
	}
	where := "WHERE " + strings.Join(conds, " AND ")

	var total int
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM users "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	args = append(args, opts.PageSize, (opts.Page-1)*opts.PageSize)
	q := fmt.Sprintf("SELECT %s FROM users %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d",
		userColumns, where, len(args)-1, len(args))
	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.User, 0, opts.PageSize)
	for rows.Next() {
		u := entity.User{}
		if err := scanUser(&u, rows); err != nil {
			return nil, 0, err
		}
		out = append(out, u)
	}
	return out, total, nil
}
