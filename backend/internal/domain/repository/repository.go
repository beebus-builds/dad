package repository

import (
	"context"
	"time"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
)

type UserRepository interface {
	Create(ctx context.Context, u *entity.User) error
	GetByID(ctx context.Context, id string) (*entity.User, error)
	GetByEmail(ctx context.Context, email string) (*entity.User, error)
	Update(ctx context.Context, id string, u *entity.User) error
	UpdatePassword(ctx context.Context, id, passwordHash string) error
	List(ctx context.Context, opts ListUsersOptions) ([]entity.User, int, error)
	UpdateLastLogin(ctx context.Context, id string) error
	Deactivate(ctx context.Context, id string) error
	MarkEmailVerified(ctx context.Context, id string) error
	Delete(ctx context.Context, id string) error
}

type VerificationCodeRepository interface {
	Create(ctx context.Context, v *entity.VerificationCode) error
	GetByUserIDAndCode(ctx context.Context, userID, code, codeType string) (*entity.VerificationCode, error)
	MarkUsed(ctx context.Context, id string) error
	DeleteByUserID(ctx context.Context, userID, codeType string) error
}

type PageRepository interface {
	Create(ctx context.Context, p *entity.Page) error
	GetByID(ctx context.Context, id string) (*entity.Page, error)
	GetBySlug(ctx context.Context, slug string) (*entity.Page, error)
	Update(ctx context.Context, id string, p *entity.Page) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]entity.Page, error)
}

type MenuRepository interface {
	Create(ctx context.Context, m *entity.MenuItem) error
	GetByID(ctx context.Context, id string) (*entity.MenuItem, error)
	Update(ctx context.Context, id string, m *entity.MenuItem) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]entity.MenuItem, error)
}

type ListUsersOptions struct {
	Page     int
	PageSize int
	Search   string
	Role     string
	BranchID string
}

type MemberRepository interface {
	Create(ctx context.Context, m *entity.Member) error
	GetByID(ctx context.Context, id string) (*entity.Member, error)
	GetByMembershipNumber(ctx context.Context, num string) (*entity.Member, error)
	Update(ctx context.Context, id string, m *entity.Member) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, opts ListMembersOptions) ([]entity.Member, int, error)
}

type ListMembersOptions struct {
	Page     int
	PageSize int
	Search   string
	BranchID string
	Status   string
	Tier     string
}

type BranchRepository interface {
	Create(ctx context.Context, b *entity.Branch) error
	GetByID(ctx context.Context, id string) (*entity.Branch, error)
	List(ctx context.Context) ([]entity.Branch, error)
	Update(ctx context.Context, id string, b *entity.Branch) error
	Delete(ctx context.Context, id string) error
}

type ComplaintRepository interface {
	Create(ctx context.Context, c *entity.Complaint) error
	GetByID(ctx context.Context, id string) (*entity.Complaint, error)
	Update(ctx context.Context, id string, c *entity.Complaint) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, opts ListComplaintsOptions) ([]entity.Complaint, int, error)
	GetStats(ctx context.Context) (map[string]int, error)
}

type ListComplaintsOptions struct {
	Page     int
	PageSize int
	Search   string
	Status   string
	Priority string
	BranchID string
	UserID   string
}

type EventRepository interface {
	Create(ctx context.Context, e *entity.Event) error
	GetByID(ctx context.Context, id string) (*entity.Event, error)
	GetBySlug(ctx context.Context, slug string) (*entity.Event, error)
	Update(ctx context.Context, id string, e *entity.Event) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, opts ListEventsOptions) ([]entity.Event, int, error)
	IncrementRegistered(ctx context.Context, id string) error
}

type ListEventsOptions struct {
	Page     int
	PageSize int
	Search   string
	Status   string
	Category string
	Upcoming bool
}

type NewsRepository interface {
	Create(ctx context.Context, n *entity.News) error
	GetByID(ctx context.Context, id string) (*entity.News, error)
	GetBySlug(ctx context.Context, slug string) (*entity.News, error)
	Update(ctx context.Context, id string, n *entity.News) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, opts ListNewsOptions) ([]entity.News, int, error)
	IncrementViews(ctx context.Context, id string) error
}

