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

type ComplaintService struct{ repo repository.ComplaintRepository }

func NewComplaintService(r repository.ComplaintRepository) *ComplaintService {
	return &ComplaintService{repo: r}
}

type CreateComplaintInput struct {
	Title       string
	Description string
	Category    string
	Priority    string
	BranchID    string
}

func (s *ComplaintService) Create(ctx context.Context, userID string, in CreateComplaintInput) (*entity.Complaint, error) {
	if len(in.Title) < 5 {
		return nil, apperror.New(422, "VALIDATION", "title must be at least 5 characters")
	}
	if len(in.Description) < 20 {
		return nil, apperror.New(422, "VALIDATION", "description must be at least 20 characters")
	}
	tn := fmt.Sprintf("CMP-%d", time.Now().Unix()%1_000_000)
	c := &entity.Complaint{
		ID:           uuid.NewString(),
		TicketNumber: tn,
		Title:        strings.TrimSpace(in.Title),
		Description:  in.Description,
		Category:     in.Category,
		Priority:     defaultStr(in.Priority, entity.ComplaintPriorityMedium),
		Status:       entity.ComplaintStatusOpen,
		SubmittedBy:  userID,
		BranchID:     strPtr(in.BranchID),
	}
	if err := s.repo.Create(ctx, c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *ComplaintService) Get(ctx context.Context, id string) (*entity.Complaint, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *ComplaintService) Update(ctx context.Context, id string, status, priority, assignedTo string) (*entity.Complaint, error) {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if status != "" {
		existing.Status = status
		if status == entity.ComplaintStatusResolved {
			now := time.Now()
			existing.ResolvedAt = &now
		}
	}
	if priority != "" {
		existing.Priority = priority
	}
	if assignedTo != "" {
		existing.AssignedTo = &assignedTo
	}
	if err := s.repo.Update(ctx, id, existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *ComplaintService) List(ctx context.Context, opts repository.ListComplaintsOptions) ([]entity.Complaint, int, error) {
	return s.repo.List(ctx, opts)
}

func (s *ComplaintService) Stats(ctx context.Context) (map[string]int, error) {
	return s.repo.GetStats(ctx)
}

type EventService struct{ repo repository.EventRepository }

func NewEventService(r repository.EventRepository) *EventService { return &EventService{repo: r} }

type CreateEventInput struct {
	Title         string
	TitleNepali   string
	Description   string
	Category      string
	StartsAt      time.Time
	EndsAt        time.Time
	Location      string
	Capacity      int
	CoverImageURL string
	BranchID      string
}

func (s *EventService) Create(ctx context.Context, userID string, in CreateEventInput) (*entity.Event, error) {
	slug := slugify(in.Title)
	e := &entity.Event{
		ID:            uuid.NewString(),
		Title:         in.Title,
		TitleNepali:   strPtr(in.TitleNepali),
		Slug:          slug,
		Description:   in.Description,
		Category:      defaultStr(in.Category, "OTHER"),
		Status:        entity.EventStatusDraft,
		StartsAt:      in.StartsAt,
		EndsAt:        in.EndsAt,
		Location:      in.Location,
		Capacity:      intPtr(in.Capacity),
		CoverImageURL: strPtr(in.CoverImageURL),
		BranchID:      strPtr(in.BranchID),
		CreatedBy:     userID,
	}
	if err := s.repo.Create(ctx, e); err != nil {
		return nil, err
	}
	return e, nil
}

func (s *EventService) Get(ctx context.Context, id string) (*entity.Event, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *EventService) Update(ctx context.Context, id string, in CreateEventInput, status string) (*entity.Event, error) {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	existing.Title = in.Title
	existing.TitleNepali = strPtr(in.TitleNepali)
	existing.Description = in.Description
	existing.Category = in.Category
	existing.StartsAt = in.StartsAt
	existing.EndsAt = in.EndsAt
	existing.Location = in.Location
	existing.Capacity = intPtr(in.Capacity)
	existing.CoverImageURL = strPtr(in.CoverImageURL)
	existing.BranchID = strPtr(in.BranchID)
	if status != "" {
		existing.Status = status
	}
	if err := s.repo.Update(ctx, id, existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *EventService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *EventService) List(ctx context.Context, opts repository.ListEventsOptions) ([]entity.Event, int, error) {
	return s.repo.List(ctx, opts)
}

func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	b := strings.Builder{}
	for _, r := range s {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			b.WriteRune(r)
		case r == ' ' || r == '-' || r == '_':
			b.WriteRune('-')
		}
	}
	out := strings.Trim(b.String(), "-")
	if out == "" {
		return uuid.NewString()
	}
	return out
}

