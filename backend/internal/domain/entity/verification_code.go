package entity

import "time"

type VerificationCode struct {
	ID        string     `json:"id" db:"id"`
	UserID    string     `json:"userId" db:"user_id"`
	Code      string     `json:"code" db:"code"`
	Type      string     `json:"type" db:"type"`
	ExpiresAt time.Time  `json:"expiresAt" db:"expires_at"`
	UsedAt    *time.Time `json:"usedAt,omitempty" db:"used_at"`
	CreatedAt time.Time  `json:"createdAt" db:"created_at"`
}
