package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
)

type communicationLogRepo struct{ pool *pgxpool.Pool }

func NewCommunicationLogRepository(p *pgxpool.Pool) repository.CommunicationLogRepository {
	return &communicationLogRepo{pool: p}
}

const commLogColumns = `id,member_id,logged_by,channel,subject,notes,occurred_at,created_at`

func (r *communicationLogRepo) Create(ctx context.Context, l *entity.CommunicationLog) error {
	const q = `INSERT INTO member_communication_logs (member_id,logged_by,channel,subject,notes,occurred_at)
		VALUES ($1,$2,$3,$4,$5,COALESCE($6, NOW())) RETURNING id,occurred_at,created_at`
	var occurredAt any
	if !l.OccurredAt.IsZero() {
		occurredAt = l.OccurredAt
	}
	return r.pool.QueryRow(ctx, q, l.MemberID, l.LoggedBy, l.Channel, l.Subject, l.Notes, occurredAt).
		Scan(&l.ID, &l.OccurredAt, &l.CreatedAt)
}

func (r *communicationLogRepo) ListByMember(ctx context.Context, memberID string, page, pageSize int) ([]entity.CommunicationLog, int, error) {
	var total int
	if err := r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM member_communication_logs WHERE member_id=$1`, memberID).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := r.pool.Query(ctx, `SELECT `+commLogColumns+` FROM member_communication_logs WHERE member_id=$1 ORDER BY occurred_at DESC LIMIT $2 OFFSET $3`,
		memberID, pageSize, (page-1)*pageSize)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.CommunicationLog, 0, pageSize)
	for rows.Next() {
		l := entity.CommunicationLog{}
		if err := rows.Scan(&l.ID, &l.MemberID, &l.LoggedBy, &l.Channel, &l.Subject, &l.Notes, &l.OccurredAt, &l.CreatedAt); err != nil {
			return nil, 0, err
		}
		out = append(out, l)
	}
	return out, total, nil
}
