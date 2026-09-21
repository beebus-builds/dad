package entity

import "time"

const (
	CampaignStatusDraft     = "DRAFT"
	CampaignStatusScheduled = "SCHEDULED"
	CampaignStatusSending   = "SENDING"
	CampaignStatusSent      = "SENT"
	CampaignStatusFailed    = "FAILED"
	CampaignStatusCancelled = "CANCELLED"

	RecipientStatusPending = "PENDING"
	RecipientStatusSent    = "SENT"
	RecipientStatusFailed  = "FAILED"
	RecipientStatusBounced = "BOUNCED"
)

// CampaignSegment describes who a campaign targets — resolved against
// MemberRepository.List at creation/scheduling time to materialize the
// recipient list, so the send step only ever touches campaign_recipients.
type CampaignSegment struct {
	BranchID string `json:"branchId,omitempty"`
	Tier     string `json:"tier,omitempty"`
	Status   string `json:"status,omitempty"`
	Tag      string `json:"tag,omitempty"`
}

type Campaign struct {
	ID            string          `json:"id" db:"id"`
	Name          string          `json:"name" db:"name"`
	Subject       string          `json:"subject" db:"subject"`
	Body          string          `json:"body" db:"body"`
	SegmentFilter CampaignSegment `json:"segment" db:"segment_filter"`
	ScheduledAt   *time.Time      `json:"scheduledAt,omitempty" db:"scheduled_at"`
	Status        string          `json:"status" db:"status"`
	SentAt        *time.Time      `json:"sentAt,omitempty" db:"sent_at"`
	CreatedBy     string          `json:"createdBy" db:"created_by"`
	CreatedAt     time.Time       `json:"createdAt" db:"created_at"`
	UpdatedAt     time.Time       `json:"updatedAt" db:"updated_at"`
}

type CampaignRecipient struct {
	ID         string     `json:"id" db:"id"`
	CampaignID string     `json:"campaignId" db:"campaign_id"`
	MemberID   string     `json:"memberId" db:"member_id"`
	Email      string     `json:"email" db:"email"`
	Status     string     `json:"status" db:"status"`
	SentAt     *time.Time `json:"sentAt,omitempty" db:"sent_at"`
	Error      *string    `json:"error,omitempty" db:"error"`
	CreatedAt  time.Time  `json:"createdAt" db:"created_at"`
}

type CampaignStats struct {
	Total   int `json:"total"`
	Pending int `json:"pending"`
	Sent    int `json:"sent"`
	Failed  int `json:"failed"`
	Bounced int `json:"bounced"`
}
