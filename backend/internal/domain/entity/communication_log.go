package entity

import "time"

const (
	CommChannelCall    = "CALL"
	CommChannelMeeting = "MEETING"
	CommChannelEmail   = "EMAIL"
	CommChannelNote    = "NOTE"
	CommChannelOther   = "OTHER"
)

// CommunicationLog is a manually-logged interaction with a member — a call,
// meeting, or note an admin records outside of the system's own workflows
// (complaints, donations, etc).
type CommunicationLog struct {
	ID         string    `json:"id" db:"id"`
	MemberID   string    `json:"memberId" db:"member_id"`
	LoggedBy   string    `json:"loggedBy" db:"logged_by"`
	Channel    string    `json:"channel" db:"channel"`
	Subject    string    `json:"subject" db:"subject"`
	Notes      string    `json:"notes" db:"notes"`
	OccurredAt time.Time `json:"occurredAt" db:"occurred_at"`
	CreatedAt  time.Time `json:"createdAt" db:"created_at"`
}
