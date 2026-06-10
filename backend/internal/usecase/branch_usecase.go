package usecase

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
)

type BranchService struct {
	repo repository.BranchRepository
}

func NewBranchService(r repository.BranchRepository) *BranchService {
	return &BranchService{repo: r}
}

type CreateBranchInput struct {
	Name        string `json:"name"`
	NameNepali  string `json:"nameNepali"`
	ProvinceCode string `json:"provinceCode"`
	DistrictCode string `json:"districtCode"`
	Address     string `json:"address"`
	ContactEmail string `json:"contactEmail"`
	ContactPhone string `json:"contactPhone"`
}

func (s *BranchService) Create(ctx context.Context, in CreateBranchInput) (*entity.Branch, error) {
	if strings.TrimSpace(in.Name) == "" {
		return nil, apperror.New(422, "VALIDATION", "name is required")
	}
	b := &entity.Branch{
		ID:           uuid.NewString(),
		Name:         in.Name,
		NameNepali:   strPtr(in.NameNepali),
		ProvinceCode: in.ProvinceCode,
		DistrictCode: in.DistrictCode,
		Address:      strPtr(in.Address),
		ContactEmail: strPtr(in.ContactEmail),
		ContactPhone: strPtr(in.ContactPhone),
		IsActive:     true,
	}
	if err := s.repo.Create(ctx, b); err != nil {
		return nil, err
	}
	return b, nil
}

type UpdateBranchInput struct {
	Name         *string `json:"name"`
	NameNepali   *string `json:"nameNepali"`
	ProvinceCode *string `json:"provinceCode"`
	DistrictCode *string `json:"districtCode"`
	Address      *string `json:"address"`
	ContactEmail *string `json:"contactEmail"`
	ContactPhone *string `json:"contactPhone"`
	IsActive     *bool   `json:"isActive"`
}

func (s *BranchService) Update(ctx context.Context, id string, in UpdateBranchInput) (*entity.Branch, error) {
	b, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if in.Name != nil { b.Name = *in.Name }
	if in.NameNepali != nil { b.NameNepali = in.NameNepali }
	if in.ProvinceCode != nil { b.ProvinceCode = *in.ProvinceCode }
	if in.DistrictCode != nil { b.DistrictCode = *in.DistrictCode }
	if in.Address != nil { b.Address = in.Address }
	if in.ContactEmail != nil { b.ContactEmail = in.ContactEmail }
	if in.ContactPhone != nil { b.ContactPhone = in.ContactPhone }
	if in.IsActive != nil { b.IsActive = *in.IsActive }
	if err := s.repo.Update(ctx, id, b); err != nil {
		return nil, err
	}
	return b, nil
}

func (s *BranchService) Get(ctx context.Context, id string) (*entity.Branch, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *BranchService) List(ctx context.Context) ([]entity.Branch, error) {
	return s.repo.List(ctx)
}

func (s *BranchService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
