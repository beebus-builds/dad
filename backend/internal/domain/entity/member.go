package entity

import "time"

const (
	MemberTierStandard  = "STANDARD"
	MemberTierLifetime  = "LIFETIME"
	MemberTierHonorary  = "HONORARY"
	MemberStatusActive  = "ACTIVE"
	MemberStatusInactive = "INACTIVE"
	MemberStatusSuspended = "SUSPENDED"
	MemberStatusExpired = "EXPIRED"
)

type Member struct {
	ID                string     `json:"id" db:"id"`
	MembershipNumber  string     `json:"membershipNumber" db:"membership_number"`
	UserID            *string    `json:"userId,omitempty" db:"user_id"`
	FullName          string     `json:"fullName" db:"full_name"`
	FullNameNepali    *string    `json:"fullNameNepali,omitempty" db:"full_name_nepali"`
	Email             *string    `json:"email,omitempty" db:"email"`
	Phone             string     `json:"phone" db:"phone"`
	DateOfBirth       *time.Time `json:"dateOfBirth,omitempty" db:"date_of_birth"`
	Gender            *string    `json:"gender,omitempty" db:"gender"`
	CitizenshipNumber *string    `json:"citizenshipNumber,omitempty" db:"citizenship_number"`
	Occupation        *string    `json:"occupation,omitempty" db:"occupation"`
	Employer          *string    `json:"employer,omitempty" db:"employer"`
	Address           *string    `json:"address,omitempty" db:"address"`
	BranchID          string     `json:"branchId" db:"branch_id"`
	Tier              string     `json:"tier" db:"tier"`
	Status            string     `json:"status" db:"status"`
	JoinedAt          time.Time  `json:"joinedAt" db:"joined_at"`
	ExpiresAt         *time.Time `json:"expiresAt,omitempty" db:"expires_at"`
	AvatarURL         *string    `json:"avatarUrl,omitempty" db:"avatar_url"`
	CreatedAt         time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt         time.Time  `json:"updatedAt" db:"updated_at"`
	DeletedAt         *time.Time `json:"-" db:"deleted_at"`
}
