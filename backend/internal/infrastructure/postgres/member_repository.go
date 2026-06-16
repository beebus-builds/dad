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

type memberRepo struct{ pool *pgxpool.Pool }

func NewMemberRepository(p *pgxpool.Pool) repository.MemberRepository { return &memberRepo{pool: p} }

const memberColumns = `id,membership_number,user_id,full_name,full_name_nepali,email,phone,date_of_birth,gender,
	citizenship_number,occupation,employer,address,branch_id,tier,status,joined_at,expires_at,avatar_url,created_at,updated_at`

func scanMember(m *entity.Member, row pgx.Row) error {
	return row.Scan(
		&m.ID, &m.MembershipNumber, &m.UserID, &m.FullName, &m.FullNameNepali, &m.Email, &m.Phone,
		&m.DateOfBirth, &m.Gender, &m.CitizenshipNumber, &m.Occupation, &m.Employer, &m.Address,
		&m.BranchID, &m.Tier, &m.Status, &m.JoinedAt, &m.ExpiresAt, &m.AvatarURL, &m.CreatedAt, &m.UpdatedAt,
	)
}

func (r *memberRepo) Create(ctx context.Context, m *entity.Member) error {
	const q = `INSERT INTO members (membership_number,user_id,full_name,full_name_nepali,email,phone,date_of_birth,gender,
		citizenship_number,occupation,employer,address,branch_id,tier,status,joined_at,expires_at,avatar_url)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
		RETURNING id,created_at,updated_at`
	return r.pool.QueryRow(ctx, q,
		m.MembershipNumber, m.UserID, m.FullName, m.FullNameNepali, m.Email, m.Phone, m.DateOfBirth, m.Gender,
		m.CitizenshipNumber, m.Occupation, m.Employer, m.Address, m.BranchID, m.Tier, m.Status, m.JoinedAt, m.ExpiresAt, m.AvatarURL,
	).Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)
}

func (r *memberRepo) GetByID(ctx context.Context, id string) (*entity.Member, error) {
	m := &entity.Member{}
	err := scanMember(m, r.pool.QueryRow(ctx, `SELECT `+memberColumns+` FROM members WHERE id=$1 AND deleted_at IS NULL`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return m, err
}

func (r *memberRepo) GetByMembershipNumber(ctx context.Context, num string) (*entity.Member, error) {
	m := &entity.Member{}
	err := scanMember(m, r.pool.QueryRow(ctx, `SELECT `+memberColumns+` FROM members WHERE membership_number=$1 AND deleted_at IS NULL`, num))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return m, err
}

func (r *memberRepo) Update(ctx context.Context, id string, m *entity.Member) error {
	const q = `UPDATE members SET full_name=$2,full_name_nepali=$3,email=$4,phone=$5,date_of_birth=$6,gender=$7,
		citizenship_number=$8,occupation=$9,employer=$10,address=$11,branch_id=$12,tier=$13,status=$14,
		expires_at=$15,avatar_url=$16,updated_at=NOW() WHERE id=$1`
	_, err := r.pool.Exec(ctx, q, id, m.FullName, m.FullNameNepali, m.Email, m.Phone, m.DateOfBirth, m.Gender,
		m.CitizenshipNumber, m.Occupation, m.Employer, m.Address, m.BranchID, m.Tier, m.Status,
		m.ExpiresAt, m.AvatarURL)
	return err
}

func (r *memberRepo) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM members WHERE id=$1`, id)
	return err
}

func (r *memberRepo) List(ctx context.Context, opts repository.ListMembersOptions) ([]entity.Member, int, error) {
	conds := []string{"deleted_at IS NULL"}
	args := []any{}
	if opts.Search != "" {
		args = append(args, "%"+opts.Search+"%")
		conds = append(conds, fmt.Sprintf("(full_name ILIKE $%d OR membership_number ILIKE $%d OR phone ILIKE $%d)", len(args), len(args), len(args)))
	}
	if opts.BranchID != "" {
		args = append(args, opts.BranchID)
		conds = append(conds, fmt.Sprintf("branch_id=$%d", len(args)))
	}
	if opts.Status != "" {
		args = append(args, opts.Status)
		conds = append(conds, fmt.Sprintf("status=$%d", len(args)))
	}
	if opts.Tier != "" {
		args = append(args, opts.Tier)
		conds = append(conds, fmt.Sprintf("tier=$%d", len(args)))
	}
	where := "WHERE " + strings.Join(conds, " AND ")

	var total int
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM members "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	args = append(args, opts.PageSize, (opts.Page-1)*opts.PageSize)
	q := fmt.Sprintf("SELECT %s FROM members %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d",
		memberColumns, where, len(args)-1, len(args))
	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.Member, 0, opts.PageSize)
	for rows.Next() {
		m := entity.Member{}
		if err := scanMember(&m, rows); err != nil {
			return nil, 0, err
		}
		out = append(out, m)
	}
	return out, total, nil
}
