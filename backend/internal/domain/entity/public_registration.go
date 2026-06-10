package entity

import "time"

type PublicEventRegistration struct {
	ID           string    `json:"id" db:"id"`
	EventID      string    `json:"eventId" db:"event_id"`
	FullName     string    `json:"fullName" db:"full_name"`
	Email        *string   `json:"email,omitempty" db:"email"`
	Phone        *string   `json:"phone,omitempty" db:"phone"`
	Status       string    `json:"status" db:"status"`
	RegisteredAt time.Time `json:"registeredAt" db:"registered_at"`
}

type MemberApplication struct {
	ID         string     `json:"id" db:"id"`
	FullName   string     `json:"fullName" db:"full_name"`
	Email      *string    `json:"email,omitempty" db:"email"`
	Phone      string     `json:"phone" db:"phone"`
	Address    *string    `json:"address,omitempty" db:"address"`
	BranchID   *string    `json:"branchId,omitempty" db:"branch_id"`
	Occupation *string    `json:"occupation,omitempty" db:"occupation"`
	Employer   *string    `json:"employer,omitempty" db:"employer"`
	Notes      *string    `json:"notes,omitempty" db:"notes"`
	Status     string     `json:"status" db:"status"`
	CreatedAt  time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt  time.Time  `json:"updatedAt" db:"updated_at"`
}
