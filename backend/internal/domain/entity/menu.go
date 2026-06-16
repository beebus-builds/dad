package entity

import "time"

type MenuItem struct {
	ID        string    `json:"id"`
	Label     string    `json:"label"`
	Href      string    `json:"href"`
	SortOrder int       `json:"sortOrder"`
	IsActive  bool      `json:"isActive"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
