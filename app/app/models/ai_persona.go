package models

import "gorm.io/gorm"

type AIPersona struct {
	gorm.Model
	Name        string `json:"name"`
	Gender      string `json:"gender"`
	Dialect     string `json:"dialect"`
	Description string `json:"description" gorm:"type:text"`
	IsActive    bool   `json:"is_active" gorm:"default:true"`
}
