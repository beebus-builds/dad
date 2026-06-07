package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
)

type notifRepo struct{ pool *pgxpool.Pool }

func NewNotificationRepository(p *pgxpool.Pool) repository.NotificationRepository { return &notifRepo{pool: p} }

func (r *notifRepo) Create(ctx context.Context, n *entity.Notification) error {
	const q = `INSERT INTO notifications (user_id,title,body,type,link) VALUES ($1,$2,$3,$4,$5) RETURNING id,is_read,created_at`
	return r.pool.QueryRow(ctx, q, n.UserID, n.Title, n.Body, n.Type, n.Link).Scan(&n.ID, &n.IsRead, &n.CreatedAt)
}

func (r *notifRepo) List(ctx context.Context, userID string, limit int) ([]entity.Notification, error) {
	if limit <= 0 {
		limit = 50
	}
	rows, err := r.pool.Query(ctx, `SELECT id,user_id,title,body,type,link,is_read,created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2`, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []entity.Notification{}
	for rows.Next() {
		n := entity.Notification{}
		if err := rows.Scan(&n.ID, &n.UserID, &n.Title, &n.Body, &n.Type, &n.Link, &n.IsRead, &n.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	return out, nil
}

func (r *notifRepo) MarkRead(ctx context.Context, id, userID string) error {
	_, err := r.pool.Exec(ctx, `UPDATE notifications SET is_read=TRUE WHERE id=$1 AND user_id=$2`, id, userID)
	return err
}

func (r *notifRepo) MarkAllRead(ctx context.Context, userID string) error {
	_, err := r.pool.Exec(ctx, `UPDATE notifications SET is_read=TRUE WHERE user_id=$1`, userID)
	return err
}

func (r *notifRepo) UnreadCount(ctx context.Context, userID string) (int, error) {
	var c int
	err := r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM notifications WHERE user_id=$1 AND is_read=FALSE`, userID).Scan(&c)
	return c, err
}

type auditRepo struct{ pool *pgxpool.Pool }

func NewAuditLogRepository(p *pgxpool.Pool) repository.AuditLogRepository { return &auditRepo{pool: p} }

func (r *auditRepo) Create(ctx context.Context, l *entity.AuditLog) error {
	const q = `INSERT INTO audit_logs (user_id,action,resource,resource_id,ip,user_agent,metadata) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,created_at`
	return r.pool.QueryRow(ctx, q, l.UserID, l.Action, l.Resource, l.ResourceID, l.IP, l.UserAgent, l.Metadata).Scan(&l.ID, &l.CreatedAt)
}

func (r *auditRepo) List(ctx context.Context, opts repository.ListAuditOptions) ([]entity.AuditLog, int, error) {
	conds := []string{"1=1"}
	args := []any{}
	if opts.UserID != "" {
		args = append(args, opts.UserID)
		conds = append(conds, fmt.Sprintf("user_id=$%d", len(args)))
	}
	if opts.Resource != "" {
		args = append(args, opts.Resource)
		conds = append(conds, fmt.Sprintf("resource=$%d", len(args)))
	}
	if opts.Action != "" {
		args = append(args, opts.Action)
		conds = append(conds, fmt.Sprintf("action=$%d", len(args)))
	}
	where := "WHERE " + conds[0]
	for i := 1; i < len(conds); i++ {
		where += " AND " + conds[i]
	}
	var total int
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM audit_logs "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	args = append(args, opts.PageSize, (opts.Page-1)*opts.PageSize)
	q := fmt.Sprintf("SELECT id,user_id,action,resource,resource_id,ip,user_agent,metadata,created_at FROM audit_logs %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d", where, len(args)-1, len(args))
	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.AuditLog, 0, opts.PageSize)
	for rows.Next() {
		l := entity.AuditLog{}
		if err := rows.Scan(&l.ID, &l.UserID, &l.Action, &l.Resource, &l.ResourceID, &l.IP, &l.UserAgent, &l.Metadata, &l.CreatedAt); err != nil {
			return nil, 0, err
		}
		out = append(out, l)
	}
	return out, total, nil
}
