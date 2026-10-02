package models

import (
	"time"
)

type NotificationType string

const (
	NotifTypeSystem  NotificationType = "SYSTEM"  // WhatsApp disconnected, AI errors
	NotifTypeHuman   NotificationType = "HUMAN"   // Patient wants human
	NotifTypeAppt    NotificationType = "APPT"    // New appointment
)

type Notification struct {
	ID        uint             `gorm:"primaryKey" json:"id"`
	Type      NotificationType `gorm:"type:varchar(20)" json:"type"`
	Title     string           `gorm:"type:varchar(255)" json:"title"`
	Message   string           `gorm:"type:text" json:"message"`
	IsRead    bool             `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time        `json:"created_at"`
}
