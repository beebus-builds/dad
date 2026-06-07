package entity

import "time"

const (
	NewsStatusDraft     = "DRAFT"
	NewsStatusPublished = "PUBLISHED"
	NewsStatusArchived  = "ARCHIVED"
)

type News struct {
	ID            string     `json:"id" db:"id"`
	Slug          string     `json:"slug" db:"slug"`
	Title         string     `json:"title" db:"title"`
	TitleNepali   *string    `json:"titleNepali,omitempty" db:"title_nepali"`
	Excerpt       string     `json:"excerpt" db:"excerpt"`
	Content       string     `json:"content" db:"content"`
	CoverImageURL *string    `json:"coverImageUrl,omitempty" db:"cover_image_url"`
	Category      string     `json:"category" db:"category"`
	Status        string     `json:"status" db:"status"`
	AuthorID      string     `json:"authorId" db:"author_id"`
	Tags          []string   `json:"tags" db:"tags"`
	Views         int        `json:"views" db:"views"`
	PublishedAt   *time.Time `json:"publishedAt,omitempty" db:"published_at"`
	CreatedAt     time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt     time.Time  `json:"updatedAt" db:"updated_at"`
}
