package repository

import (
	"context"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
)

type LegalCaseRepository interface {
	Create(ctx context.Context, c *entity.LegalCase) error
	GetByID(ctx context.Context, id string) (*entity.LegalCase, error)
	Update(ctx context.Context, id string, c *entity.LegalCase) error
	List(ctx context.Context, opts ListLegalCasesOptions) ([]entity.LegalCase, int, error)
}

type ListLegalCasesOptions struct {
	Page     int
	PageSize int
	Type     string
	Status   string
}

type IncidentRepository interface {
	Create(ctx context.Context, i *entity.Incident) error
	GetByID(ctx context.Context, id string) (*entity.Incident, error)
	Update(ctx context.Context, id string, i *entity.Incident) error
	List(ctx context.Context, opts ListIncidentsOptions) ([]entity.Incident, int, error)
}

type ListIncidentsOptions struct {
	Page     int
	PageSize int
	Severity string
	Status   string
}