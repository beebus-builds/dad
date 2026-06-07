package entity

import "time"

type Notification struct {
	ID        string    `json:"id" db:"id"`
	UserID    string    `json:"userId" db:"user_id"`
	Title     string    `json:"title" db:"title"`
	Body      string    `json:"body" db:"body"`
	Type      string    `json:"type" db:"type"`
	Link      *string   `json:"link,omitempty" db:"link"`
	IsRead    bool      `json:"isRead" db:"is_read"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

type AuditLog struct {
	ID         string    `json:"id" db:"id"`
	UserID     *string   `json:"userId,omitempty" db:"user_id"`
	Action     string    `json:"action" db:"action"`
	Resource   string    `json:"resource" db:"resource"`
	ResourceID *string   `json:"resourceId,omitempty" db:"resource_id"`
	IP         *string   `json:"ip,omitempty" db:"ip"`
	UserAgent  *string   `json:"userAgent,omitempty" db:"user_agent"`
	Metadata   []byte    `json:"metadata,omitempty" db:"metadata"`
	CreatedAt  time.Time `json:"createdAt" db:"created_at"`
}
