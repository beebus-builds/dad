package entity

import "time"

const (
	DonationStatusPending   = "PENDING"
	DonationStatusCompleted = "COMPLETED"
	DonationStatusFailed    = "FAILED"
	DonationStatusRefunded  = "REFUNDED"
)

type Donation struct {
	ID           string    `json:"id" db:"id"`
	ReceiptNumber string   `json:"receiptNumber" db:"receipt_number"`
	DonorName    string    `json:"donorName" db:"donor_name"`
	DonorEmail   *string   `json:"donorEmail,omitempty" db:"donor_email"`
	DonorPhone   *string   `json:"donorPhone,omitempty" db:"donor_phone"`
	Amount       float64   `json:"amount" db:"amount"`
	Currency     string    `json:"currency" db:"currency"`
	Method       string    `json:"method" db:"method"`
	Purpose      *string   `json:"purpose,omitempty" db:"purpose"`
	Status       string    `json:"status" db:"status"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
}
