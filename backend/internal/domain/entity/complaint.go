package entity

import "time"

const (
	ComplaintStatusOpen      = "OPEN"
	ComplaintStatusInReview  = "IN_REVIEW"
	ComplaintStatusEscalated = "ESCALATED"
	ComplaintStatusResolved  = "RESOLVED"
	ComplaintStatusClosed    = "CLOSED"
)

const (
	ComplaintPriorityLow    = "LOW"
	ComplaintPriorityMedium = "MEDIUM"
	ComplaintPriorityHigh   = "HIGH"
	ComplaintPriorityUrgent = "URGENT"
)

type Complaint struct {
	ID               string     `json:"id" db:"id"`
	TicketNumber     string     `json:"ticketNumber" db:"ticket_number"`
	Title            string     `json:"title" db:"title"`
	Description      string     `json:"description" db:"description"`
	Category         string     `json:"category" db:"category"`
	Priority         string     `json:"priority" db:"priority"`
	Status           string     `json:"status" db:"status"`
	SubmittedBy      string     `json:"submittedBy" db:"submitted_by"`
	AssignedTo       *string    `json:"assignedTo,omitempty" db:"assigned_to"`
	BranchID         *string    `json:"branchId,omitempty" db:"branch_id"`
	CreatedAt        time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt        time.Time  `json:"updatedAt" db:"updated_at"`
	ResolvedAt       *time.Time `json:"resolvedAt,omitempty" db:"resolved_at"`
	DueAt            *time.Time `json:"dueAt,omitempty" db:"due_at"`
	FirstRespondedAt *time.Time `json:"firstRespondedAt,omitempty" db:"first_responded_at"`
	// IsOverdue is computed at read time (not stored) — true when DueAt has
	// passed and the complaint hasn't reached a terminal status.
	IsOverdue bool       `json:"isOverdue"`
	DeletedAt *time.Time `json:"-" db:"deleted_at"`
}

// ComputeOverdue sets IsOverdue based on DueAt and Status. Call after
// loading a Complaint from storage.
func (c *Complaint) ComputeOverdue() {
	c.IsOverdue = c.DueAt != nil && time.Now().After(*c.DueAt) &&
		c.Status != ComplaintStatusResolved && c.Status != ComplaintStatusClosed
}

// DueDurationForPriority returns how long a complaint of the given priority
// has before it's considered overdue.
func DueDurationForPriority(priority string) time.Duration {
	switch priority {
	case ComplaintPriorityUrgent:
		return 24 * time.Hour
	case ComplaintPriorityHigh:
		return 3 * 24 * time.Hour
	case ComplaintPriorityLow:
		return 14 * 24 * time.Hour
	default: // MEDIUM and anything unrecognized
		return 7 * 24 * time.Hour
	}
}
