package usecase

import (
	"context"
	"sync"
	"testing"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
)

type stubMemberRepo struct {
	mu      sync.Mutex
	byID    map[string]*entity.Member
	byNum   map[string]*entity.Member
	all     []entity.Member
	createE error
	updateE error
	listE   error
}

func newStubMemberRepo() *stubMemberRepo {
	return &stubMemberRepo{
		byID:  map[string]*entity.Member{},
		byNum: map[string]*entity.Member{},
	}
}

func (r *stubMemberRepo) Create(_ context.Context, m *entity.Member) error {
	if r.createE != nil {
		return r.createE
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	r.byID[m.ID] = m
	r.byNum[m.MembershipNumber] = m
	r.all = append(r.all, *m)
	return nil
}

func (r *stubMemberRepo) GetByID(_ context.Context, id string) (*entity.Member, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	m, ok := r.byID[id]
	if !ok {
		return nil, apperror.ErrNotFound
	}
	return m, nil
}

func (r *stubMemberRepo) GetByMembershipNumber(_ context.Context, num string) (*entity.Member, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	m, ok := r.byNum[num]
	if !ok {
		return nil, apperror.ErrNotFound
	}
	return m, nil
}

func (r *stubMemberRepo) Update(_ context.Context, id string, m *entity.Member) error {
	if r.updateE != nil {
		return r.updateE
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.byID[id]; !ok {
		return apperror.ErrNotFound
	}
	r.byID[id] = m
	return nil
}

func (r *stubMemberRepo) Delete(_ context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.byID, id)
	return nil
}

func (r *stubMemberRepo) List(_ context.Context, _ repository.ListMembersOptions) ([]entity.Member, int, error) {
	if r.listE != nil {
		return nil, 0, r.listE
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	return r.all, len(r.all), nil
}

func TestMemberCreate_DefaultsTierAndStatus(t *testing.T) {
	repo := newStubMemberRepo()
	svc := NewMemberService(repo)

	m, err := svc.Create(context.Background(), CreateMemberInput{
		FullName: "Hari Bahadur",
		Phone:    "+9779841234567",
		BranchID: "branch-1",
	})
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if m.Tier != entity.MemberTierStandard {
		t.Errorf("Tier = %q, want STANDARD", m.Tier)
	}
	if m.Status != entity.MemberStatusActive {
		t.Errorf("Status = %q, want ACTIVE", m.Status)
	}
	if m.MembershipNumber == "" {
		t.Error("expected auto-generated membership number")
	}
	if m.JoinedAt.IsZero() {
		t.Error("expected JoinedAt to be set")
	}
}

func TestMemberCreate_MissingFullName(t *testing.T) {
	repo := newStubMemberRepo()
	svc := NewMemberService(repo)

	_, err := svc.Create(context.Background(), CreateMemberInput{
		FullName: "  ",
		Phone:    "+9779841234567",
		BranchID: "branch-1",
	})
	if err == nil {
		t.Fatal("expected validation error, got nil")
	}
}

func TestMemberCreate_MissingBranch(t *testing.T) {
	repo := newStubMemberRepo()
	svc := NewMemberService(repo)

	_, err := svc.Create(context.Background(), CreateMemberInput{
		FullName: "Hari",
		Phone:    "+9779841234567",
	})
	if err == nil {
		t.Fatal("expected validation error, got nil")
	}
}

func TestMemberCreate_RepoError(t *testing.T) {
	repo := newStubMemberRepo()
	repo.createE = apperror.ErrInternal
	svc := NewMemberService(repo)

	_, err := svc.Create(context.Background(), CreateMemberInput{
		FullName: "Hari",
		Phone:    "+9779841234567",
		BranchID: "branch-1",
	})
	if err == nil {
		t.Fatal("expected repo error, got nil")
	}
}

func TestMemberCreate_ExplicitTier(t *testing.T) {
	repo := newStubMemberRepo()
	svc := NewMemberService(repo)

	m, err := svc.Create(context.Background(), CreateMemberInput{
		FullName: "Gita",
		Phone:    "+9779841234567",
		BranchID: "branch-1",
		Tier:     entity.MemberTierLifetime,
	})
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if m.Tier != entity.MemberTierLifetime {
		t.Errorf("Tier = %q, want LIFETIME", m.Tier)
	}
}

func TestMemberUpdate_NotFound(t *testing.T) {
	repo := newStubMemberRepo()
	svc := NewMemberService(repo)

	_, err := svc.Update(context.Background(), "missing-id", CreateMemberInput{
		FullName: "X", Phone: "+9779841234567", BranchID: "branch-1",
	})
	if err == nil {
		t.Fatal("expected not-found error")
	}
}

func TestMemberList_NormalizesPagination(t *testing.T) {
	repo := newStubMemberRepo()
	svc := NewMemberService(repo)

	_, _, err := svc.List(context.Background(), repository.ListMembersOptions{Page: -5, PageSize: 0})
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
}
