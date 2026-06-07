package entity

import "time"

const (
	EventStatusDraft     = "DRAFT"
	EventStatusPublished = "PUBLISHED"
	EventStatusCancelled = "CANCELLED"
	EventStatusCompleted = "COMPLETED"
)

type Event struct {
	ID              string     `json:"id" db:"id"`
	Title           string     `json:"title" db:"title"`
	TitleNepali     *string    `json:"titleNepali,omitempty" db:"title_nepali"`
	Slug            string     `json:"slug" db:"slug"`
	Description     string     `json:"description" db:"description"`
	Category        string     `json:"category" db:"category"`
	Status          string     `json:"status" db:"status"`
	StartsAt        time.Time  `json:"startsAt" db:"starts_at"`
	EndsAt          time.Time  `json:"endsAt" db:"ends_at"`
	Location        string     `json:"location" db:"location"`
	Capacity        *int       `json:"capacity,omitempty" db:"capacity"`
	RegisteredCount int        `json:"registeredCount" db:"registered_count"`
	CoverImageURL   *string    `json:"coverImageUrl,omitempty" db:"cover_image_url"`
	BranchID        *string    `json:"branchId,omitempty" db:"branch_id"`
	CreatedBy       string     `json:"createdBy" db:"created_by"`
	CreatedAt       time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time  `json:"updatedAt" db:"updated_at"`
}
