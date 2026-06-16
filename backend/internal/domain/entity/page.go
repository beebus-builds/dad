package entity

import "time"

type Page struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug"`
	Content     string    `json:"content"`
	IsPublished bool      `json:"isPublished"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