type ListNewsOptions struct {
	Page     int
	PageSize int
	Search   string
	Category string
	Status   string
}

type DocumentRepository interface {
	Create(ctx context.Context, d *entity.Document) error
	GetByID(ctx context.Context, id string) (*entity.Document, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, opts ListDocumentsOptions) ([]entity.Document, int, error)
}

type ListDocumentsOptions struct {
	Page       int
	PageSize   int
	Category   string
	Visibility string
	Search     string
}

type DonationRepository interface {
	Create(ctx context.Context, d *entity.Donation) error
	GetByID(ctx context.Context, id string) (*entity.Donation, error)
	Update(ctx context.Context, id string, d *entity.Donation) error
	List(ctx context.Context, opts ListDonationsOptions) ([]entity.Donation, int, error)
	SumTotal(ctx context.Context) (float64, error)
}

type ListDonationsOptions struct {
	Page     int
	PageSize int
	Status   string
	Method   string
}

type LegalCaseRepository interface {
	Create(ctx context.Context, c *entity.LegalCase) error
	GetByID(ctx context.Context, id string) (*entity.LegalCase, error)
	Update(ctx context.Context, id string, c *entity.LegalCase) error
	List(ctx context.Context, opts ListLegalCasesOptions) ([]entity.LegalCase, int, error)
}

type ListLegalCasesOptions struct {
	Page     int
	PageSize int
	Type     string
	Status   string
}

type TrainingRepository interface {
	Create(ctx context.Context, t *entity.Training) error
	GetByID(ctx context.Context, id string) (*entity.Training, error)
	Update(ctx context.Context, id string, t *entity.Training) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, opts ListTrainingsOptions) ([]entity.Training, int, error)
}

type ListTrainingsOptions struct {
	Page     int
	PageSize int
	Status   string
}

type IncidentRepository interface {
	Create(ctx context.Context, i *entity.Incident) error
	GetByID(ctx context.Context, id string) (*entity.Incident, error)
	Update(ctx context.Context, id string, i *entity.Incident) error
	List(ctx context.Context, opts ListIncidentsOptions) ([]entity.Incident, int, error)
}

type ListIncidentsOptions struct {
	Page     int
	PageSize int
	Severity string
	Status   string
}

type NotificationRepository interface {
	Create(ctx context.Context, n *entity.Notification) error
	List(ctx context.Context, userID string, limit int) ([]entity.Notification, error)
	MarkRead(ctx context.Context, id, userID string) error
	MarkAllRead(ctx context.Context, userID string) error
	UnreadCount(ctx context.Context, userID string) (int, error)
}

type AuditLogRepository interface {
	Create(ctx context.Context, log *entity.AuditLog) error
	List(ctx context.Context, opts ListAuditOptions) ([]entity.AuditLog, int, error)
}

type ListAuditOptions struct {
	Page     int
	PageSize int
	UserID   string
	Resource string
	Action   string
}

type PublicEventRegistrationRepository interface {
	Create(ctx context.Context, r *entity.PublicEventRegistration) error
	ListByEvent(ctx context.Context, eventID string) ([]entity.PublicEventRegistration, error)
}

type MemberApplicationRepository interface {
	Create(ctx context.Context, a *entity.MemberApplication) error
	List(ctx context.Context, opts ListMemberApplicationsOptions) ([]entity.MemberApplication, int, error)
}

type ListMemberApplicationsOptions struct {
	Page     int
	PageSize int
	Status   string
}

type ContactRepository interface {
	Create(ctx context.Context, m *entity.ContactMessage) error
	List(ctx context.Context, opts ListContactOptions) ([]entity.ContactMessage, int, error)
}

type ListContactOptions struct {
	Page   int
	PageSize int
	IsRead *bool
}

type PasswordResetTokenRepository interface {
	Create(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error
	GetByTokenHash(ctx context.Context, hash string) (*entity.PasswordResetToken, error)
	MarkUsed(ctx context.Context, id string) error
}
