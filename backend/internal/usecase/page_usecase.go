package usecase

import (
	"context"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
)

type PageUsecase struct {
	repo repository.PageRepository
}

func NewPageUsecase(r repository.PageRepository) *PageUsecase {
	return &PageUsecase{repo: r}
}

func (s *PageUsecase) Create(ctx context.Context, p *entity.Page) error {
	return s.repo.Create(ctx, p)
}

func (s *PageUsecase) GetByID(ctx context.Context, id string) (*entity.Page, error) {
	p, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, apperror.New(404, "NOT_FOUND", "page not found")
	}
	return p, nil
}

func (s *PageUsecase) GetBySlug(ctx context.Context, slug string) (*entity.Page, error) {
	p, err := s.repo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, apperror.New(404, "NOT_FOUND", "page not found")
	}
	return p, nil
}

func (s *PageUsecase) Update(ctx context.Context, id string, p *entity.Page) error {
	return s.repo.Update(ctx, id, p)
}

func (s *PageUsecase) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *PageUsecase) List(ctx context.Context) ([]entity.Page, error) {
	return s.repo.List(ctx)
}
