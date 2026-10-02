package models

import (
	"time"
)

type AuditEvent string

const (
	EventAIReply          AuditEvent = "AI_REPLY"
	EventHumanReply       AuditEvent = "HUMAN_REPLY"
	EventModeChange       AuditEvent = "MODE_CHANGE"
	EventApptCreated      AuditEvent = "APPT_CREATED"
	EventKnowledgeChanged AuditEvent = "KNOWLEDGE_CHANGED"
	EventWAConnected      AuditEvent = "WA_CONNECTED"
	EventWADisconnected   AuditEvent = "WA_DISCONNECTED"
	EventAITrace          AuditEvent = "AI_TRACE"
)

type AuditLog struct {
	ID        uint       `json:"id" gorm:"primarykey"`
	Event     AuditEvent `json:"event" gorm:"index"`
	Details   string     `json:"details"`
	EntityID  string     `json:"entity_id" gorm:"index"`
	Payload   string     `json:"payload"`
	CreatedAt time.Time  `json:"created_at"`
}
