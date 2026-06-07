package handler

import (
	"context"
	"sync"
	"time"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/internal/usecase"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
	"github.com/shramjagaran/cms-backend/pkg/jwt"
	"github.com/shramjagaran/cms-backend/pkg/password"
)

type hStubUserRepo struct {
	mu      sync.Mutex
	users   map[string]*entity.User
	byEmail map[string]*entity.User
}

func newHStubUserRepo() *hStubUserRepo {
	return &hStubUserRepo{
		users:   map[string]*entity.User{},
		byEmail: map[string]*entity.User{},
	}
}

func (r *hStubUserRepo) Create(_ context.Context, u *entity.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.users[u.ID] = u
	r.byEmail[u.Email] = u
	return nil
}

func (r *hStubUserRepo) GetByID(_ context.Context, id string) (*entity.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	u, ok := r.users[id]
	if !ok {
		return nil, apperror.ErrNotFound
	}
	return u, nil
}

func (r *hStubUserRepo) GetByEmail(_ context.Context, email string) (*entity.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	u, ok := r.byEmail[email]
	if !ok {
		return nil, apperror.ErrNotFound
	}
	return u, nil
}

func (r *hStubUserRepo) Update(_ context.Context, id string, u *entity.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.users[id] = u
	return nil
}

func (r *hStubUserRepo) List(_ context.Context, _ repository.ListUsersOptions) ([]entity.User, int, error) {
	return nil, 0, nil
}

func (r *hStubUserRepo) UpdateLastLogin(_ context.Context, _ string) error { return nil }
func (r *hStubUserRepo) Deactivate(_ context.Context, _ string) error       { return nil }

type hStubAuditRepo struct{}

func (hStubAuditRepo) Create(_ context.Context, _ *entity.AuditLog) error { return nil }
func (hStubAuditRepo) List(_ context.Context, _ repository.ListAuditOptions) ([]entity.AuditLog, int, error) {
	return nil, 0, nil
}

func hNewTestAuthService() (*usecase.AuthService, *jwt.Manager, *hStubUserRepo) {
	repo := newHStubUserRepo()
	mgr := jwt.NewManager("test-secret-key-must-be-32-chars-long-xx", 15*time.Minute, 24*time.Hour, "test")
	svc := usecase.NewAuthService(repo, hStubAuditRepo{}, mgr)
	return svc, mgr, repo
}

func hSeedUser(repo *hStubUserRepo, email string) *entity.User {
	hash, _ := password.Hash("Password1")
	branchID := "branch-1"
	u := &entity.User{
		ID:           "user-" + email,
		Email:        email,
		PasswordHash: hash,
		FullName:     "Test User",
		Role:         entity.RoleMember,
		BranchID:     &branchID,
		IsActive:     true,
	}
	_ = repo.Create(context.Background(), u)
	return u
}
