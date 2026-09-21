package repository

import (
	"context"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
)

type NotificationRepository interface {
	Create(ctx context.Context, n *entity.Notification) error
	List(ctx context.Context, userID string, limit int) ([]entity.Notification, error)
	MarkRead(ctx context.Context, id, userID string) error
	MarkAllRead(ctx context.Context, userID string) error
	UnreadCount(ctx context.Context, userID string) (int, error)
}

type AuditLogRepository interface {
	Create(ctx context.Context, log *entity.AuditLog) error
	List(ctx context.Context, opts ListAuditOptions) ([]entity.AuditLog, int, error)
}

type ListAuditOptions struct {
	Page     int
	PageSize int
	UserID   string
	Resource string
	Action   string
}