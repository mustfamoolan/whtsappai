package models

import (
	"time"
)

type ConversationMode string

const (
	ModeAI     ConversationMode = "AI"
	ModeHuman  ConversationMode = "HUMAN"
	ModePaused ConversationMode = "PAUSED"
	ModeClosed ConversationMode = "CLOSED"
)

type Conversation struct {
	ID           string           `gorm:"primaryKey;type:varchar(50)" json:"conversation_id"` // e.g., remote JID
	Phone        string           `gorm:"type:varchar(30);index" json:"phone"`
	Name         string           `gorm:"type:varchar(100)" json:"name"`
	Status       string           `gorm:"type:varchar(50)" json:"status"`
	Mode         ConversationMode `gorm:"type:varchar(20);default:'AI'" json:"mode"`
	LastMessage  string           `gorm:"type:text" json:"last_message"`
	LastActivity time.Time        `gorm:"index" json:"last_activity"`
	UnreadCount       int              `gorm:"default:0" json:"unread_count"`
	AssignedPersonaID uint             `json:"assigned_persona_id"`
	Rating            int              `gorm:"default:0" json:"rating"` // 1-5 rating
	CreatedAt         time.Time        `json:"created_at"`
	UpdatedAt         time.Time        `json:"updated_at"`
}
