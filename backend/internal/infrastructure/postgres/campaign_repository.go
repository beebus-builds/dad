package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
)

type campaignRepo struct{ pool *pgxpool.Pool }

func NewCampaignRepository(p *pgxpool.Pool) repository.CampaignRepository {
	return &campaignRepo{pool: p}
}

const campaignColumns = `id,name,subject,body,segment_filter,scheduled_at,status,sent_at,created_by,created_at,updated_at`

func scanCampaign(c *entity.Campaign, row pgx.Row) error {
	var segmentRaw []byte
	if err := row.Scan(&c.ID, &c.Name, &c.Subject, &c.Body, &segmentRaw, &c.ScheduledAt, &c.Status, &c.SentAt, &c.CreatedBy, &c.CreatedAt, &c.UpdatedAt); err != nil {
		return err
	}
	if len(segmentRaw) > 0 {
		if err := json.Unmarshal(segmentRaw, &c.SegmentFilter); err != nil {
			return err
		}
	}
	return nil
}

func (r *campaignRepo) Create(ctx context.Context, c *entity.Campaign) error {
	segmentRaw, err := json.Marshal(c.SegmentFilter)
	if err != nil {
		return err
	}
	const q = `INSERT INTO campaigns (name,subject,body,segment_filter,scheduled_at,status,created_by)
		VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,created_at,updated_at`
	return r.pool.QueryRow(ctx, q, c.Name, c.Subject, c.Body, segmentRaw, c.ScheduledAt, c.Status, c.CreatedBy).
		Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
}

