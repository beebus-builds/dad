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

type stubEventRepo struct {
	mu   sync.Mutex
	byID map[string]*entity.Event
}

func newStubEventRepoFull() *stubEventRepo {
	return &stubEventRepo{byID: map[string]*entity.Event{}}
}

func (r *stubEventRepo) Create(_ context.Context, e *entity.Event) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.byID[e.ID] = e
	return nil
}

func (r *stubEventRepo) GetByID(_ context.Context, id string) (*entity.Event, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	e, ok := r.byID[id]
	if !ok {
		return nil, apperror.ErrNotFound
	}
	return e, nil
}

func (r *stubEventRepo) GetBySlug(_ context.Context, slug string) (*entity.Event, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, e := range r.byID {
		if e.Slug == slug {
			return e, nil
		}
	}
	return nil, apperror.ErrNotFound
}

func (r *stubEventRepo) Update(_ context.Context, id string, e *entity.Event) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.byID[id]; !ok {
		return apperror.ErrNotFound
	}
	r.byID[id] = e
	return nil
}

func (r *stubEventRepo) Delete(_ context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.byID, id)
	return nil
}

func (r *stubEventRepo) List(_ context.Context, _ repository.ListEventsOptions) ([]entity.Event, int, error) {
	return nil, 0, nil
}

func (r *stubEventRepo) IncrementRegistered(_ context.Context, _ string) error { return nil }

func TestSlugify(t *testing.T) {
	cases := []struct {
		in   string
		want string
	}{
		{"Hello World", "hello-world"},
		{"Workers Rights 2026", "workers-rights-2026"},
		{"  Trim  Spaces  ", "trim--spaces"},
		{"already-lower", "already-lower"},
		{"multiple   inner   spaces", "multiple---inner---spaces"},
		{"-leading-and-trailing-", "leading-and-trailing"},
	}
	for _, tc := range cases {
		got := slugify(tc.in)
		if got != tc.want {
			t.Errorf("slugify(%q) = %q, want %q", tc.in, got, tc.want)
		}
	}
}

func TestSlugify_FallsBackWhenEmpty(t *testing.T) {
	got := slugify("!!!@@@###")
	if got == "" {
		t.Error("slugify should return a non-empty fallback for purely symbolic input")
	}
}

func TestEventCreate_GeneratesSlug(t *testing.T) {
	repo := newStubEventRepoFull()
	svc := NewEventService(repo)

	now := time.Now()
	e, err := svc.Create(context.Background(), "user-1", CreateEventInput{
		Title:    "May Day Rally 2026",
		StartsAt: now,
		EndsAt:   now.Add(2 * time.Hour),
	})
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if e.Slug != "may-day-rally-2026" {
		t.Errorf("Slug = %q, want may-day-rally-2026", e.Slug)
	}
	if e.Status != entity.EventStatusDraft {
		t.Errorf("Status = %q, want DRAFT", e.Status)
	}
	if e.CreatedBy != "user-1" {
		t.Errorf("CreatedBy = %q, want user-1", e.CreatedBy)
	}
}

func TestEventCreate_DefaultsCategoryToOther(t *testing.T) {
	repo := newStubEventRepoFull()
	svc := NewEventService(repo)
	now := time.Now()
	e, err := svc.Create(context.Background(), "u", CreateEventInput{
		Title: "X", StartsAt: now, EndsAt: now,
	})
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if e.Category != "OTHER" {
		t.Errorf("Category = %q, want OTHER", e.Category)
	}
}
