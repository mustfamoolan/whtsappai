package models

import (
	"time"
)

const (
	OutboxPending = "PENDING"
	OutboxSent    = "SENT"
	OutboxFailed  = "FAILED"
)

type OutboxMessage struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	JID       string    `json:"jid"`
	Text      string    `json:"text"`
	Status    string    `json:"status"` // PENDING, SENT, FAILED
	Retries   int       `json:"retries"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
