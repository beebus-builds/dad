package usecase

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
)

type stubComplaintRepo struct {
	mu    sync.Mutex
	byID  map[string]*entity.Complaint
	stats map[string]int
}

func newStubComplaintRepo() *stubComplaintRepo {
	return &stubComplaintRepo{
		byID:  map[string]*entity.Complaint{},
		stats: map[string]int{},
	}
}

func (r *stubComplaintRepo) Create(_ context.Context, c *entity.Complaint) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.byID[c.ID] = c
	return nil
}

func (r *stubComplaintRepo) GetByID(_ context.Context, id string) (*entity.Complaint, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	c, ok := r.byID[id]
	if !ok {
		return nil, apperror.ErrNotFound
	}
	return c, nil
}

func (r *stubComplaintRepo) Update(_ context.Context, id string, c *entity.Complaint) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.byID[id]; !ok {
		return apperror.ErrNotFound
	}
	r.byID[id] = c
	return nil
}

func (r *stubComplaintRepo) Delete(_ context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.byID, id)
	return nil
}

func (r *stubComplaintRepo) List(_ context.Context, _ repository.ListComplaintsOptions) ([]entity.Complaint, int, error) {
	return nil, 0, nil
}

func (r *stubComplaintRepo) GetStats(_ context.Context) (map[string]int, error) {
	return r.stats, nil
}

func TestComplaintCreate_TitleAndDescriptionLength(t *testing.T) {
	repo := newStubComplaintRepo()
	svc := NewComplaintService(repo)

	_, err := svc.Create(context.Background(), "user-1", CreateComplaintInput{
		Title:       "Hi",
		Description: "short",
	})
	if err == nil {
		t.Fatal("expected validation error for short title")
	}

	_, err = svc.Create(context.Background(), "user-1", CreateComplaintInput{
		Title:       "Workplace safety issue",
		Description: "short desc",
	})
	if err == nil {
		t.Fatal("expected validation error for short description")
	}
}

func TestComplaintCreate_Success(t *testing.T) {
	repo := newStubComplaintRepo()
	svc := NewComplaintService(repo)

	c, err := svc.Create(context.Background(), "user-1", CreateComplaintInput{
		Title:       "Wage theft at construction site",
		Description: "The contractor has not paid overtime for the last three months.",
		Category:    "WAGE_THEFT",
		Priority:    entity.ComplaintPriorityHigh,
		BranchID:    "branch-1",
	})
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if c.Status != entity.ComplaintStatusOpen {
		t.Errorf("Status = %q, want OPEN", c.Status)
	}
	if c.Priority != entity.ComplaintPriorityHigh {
		t.Errorf("Priority = %q, want HIGH", c.Priority)
	}
	if c.TicketNumber == "" {
		t.Error("expected ticket number")
	}
	if c.SubmittedBy != "user-1" {
		t.Errorf("SubmittedBy = %q, want user-1", c.SubmittedBy)
	}
}

func TestComplaintCreate_DefaultsPriorityToMedium(t *testing.T) {
	repo := newStubComplaintRepo()
	svc := NewComplaintService(repo)

	c, err := svc.Create(context.Background(), "u", CreateComplaintInput{
		Title:       "Health and safety concern",
		Description: "No protective equipment was provided for the last project cycle.",
	})
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if c.Priority != entity.ComplaintPriorityMedium {
		t.Errorf("Priority = %q, want MEDIUM", c.Priority)
	}
}

func TestComplaintUpdate_ResolvedSetsTimestamp(t *testing.T) {
	repo := newStubComplaintRepo()
	svc := NewComplaintService(repo)

	c, _ := svc.Create(context.Background(), "u", CreateComplaintInput{
		Title:       "Issue at factory",
		Description: "Workers were not given proper breaks for the last several weeks.",
	})

	updated, err := svc.Update(context.Background(), c.ID, entity.ComplaintStatusResolved, "", "")
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if updated.Status != entity.ComplaintStatusResolved {
		t.Errorf("Status = %q, want RESOLVED", updated.Status)
	}
	if updated.ResolvedAt == nil {
		t.Error("expected ResolvedAt to be set")
	}
	if time.Since(*updated.ResolvedAt) > 5*time.Second {
		t.Error("ResolvedAt should be recent")
	}
}

func TestComplaintUpdate_AssigneeAndPriority(t *testing.T) {
	repo := newStubComplaintRepo()
	svc := NewComplaintService(repo)
	c, _ := svc.Create(context.Background(), "u", CreateComplaintInput{
		Title:       "Severe workplace injury",
		Description: "A worker fell from scaffolding and required emergency hospitalization.",
	})

	updated, err := svc.Update(context.Background(), c.ID, entity.ComplaintStatusInReview, entity.ComplaintPriorityUrgent, "user-99")
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if updated.AssignedTo == nil || *updated.AssignedTo != "user-99" {
		t.Errorf("AssignedTo = %v, want user-99", updated.AssignedTo)
	}
	if updated.Priority != entity.ComplaintPriorityUrgent {
		t.Errorf("Priority = %q, want URGENT", updated.Priority)
	}
}
