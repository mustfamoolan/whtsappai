package models

import (
	"time"
)

// Clinic info
type Clinic struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `json:"name"`
	Address      string    `json:"address"`
	Phone        string    `json:"phone"`
	WorkingHours string    `json:"working_hours"`
	Location     string    `json:"location"` // maps link or coordinate
	Description  string    `json:"description"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Doctor info
type Doctor struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `json:"name"`
	Specialty    string    `json:"specialty"`
	WorkingDays  string    `json:"working_days"`
	WorkingHours string    `json:"working_hours"`
	Active       bool      `gorm:"default:true" json:"active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Service info
type Service struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Duration    string    `json:"duration"` // e.g. "30 mins"
	Active      bool      `gorm:"default:true" json:"active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// FAQ info
type FAQ struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	Question       string    `json:"question"`
	ApprovedAnswer string    `json:"approved_answer"`
	Active         bool      `gorm:"default:true" json:"active"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
