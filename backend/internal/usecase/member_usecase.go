package usecase

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
)

type MemberService struct {
	repo repository.MemberRepository
}

func NewMemberService(r repository.MemberRepository) *MemberService { return &MemberService{repo: r} }

type CreateMemberInput struct {
	MembershipNumber  string
	FullName          string
	FullNameNepali    string
	Email             string
	Phone             string
	DateOfBirth       string
	Gender            string
	CitizenshipNumber string
	Occupation        string
	Employer          string
	Address           string
	BranchID          string
	Tier              string
}

func (s *MemberService) Create(ctx context.Context, in CreateMemberInput) (*entity.Member, error) {
	if strings.TrimSpace(in.FullName) == "" {
		return nil, apperror.New(422, "VALIDATION", "fullName is required")
	}
	if in.BranchID == "" {
		return nil, apperror.New(422, "VALIDATION", "branchId is required")
	}
	tier := in.Tier
	if tier == "" {
		tier = entity.MemberTierStandard
	}
	mn := in.MembershipNumber
	if mn == "" {
		mn = fmt.Sprintf("SJ-%d", time.Now().Unix()%1_000_000)
	}
	m := &entity.Member{
		ID:               uuid.NewString(),
		MembershipNumber: mn,
		FullName:         in.FullName,
		FullNameNepali:   strPtr(in.FullNameNepali),
		Email:            strPtr(in.Email),
		Phone:            in.Phone,
		Gender:           strPtr(in.Gender),
		CitizenshipNumber: strPtr(in.CitizenshipNumber),
		Occupation:       strPtr(in.Occupation),
		Employer:         strPtr(in.Employer),
		Address:          strPtr(in.Address),
		BranchID:         in.BranchID,
		Tier:             tier,
		Status:           entity.MemberStatusActive,
		JoinedAt:         time.Now(),
	}
	if in.DateOfBirth != "" {
		if d, err := time.Parse("2006-01-02", in.DateOfBirth); err == nil {
			m.DateOfBirth = &d
		}
	}
	if err := s.repo.Create(ctx, m); err != nil {
		return nil, err
	}
	return m, nil
}

func (s *MemberService) Get(ctx context.Context, id string) (*entity.Member, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *MemberService) Update(ctx context.Context, id string, in CreateMemberInput) (*entity.Member, error) {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	existing.FullName = in.FullName
	existing.FullNameNepali = strPtr(in.FullNameNepali)
	existing.Email = strPtr(in.Email)
	existing.Phone = in.Phone
	existing.Gender = strPtr(in.Gender)
	existing.CitizenshipNumber = strPtr(in.CitizenshipNumber)
	existing.Occupation = strPtr(in.Occupation)
	existing.Employer = strPtr(in.Employer)
	existing.Address = strPtr(in.Address)
	existing.BranchID = in.BranchID
	if in.Tier != "" {
		existing.Tier = in.Tier
	}
	if err := s.repo.Update(ctx, id, existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *MemberService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *MemberService) List(ctx context.Context, opts repository.ListMembersOptions) ([]entity.Member, int, error) {
	if opts.Page < 1 {
		opts.Page = 1
	}
	if opts.PageSize < 1 {
		opts.PageSize = 20
	}
	return s.repo.List(ctx, opts)
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
