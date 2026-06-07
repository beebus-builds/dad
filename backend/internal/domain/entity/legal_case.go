package entity

import "time"

const (
	LegalStatusIntake   = "INTAKE"
	LegalStatusActive   = "ACTIVE"
	LegalStatusHearing  = "HEARING"
	LegalStatusResolved = "RESOLVED"
	LegalStatusClosed   = "CLOSED"
)

type LegalCase struct {
	ID               string     `json:"id" db:"id"`
	CaseNumber       string     `json:"caseNumber" db:"case_number"`
	Title            string     `json:"title" db:"title"`
	Description      string     `json:"description" db:"description"`
	Type             string     `json:"type" db:"type"`
	Status           string     `json:"status" db:"status"`
	MemberID         *string    `json:"memberId,omitempty" db:"member_id"`
	AssignedAdvisor  *string    `json:"assignedAdvisor,omitempty" db:"assigned_advisor"`
	BranchID         *string    `json:"branchId,omitempty" db:"branch_id"`
	FiledAt          time.Time  `json:"filedAt" db:"filed_at"`
	NextHearingAt    *time.Time `json:"nextHearingAt,omitempty" db:"next_hearing_at"`
	ResolvedAt       *time.Time `json:"resolvedAt,omitempty" db:"resolved_at"`
	CreatedAt        time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt        time.Time  `json:"updatedAt" db:"updated_at"`
}
