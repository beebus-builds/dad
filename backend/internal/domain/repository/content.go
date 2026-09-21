package repository

import (
	"context"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
)

type PageRepository interface {
	Create(ctx context.Context, p *entity.Page) error
	GetByID(ctx context.Context, id string) (*entity.Page, error)
	GetBySlug(ctx context.Context, slug string) (*entity.Page, error)
	Update(ctx context.Context, id string, p *entity.Page) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]entity.Page, error)
}

type MenuRepository interface {
	Create(ctx context.Context, m *entity.MenuItem) error
	GetByID(ctx context.Context, id string) (*entity.MenuItem, error)
	Update(ctx context.Context, id string, m *entity.MenuItem) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]entity.MenuItem, error)
}

type EventRepository interface {
	Create(ctx context.Context, e *entity.Event) error
	GetByID(ctx context.Context, id string) (*entity.Event, error)
	GetBySlug(ctx context.Context, slug string) (*entity.Event, error)
	Update(ctx context.Context, id string, e *entity.Event) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, opts ListEventsOptions) ([]entity.Event, int, error)
	IncrementRegistered(ctx context.Context, id string) error
}

type ListEventsOptions struct {
	Page     int
	PageSize int
	Search   string
	Status   string
	Category string
	Upcoming bool
}

type NewsRepository interface {
	Create(ctx context.Context, n *entity.News) error
	GetByID(ctx context.Context, id string) (*entity.News, error)
	GetBySlug(ctx context.Context, slug string) (*entity.News, error)
	Update(ctx context.Context, id string, n *entity.News) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, opts ListNewsOptions) ([]entity.News, int, error)
	IncrementViews(ctx context.Context, id string) error
}

type ListNewsOptions struct {
	Page     int
	PageSize int
	Search   string
	Category string
	Status   string
}

type DocumentRepository interface {
	Create(ctx context.Context, d *entity.Document) error
	GetByID(ctx context.Context, id string) (*entity.Document, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, opts ListDocumentsOptions) ([]entity.Document, int, error)
}

type ListDocumentsOptions struct {
	Page       int
	PageSize   int
	Category   string
	Visibility string
	Search     string
}

type TrainingRepository interface {
	Create(ctx context.Context, t *entity.Training) error
	GetByID(ctx context.Context, id string) (*entity.Training, error)
	Update(ctx context.Context, id string, t *entity.Training) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, opts ListTrainingsOptions) ([]entity.Training, int, error)
}

type ListTrainingsOptions struct {
	Page     int
	PageSize int
	Status   string
}