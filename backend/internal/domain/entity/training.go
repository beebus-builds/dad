package entity

import "time"

const (
	TrainingStatusUpcoming  = "UPCOMING"
	TrainingStatusOngoing   = "ONGOING"
	TrainingStatusCompleted = "COMPLETED"
)

type Training struct {
	ID              string    `json:"id" db:"id"`
	Title           string    `json:"title" db:"title"`
	TitleNepali     *string   `json:"titleNepali,omitempty" db:"title_nepali"`
	Description     string    `json:"description" db:"description"`
	StartsAt        time.Time `json:"startsAt" db:"starts_at"`
	EndsAt          time.Time `json:"endsAt" db:"ends_at"`
	Location        string    `json:"location" db:"location"`
	Trainer         *string   `json:"trainer,omitempty" db:"trainer"`
	Capacity        *int      `json:"capacity,omitempty" db:"capacity"`
	RegisteredCount int       `json:"registeredCount" db:"registered_count"`
	Status          string    `json:"status" db:"status"`
	BranchID        *string   `json:"branchId,omitempty" db:"branch_id"`
	CreatedBy       string    `json:"createdBy" db:"created_by"`
	CreatedAt       time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time `json:"updatedAt" db:"updated_at"`
}
