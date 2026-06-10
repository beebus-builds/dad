package entity

import "time"

type ContactMessage struct {
	ID        string    `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Email     string    `json:"email" db:"email"`
	Phone     *string   `json:"phone,omitempty" db:"phone"`
	Subject   string    `json:"subject" db:"subject"`
	Message   string    `json:"message" db:"message"`
	IsRead    bool      `json:"isRead" db:"is_read"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}
