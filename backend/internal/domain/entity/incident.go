package entity

import "time"

const (
	IncidentSeverityMinor    = "MINOR"
	IncidentSeverityModerate = "MODERATE"
	IncidentSeveritySevere   = "SEVERE"
	IncidentSeverityFatal    = "FATAL"

	IncidentStatusReported     = "REPORTED"
	IncidentStatusInvestigating = "INVESTIGATING"
	IncidentStatusResolved     = "RESOLVED"
)

type Incident struct {
	ID             string    `json:"id" db:"id"`
	IncidentNumber string    `json:"incidentNumber" db:"incident_number"`
	Title          string    `json:"title" db:"title"`
	Description    string    `json:"description" db:"description"`
	Severity       string    `json:"severity" db:"severity"`
	OccurredAt     time.Time `json:"occurredAt" db:"occurred_at"`
	Location       string    `json:"location" db:"location"`
	WorkplaceName  *string   `json:"workplaceName,omitempty" db:"workplace_name"`
	ReportedBy     string    `json:"reportedBy" db:"reported_by"`
	BranchID       *string   `json:"branchId,omitempty" db:"branch_id"`
	Status         string    `json:"status" db:"status"`
	CreatedAt      time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time `json:"updatedAt" db:"updated_at"`
}
