package entity

import "time"

const (
	ComplaintStatusOpen     = "OPEN"
	ComplaintStatusInReview = "IN_REVIEW"
	ComplaintStatusEscalated = "ESCALATED"
	ComplaintStatusResolved = "RESOLVED"
	ComplaintStatusClosed   = "CLOSED"
)

const (
	ComplaintPriorityLow    = "LOW"
	ComplaintPriorityMedium = "MEDIUM"
	ComplaintPriorityHigh   = "HIGH"
	ComplaintPriorityUrgent = "URGENT"
)

type Complaint struct {
	ID           string     `json:"id" db:"id"`
	TicketNumber string     `json:"ticketNumber" db:"ticket_number"`
	Title        string     `json:"title" db:"title"`
	Description  string     `json:"description" db:"description"`
	Category     string     `json:"category" db:"category"`
	Priority     string     `json:"priority" db:"priority"`
	Status       string     `json:"status" db:"status"`
	SubmittedBy  string     `json:"submittedBy" db:"submitted_by"`
	AssignedTo   *string    `json:"assignedTo,omitempty" db:"assigned_to"`
	BranchID     *string    `json:"branchId,omitempty" db:"branch_id"`
	CreatedAt    time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time  `json:"updatedAt" db:"updated_at"`
	ResolvedAt   *time.Time `json:"resolvedAt,omitempty" db:"resolved_at"`
	DeletedAt    *time.Time `json:"-" db:"deleted_at"`
}
