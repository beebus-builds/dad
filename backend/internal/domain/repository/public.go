package repository

import (
	"context"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
)

type PublicEventRegistrationRepository interface {
	Create(ctx context.Context, r *entity.PublicEventRegistration) error
	ListByEvent(ctx context.Context, eventID string) ([]entity.PublicEventRegistration, error)
}

type MemberApplicationRepository interface {
	Create(ctx context.Context, a *entity.MemberApplication) error
	List(ctx context.Context, opts ListMemberApplicationsOptions) ([]entity.MemberApplication, int, error)
}

type ListMemberApplicationsOptions struct {
	Page     int
	PageSize int
	Status   string
}

type ContactRepository interface {
	Create(ctx context.Context, m *entity.ContactMessage) error
	List(ctx context.Context, opts ListContactOptions) ([]entity.ContactMessage, int, error)
}

type ListContactOptions struct {
	Page     int
	PageSize int
	IsRead   *bool
}