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
	citizenship_number,occupation,employer,address,branch_id,tier,status,joined_at,expires_at,avatar_url,tags,last_renewal_reminder_at,created_at,updated_at`

func scanMember(m *entity.Member, row pgx.Row) error {
	return row.Scan(
		&m.ID, &m.MembershipNumber, &m.UserID, &m.FullName, &m.FullNameNepali, &m.Email, &m.Phone,
		&m.DateOfBirth, &m.Gender, &m.CitizenshipNumber, &m.Occupation, &m.Employer, &m.Address,
		&m.BranchID, &m.Tier, &m.Status, &m.JoinedAt, &m.ExpiresAt, &m.AvatarURL, &m.Tags, &m.LastRenewalReminderAt, &m.CreatedAt, &m.UpdatedAt,
	)
}

func (r *memberRepo) Create(ctx context.Context, m *entity.Member) error {
	const q = `INSERT INTO members (membership_number,user_id,full_name,full_name_nepali,email,phone,date_of_birth,gender,
		citizenship_number,occupation,employer,address,branch_id,tier,status,joined_at,expires_at,avatar_url,tags)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
		RETURNING id,created_at,updated_at`
	if m.Tags == nil {
		m.Tags = []string{}
	}
	return r.pool.QueryRow(ctx, q,
		m.MembershipNumber, m.UserID, m.FullName, m.FullNameNepali, m.Email, m.Phone, m.DateOfBirth, m.Gender,
		m.CitizenshipNumber, m.Occupation, m.Employer, m.Address, m.BranchID, m.Tier, m.Status, m.JoinedAt, m.ExpiresAt, m.AvatarURL, m.Tags,
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
		expires_at=$15,avatar_url=$16,tags=$17,updated_at=NOW() WHERE id=$1`
	if m.Tags == nil {
		m.Tags = []string{}
	}
	_, err := r.pool.Exec(ctx, q, id, m.FullName, m.FullNameNepali, m.Email, m.Phone, m.DateOfBirth, m.Gender,
		m.CitizenshipNumber, m.Occupation, m.Employer, m.Address, m.BranchID, m.Tier, m.Status,
		m.ExpiresAt, m.AvatarURL, m.Tags)
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
	} else if len(opts.BranchIDs) > 0 {
		args = append(args, opts.BranchIDs)
		conds = append(conds, fmt.Sprintf("branch_id=ANY($%d)", len(args)))
	}
	if opts.Status != "" {
		args = append(args, opts.Status)
		conds = append(conds, fmt.Sprintf("status=$%d", len(args)))
	}
	if opts.Tier != "" {
		args = append(args, opts.Tier)
		conds = append(conds, fmt.Sprintf("tier=$%d", len(args)))
	}
	if opts.Tag != "" {
		args = append(args, opts.Tag)
		conds = append(conds, fmt.Sprintf("tags @> ARRAY[$%d]::text[]", len(args)))
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

func (r *memberRepo) ListExpiringWithin(ctx context.Context, days int) ([]entity.Member, error) {
	q := fmt.Sprintf(`SELECT %s FROM members
		WHERE deleted_at IS NULL AND status='%s'
		AND expires_at IS NOT NULL AND expires_at BETWEEN NOW() AND NOW() + INTERVAL '%d days'
		AND (last_renewal_reminder_at IS NULL OR last_renewal_reminder_at < NOW() - INTERVAL '1 day')
		ORDER BY expires_at ASC`, memberColumns, entity.MemberStatusActive, days)
	rows, err := r.pool.Query(ctx, q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []entity.Member{}
	for rows.Next() {
		m := entity.Member{}
		if err := scanMember(&m, rows); err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, nil
}

func (r *memberRepo) MarkRenewalReminderSent(ctx context.Context, memberID string) error {
	_, err := r.pool.Exec(ctx, `UPDATE members SET last_renewal_reminder_at = NOW() WHERE id = $1`, memberID)
	return err
}

// timelineFeed is the shared UNION ALL that normalizes every per-member
// interaction source into a common {type, title, ref_id, occurred_at, meta}
// shape, scoped to the member identified by $1 via the `target` CTE.
const timelineFeed = `
	WITH target AS (SELECT id, user_id FROM members WHERE id = $1),
	feed AS (
		SELECT 'COMPLAINT' AS type, cm.title, cm.id::text AS ref_id, cm.created_at AS occurred_at, cm.status AS meta
		FROM complaints cm, target WHERE cm.submitted_by = target.user_id AND cm.deleted_at IS NULL
		UNION ALL
		SELECT 'DONATION', COALESCE(d.purpose, 'Donation'), d.id::text, d.created_at, d.status
		FROM donations d, target WHERE d.member_id = target.id
		UNION ALL
		SELECT 'EVENT', e.title, e.id::text, er.registered_at, er.status
		FROM event_registrations er JOIN events e ON e.id = er.event_id, target WHERE er.member_id = target.id
		UNION ALL
		SELECT 'TRAINING', t.title, t.id::text, tr.registered_at, tr.status
		FROM training_registrations tr JOIN training_programs t ON t.id = tr.training_id, target WHERE tr.member_id = target.id
		UNION ALL
		SELECT 'LEGAL_CASE', lc.title, lc.id::text, lc.filed_at, lc.status
		FROM legal_cases lc, target WHERE lc.member_id = target.id
		UNION ALL
		SELECT 'NOTIFICATION', n.title, n.id::text, n.created_at, n.type
		FROM notifications n, target WHERE n.user_id = target.user_id
		UNION ALL
		SELECT 'COMMUNICATION_LOG', l.subject, l.id::text, l.occurred_at, l.channel
		FROM member_communication_logs l, target WHERE l.member_id = target.id
	)
`

func (r *memberRepo) GetTimeline(ctx context.Context, memberID string, page, pageSize int) ([]entity.TimelineEntry, int, error) {
	var total int
	if err := r.pool.QueryRow(ctx, timelineFeed+`SELECT COUNT(*) FROM feed`, memberID).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := r.pool.Query(ctx, timelineFeed+`SELECT type, title, ref_id, occurred_at, meta FROM feed ORDER BY occurred_at DESC LIMIT $2 OFFSET $3`,
		memberID, pageSize, (page-1)*pageSize)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.TimelineEntry, 0, pageSize)
	for rows.Next() {
		e := entity.TimelineEntry{}
		if err := rows.Scan(&e.Type, &e.Title, &e.RefID, &e.OccurredAt, &e.Meta); err != nil {
			return nil, 0, err
		}
		out = append(out, e)
	}
	return out, total, nil
}
