package usecase

import (
	"context"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
)

type MenuUsecase struct {
	repo repository.MenuRepository
}

func NewMenuUsecase(r repository.MenuRepository) *MenuUsecase {
	return &MenuUsecase{repo: r}
}

func (s *MenuUsecase) Create(ctx context.Context, m *entity.MenuItem) error {
	return s.repo.Create(ctx, m)
}

func (s *MenuUsecase) GetByID(ctx context.Context, id string) (*entity.MenuItem, error) {
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, apperror.New(404, "NOT_FOUND", "menu item not found")
	}
	return m, nil
}

func (s *MenuUsecase) Update(ctx context.Context, id string, m *entity.MenuItem) error {
	return s.repo.Update(ctx, id, m)
}

func (s *MenuUsecase) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *MenuUsecase) List(ctx context.Context) ([]entity.MenuItem, error) {
	return s.repo.List(ctx)
}
