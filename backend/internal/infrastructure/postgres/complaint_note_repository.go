package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
)

type complaintNoteRepo struct{ pool *pgxpool.Pool }

func NewComplaintNoteRepository(p *pgxpool.Pool) repository.ComplaintNoteRepository {
	return &complaintNoteRepo{pool: p}
}

const complaintNoteColumns = `id,complaint_id,user_id,body,is_internal,created_at`

func (r *complaintNoteRepo) Create(ctx context.Context, n *entity.ComplaintNote) error {
	const q = `INSERT INTO complaint_comments (complaint_id,user_id,body,is_internal)
		VALUES ($1,$2,$3,$4) RETURNING id,created_at`
	return r.pool.QueryRow(ctx, q, n.ComplaintID, n.UserID, n.Body, n.IsInternal).Scan(&n.ID, &n.CreatedAt)
}

func (r *complaintNoteRepo) ListByComplaint(ctx context.Context, complaintID string) ([]entity.ComplaintNote, error) {
	rows, err := r.pool.Query(ctx, `SELECT `+complaintNoteColumns+` FROM complaint_comments WHERE complaint_id=$1 ORDER BY created_at ASC`, complaintID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []entity.ComplaintNote{}
	for rows.Next() {
		n := entity.ComplaintNote{}
		if err := rows.Scan(&n.ID, &n.ComplaintID, &n.UserID, &n.Body, &n.IsInternal, &n.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	return out, nil
}