func (r *campaignRepo) GetByID(ctx context.Context, id string) (*entity.Campaign, error) {
	c := &entity.Campaign{}
	err := scanCampaign(c, r.pool.QueryRow(ctx, `SELECT `+campaignColumns+` FROM campaigns WHERE id=$1`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return c, err
}

func (r *campaignRepo) Update(ctx context.Context, id string, c *entity.Campaign) error {
	segmentRaw, err := json.Marshal(c.SegmentFilter)
	if err != nil {
		return err
	}
	const q = `UPDATE campaigns SET name=$2,subject=$3,body=$4,segment_filter=$5,scheduled_at=$6,status=$7,sent_at=$8,updated_at=NOW() WHERE id=$1`
	_, err = r.pool.Exec(ctx, q, id, c.Name, c.Subject, c.Body, segmentRaw, c.ScheduledAt, c.Status, c.SentAt)
	return err
}

func (r *campaignRepo) List(ctx context.Context, opts repository.ListCampaignsOptions) ([]entity.Campaign, int, error) {
	where := ""
	args := []any{}
	if opts.Status != "" {
		args = append(args, opts.Status)
		where = "WHERE status=$1"
	}
	var total int
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM campaigns "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	args = append(args, opts.PageSize, (opts.Page-1)*opts.PageSize)
	q := fmt.Sprintf("SELECT %s FROM campaigns %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d",
		campaignColumns, where, len(args)-1, len(args))
	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.Campaign, 0, opts.PageSize)
	for rows.Next() {
		c := entity.Campaign{}
		if err := scanCampaign(&c, rows); err != nil {
			return nil, 0, err
		}
		out = append(out, c)
	}
	return out, total, nil
}

func (r *campaignRepo) ListDueForSend(ctx context.Context) ([]entity.Campaign, error) {
	rows, err := r.pool.Query(ctx, `SELECT `+campaignColumns+` FROM campaigns WHERE status=$1 AND scheduled_at <= NOW() ORDER BY scheduled_at ASC`, entity.CampaignStatusScheduled)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []entity.Campaign{}
	for rows.Next() {
		c := entity.Campaign{}
		if err := scanCampaign(&c, rows); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, nil
}

type campaignRecipientRepo struct{ pool *pgxpool.Pool }

func NewCampaignRecipientRepository(p *pgxpool.Pool) repository.CampaignRecipientRepository {
	return &campaignRecipientRepo{pool: p}
}

const campaignRecipientColumns = `id,campaign_id,member_id,email,status,sent_at,error,created_at`

func scanCampaignRecipient(rec *entity.CampaignRecipient, row pgx.Row) error {
	return row.Scan(&rec.ID, &rec.CampaignID, &rec.MemberID, &rec.Email, &rec.Status, &rec.SentAt, &rec.Error, &rec.CreatedAt)
}

func (r *campaignRecipientRepo) BulkCreate(ctx context.Context, recipients []entity.CampaignRecipient) error {
	if len(recipients) == 0 {
		return nil
	}
	batch := &pgx.Batch{}
	for _, rec := range recipients {
		batch.Queue(`INSERT INTO campaign_recipients (campaign_id,member_id,email,status)
			VALUES ($1,$2,$3,$4) ON CONFLICT (campaign_id,member_id) DO NOTHING`,
			rec.CampaignID, rec.MemberID, rec.Email, entity.RecipientStatusPending)
	}
	br := r.pool.SendBatch(ctx, batch)
	defer br.Close()
	for range recipients {
		if _, err := br.Exec(); err != nil {
			return err
		}
	}
	return nil
}

func (r *campaignRecipientRepo) ListPending(ctx context.Context, campaignID string, limit int) ([]entity.CampaignRecipient, error) {
	rows, err := r.pool.Query(ctx, `SELECT `+campaignRecipientColumns+` FROM campaign_recipients WHERE campaign_id=$1 AND status=$2 LIMIT $3`,
		campaignID, entity.RecipientStatusPending, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []entity.CampaignRecipient{}
	for rows.Next() {
		rec := entity.CampaignRecipient{}
		if err := scanCampaignRecipient(&rec, rows); err != nil {
			return nil, err
		}
		out = append(out, rec)
	}
	return out, nil
}

func (r *campaignRecipientRepo) List(ctx context.Context, campaignID string, page, pageSize int) ([]entity.CampaignRecipient, int, error) {
	var total int
	if err := r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id=$1`, campaignID).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := r.pool.Query(ctx, `SELECT `+campaignRecipientColumns+` FROM campaign_recipients WHERE campaign_id=$1 ORDER BY created_at LIMIT $2 OFFSET $3`,
		campaignID, pageSize, (page-1)*pageSize)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.CampaignRecipient, 0, pageSize)
	for rows.Next() {
		rec := entity.CampaignRecipient{}
		if err := scanCampaignRecipient(&rec, rows); err != nil {
			return nil, 0, err
		}
		out = append(out, rec)
	}
	return out, total, nil
}

func (r *campaignRecipientRepo) UpdateStatus(ctx context.Context, id, status string, sentAt *time.Time, errMsg string) error {
	var errPtr *string
	if errMsg != "" {
		errPtr = &errMsg
	}
	_, err := r.pool.Exec(ctx, `UPDATE campaign_recipients SET status=$2, sent_at=$3, error=$4 WHERE id=$1`, id, status, sentAt, errPtr)
	return err
}

func (r *campaignRecipientRepo) Stats(ctx context.Context, campaignID string) (entity.CampaignStats, error) {
	rows, err := r.pool.Query(ctx, `SELECT status, COUNT(*) FROM campaign_recipients WHERE campaign_id=$1 GROUP BY status`, campaignID)
	if err != nil {
		return entity.CampaignStats{}, err
	}
	defer rows.Close()
	stats := entity.CampaignStats{}
	for rows.Next() {
		var status string
		var count int
		if err := rows.Scan(&status, &count); err != nil {
			return entity.CampaignStats{}, err
		}
		stats.Total += count
		switch status {
		case entity.RecipientStatusPending:
			stats.Pending = count
		case entity.RecipientStatusSent:
			stats.Sent = count
		case entity.RecipientStatusFailed:
			stats.Failed = count
		case entity.RecipientStatusBounced:
			stats.Bounced = count
		}
	}
	return stats, nil
}
