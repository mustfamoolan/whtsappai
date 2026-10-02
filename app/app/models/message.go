package models

import (
	"time"
)

type MessageType string

const (
	MsgTypeText     MessageType = "Text"
	MsgTypeImage    MessageType = "Image"
	MsgTypeDocument MessageType = "Document"
)

type MessageDirection string

const (
	DirIncoming MessageDirection = "Incoming"
	DirOutgoing MessageDirection = "Outgoing"
)

type Message struct {
	ID             string           `gorm:"primaryKey;type:varchar(100)" json:"message_id"` // WhatsApp message ID
	ConversationID string           `gorm:"type:varchar(50);index" json:"conversation_id"`
	Sender         string           `gorm:"type:varchar(50)" json:"sender"`
	Direction      MessageDirection `gorm:"type:varchar(20)" json:"direction"`
	Timestamp      time.Time        `gorm:"index" json:"timestamp"`
	Type           MessageType      `gorm:"type:varchar(20)" json:"message_type"`
	Content        string           `gorm:"type:text" json:"content"`
	Status         string           `gorm:"type:varchar(20)" json:"status"`
	CreatedAt      time.Time        `json:"created_at"`
	SentAt         *time.Time       `json:"sent_at,omitempty"`
	Error          string           `gorm:"type:text" json:"error,omitempty"`

	Conversation   Conversation     `gorm:"foreignKey:ConversationID" json:"-"`
}
