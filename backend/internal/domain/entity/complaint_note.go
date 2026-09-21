package entity

import "time"

// ComplaintNote maps onto the existing complaint_comments table — a case
// note/update left by an admin against a complaint.
type ComplaintNote struct {
	ID          string    `json:"id" db:"id"`
	ComplaintID string    `json:"complaintId" db:"complaint_id"`
	UserID      string    `json:"userId" db:"user_id"`
	Body        string    `json:"body" db:"body"`
	IsInternal  bool      `json:"isInternal" db:"is_internal"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}
