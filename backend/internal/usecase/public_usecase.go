package usecase

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
)

type PublicEventService struct {
	events    repository.EventRepository
	regs      repository.PublicEventRegistrationRepository
}

func NewPublicEventService(e repository.EventRepository, r repository.PublicEventRegistrationRepository) *PublicEventService {
	return &PublicEventService{events: e, regs: r}
}

type RegisterForEventInput struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
}

func (s *PublicEventService) Register(ctx context.Context, eventID string, in RegisterForEventInput) (*entity.PublicEventRegistration, error) {
	if strings.TrimSpace(in.FullName) == "" {
		return nil, apperror.New(422, "VALIDATION", "fullName is required")
	}
	ev, err := s.events.GetByID(ctx, eventID)
	if err != nil {
		return nil, err
	}
	if ev.Status != entity.EventStatusPublished {
		return nil, apperror.New(400, "INVALID_STATE", "event is not open for registration")
	}
	if ev.Capacity != nil && ev.RegisteredCount >= *ev.Capacity {
		return nil, apperror.New(400, "FULL", "event has reached capacity")
	}
	reg := &entity.PublicEventRegistration{
		ID:       uuid.NewString(),
		EventID:  eventID,
		FullName: in.FullName,
		Email:    strPtr(in.Email),
		Phone:    strPtr(in.Phone),
		Status:   "CONFIRMED",
	}
	if err := s.regs.Create(ctx, reg); err != nil {
		return nil, err
	}
	_ = s.events.IncrementRegistered(ctx, eventID)
	return reg, nil
}

type MemberApplicationService struct {
	repo repository.MemberApplicationRepository
}

func NewMemberApplicationService(r repository.MemberApplicationRepository) *MemberApplicationService {
	return &MemberApplicationService{repo: r}
}

type MemberApplyInput struct {
	FullName   string `json:"fullName"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	Address    string `json:"address"`
	BranchID   string `json:"branchId"`
	Occupation string `json:"occupation"`
	Employer   string `json:"employer"`
}

type AuditLogService struct {
	repo repository.AuditLogRepository
}

func NewAuditLogService(r repository.AuditLogRepository) *AuditLogService {
	return &AuditLogService{repo: r}
}

func (s *AuditLogService) List(ctx context.Context, opts repository.ListAuditOptions) ([]entity.AuditLog, int, error) {
	return s.repo.List(ctx, opts)
}

type ContactService struct {
	repo repository.ContactRepository
}

func NewContactService(r repository.ContactRepository) *ContactService {
	return &ContactService{repo: r}
}

type CreateContactInput struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

func (s *ContactService) Create(ctx context.Context, in CreateContactInput) (*entity.ContactMessage, error) {
	if strings.TrimSpace(in.Name) == "" || strings.TrimSpace(in.Email) == "" || strings.TrimSpace(in.Subject) == "" || strings.TrimSpace(in.Message) == "" {
		return nil, apperror.New(422, "VALIDATION", "name, email, subject and message are required")
	}
	m := &entity.ContactMessage{
		ID:      uuid.NewString(),
		Name:    in.Name,
		Email:   in.Email,
		Phone:   strPtr(in.Phone),
		Subject: in.Subject,
		Message: in.Message,
		IsRead:  false,
	}
	if err := s.repo.Create(ctx, m); err != nil {
		return nil, err
	}
	return m, nil
}

func (s *MemberApplicationService) Apply(ctx context.Context, in MemberApplyInput) (*entity.MemberApplication, error) {
	if strings.TrimSpace(in.FullName) == "" {
		return nil, apperror.New(422, "VALIDATION", "fullName is required")
	}
	if strings.TrimSpace(in.Phone) == "" {
		return nil, apperror.New(422, "VALIDATION", "phone is required")
	}
	a := &entity.MemberApplication{
		ID:         uuid.NewString(),
		FullName:   in.FullName,
		Email:      strPtr(in.Email),
		Phone:      in.Phone,
		Address:    strPtr(in.Address),
		BranchID:   strPtr(in.BranchID),
		Occupation: strPtr(in.Occupation),
		Employer:   strPtr(in.Employer),
		Status:     "PENDING",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	if err := s.repo.Create(ctx, a); err != nil {
		return nil, err
	}
	return a, nil
}
