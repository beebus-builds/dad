package repository

import (
	"context"
	"time"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
)

type ListCampaignsOptions struct {
	Page     int
	PageSize int
	Status   string
}

type CampaignRepository interface {
	Create(ctx context.Context, c *entity.Campaign) error
	GetByID(ctx context.Context, id string) (*entity.Campaign, error)
	Update(ctx context.Context, id string, c *entity.Campaign) error
	List(ctx context.Context, opts ListCampaignsOptions) ([]entity.Campaign, int, error)
	// ListDueForSend returns SCHEDULED campaigns whose scheduled_at has passed.
	ListDueForSend(ctx context.Context) ([]entity.Campaign, error)
}

type CampaignRecipientRepository interface {
	BulkCreate(ctx context.Context, recipients []entity.CampaignRecipient) error
	ListPending(ctx context.Context, campaignID string, limit int) ([]entity.CampaignRecipient, error)
	List(ctx context.Context, campaignID string, page, pageSize int) ([]entity.CampaignRecipient, int, error)
	UpdateStatus(ctx context.Context, id, status string, sentAt *time.Time, errMsg string) error
	Stats(ctx context.Context, campaignID string) (entity.CampaignStats, error)
}
