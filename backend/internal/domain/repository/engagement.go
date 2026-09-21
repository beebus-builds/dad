package repository

import (
	"context"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
)

type MemberRepository interface {
	Create(ctx context.Context, m *entity.Member) error
	GetByID(ctx context.Context, id string) (*entity.Member, error)
	GetByMembershipNumber(ctx context.Context, num string) (*entity.Member, error)
	Update(ctx context.Context, id string, m *entity.Member) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, opts ListMembersOptions) ([]entity.Member, int, error)
	// GetTimeline aggregates complaints, donations, events, trainings, legal
	// cases, notifications and communication logs for one member into a
	// single chronological feed.
	GetTimeline(ctx context.Context, memberID string, page, pageSize int) ([]entity.TimelineEntry, int, error)
	// ListExpiringWithin returns ACTIVE members whose membership expires
	// within the given number of days and haven't been reminded in the last
	// 24 hours.
	ListExpiringWithin(ctx context.Context, days int) ([]entity.Member, error)
	MarkRenewalReminderSent(ctx context.Context, memberID string) error
}

type ListMembersOptions struct {
	Page     int
	PageSize int
	Search   string
	BranchID string
	// BranchIDs restricts results to one of several branches (used for
	// PROVINCE_ADMIN/DISTRICT_ADMIN scoping); ignored when BranchID is set.
	BranchIDs []string
	Status    string
	Tier      string
	// Tag filters to members carrying this tag (members.tags @> {tag}).
	Tag string
}

type CommunicationLogRepository interface {
	Create(ctx context.Context, l *entity.CommunicationLog) error
	ListByMember(ctx context.Context, memberID string, page, pageSize int) ([]entity.CommunicationLog, int, error)
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
	// BranchIDs restricts results to one of several branches (used for
	// PROVINCE_ADMIN/DISTRICT_ADMIN scoping); ignored when BranchID is set.
	BranchIDs []string
	UserID    string
}

type ComplaintNoteRepository interface {
	Create(ctx context.Context, n *entity.ComplaintNote) error
	ListByComplaint(ctx context.Context, complaintID string) ([]entity.ComplaintNote, error)
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
