package usecase

import (
	"context"
	"errors"
	"sync"
	"testing"
	"time"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
	"github.com/shramjagaran/cms-backend/pkg/jwt"
	"github.com/shramjagaran/cms-backend/pkg/password"
)

type stubUserRepo struct {
	mu         sync.Mutex
	users      map[string]*entity.User
	byEmail    map[string]*entity.User
	createErr  error
	updateErr  error
	updateHits int
}

func newStubUserRepo() *stubUserRepo {
	return &stubUserRepo{
		users:   map[string]*entity.User{},
		byEmail: map[string]*entity.User{},
	}
}

func (r *stubUserRepo) Create(_ context.Context, u *entity.User) error {
	if r.createErr != nil {
		return r.createErr
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	r.users[u.ID] = u
	r.byEmail[u.Email] = u
	return nil
}

func (r *stubUserRepo) GetByID(_ context.Context, id string) (*entity.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	u, ok := r.users[id]
	if !ok {
		return nil, apperror.ErrNotFound
	}
	return u, nil
}

func (r *stubUserRepo) GetByEmail(_ context.Context, email string) (*entity.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	u, ok := r.byEmail[email]
	if !ok {
		return nil, apperror.ErrNotFound
	}
	return u, nil
}

func (r *stubUserRepo) Update(_ context.Context, id string, u *entity.User) error {
	if r.updateErr != nil {
		return r.updateErr
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.users[id]; !ok {
		return apperror.ErrNotFound
	}
	r.users[id] = u
	return nil
}

func (r *stubUserRepo) List(_ context.Context, _ repository.ListUsersOptions) ([]entity.User, int, error) {
	return nil, 0, nil
}

func (r *stubUserRepo) UpdateLastLogin(_ context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.updateHits++
	return nil
}

func (r *stubUserRepo) Deactivate(_ context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if u, ok := r.users[id]; ok {
		u.IsActive = false
	}
	return nil
}

type stubAuditRepo struct {
	mu    sync.Mutex
	logs  []entity.AuditLog
	fail  error
}

func (r *stubAuditRepo) Create(_ context.Context, log *entity.AuditLog) error {
	if r.fail != nil {
		return r.fail
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	r.logs = append(r.logs, *log)
	return nil
}

func (r *stubAuditRepo) List(_ context.Context, _ repository.ListAuditOptions) ([]entity.AuditLog, int, error) {
	return r.logs, len(r.logs), nil
}

func newTestAuthService(repo *stubUserRepo, audit *stubAuditRepo) (*AuthService, *jwt.Manager) {
	mgr := jwt.NewManager("test-secret-key-must-be-32-chars-long-xx", 15*time.Minute, 24*time.Hour, "test")
	svc := NewAuthService(repo, audit, mgr)
	return svc, mgr
}

func seedUser(t *testing.T, repo *stubUserRepo, email, role, plain string, active bool) *entity.User {
	t.Helper()
	hash, _ := password.Hash(plain)
	branchID := "branch-1"
	u := &entity.User{
		ID:           "user-" + email,
		Email:        email,
		PasswordHash: hash,
		FullName:     "Test User",
		Role:         role,
		BranchID:     &branchID,
		IsActive:     active,
	}
	_ = repo.Create(context.Background(), u)
	return u
}

var _ = errors.New
