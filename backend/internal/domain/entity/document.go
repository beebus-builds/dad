package entity

import "time"

const (
	DocumentVisibilityPublic  = "PUBLIC"
	DocumentVisibilityMembers = "MEMBERS"
	DocumentVisibilityAdmin   = "ADMIN"
)

type Document struct {
	ID          string    `json:"id" db:"id"`
	Title       string    `json:"title" db:"title"`
	Description *string   `json:"description,omitempty" db:"description"`
	FileURL     string    `json:"fileUrl" db:"file_url"`
	FileType    string    `json:"fileType" db:"file_type"`
	FileSize    int64     `json:"fileSize" db:"file_size"`
	Category    string    `json:"category" db:"category"`
	Visibility  string    `json:"visibility" db:"visibility"`
	UploadedBy  string    `json:"uploadedBy" db:"uploaded_by"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}
