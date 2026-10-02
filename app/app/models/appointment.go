package models

import (
	"time"
)

type Patient struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Phone     string    `gorm:"uniqueIndex" json:"phone"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type AppointmentStatus string

const (
	ApptPending   AppointmentStatus = "PENDING"
	ApptConfirmed AppointmentStatus = "CONFIRMED"
	ApptCancelled AppointmentStatus = "CANCELLED"
	ApptCompleted AppointmentStatus = "COMPLETED"
)

type Appointment struct {
	ID        uint              `gorm:"primaryKey" json:"id"`
	DoctorID  *uint             `json:"doctor_id"`
	ServiceID *uint             `json:"service_id"`
	Phone     string            `json:"phone"` // Patient's phone from WhatsApp
	Name      string            `json:"name"`  // Patient's name
	Date      string            `json:"date"`  // YYYY-MM-DD
	Time      string            `json:"time"`  // HH:MM
	Status    AppointmentStatus `json:"status" gorm:"default:'PENDING'"`
	Notes     string            `json:"notes"`
	CreatedAt time.Time         `json:"created_at"`
	UpdatedAt time.Time         `json:"updated_at"`

	// Relationships
	Doctor  *Doctor  `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	Service *Service `gorm:"foreignKey:ServiceID" json:"service,omitempty"`
}
