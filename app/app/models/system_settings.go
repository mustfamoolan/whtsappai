package models

import "gorm.io/gorm"

type SystemSettings struct {
	gorm.Model
	GeminiAPIKey         string `json:"gemini_api_key"`
	GeminiModel          string `json:"gemini_model"`
	PromptDos            string `json:"prompt_dos"`
	PromptDonts          string `json:"prompt_donts"`
	HandoffRules         string `json:"handoff_rules"`
	AdminWhatsAppNumbers string `json:"admin_whatsapp_numbers"` // Comma separated numbers
	AutoAITimeoutMinutes int    `json:"auto_ai_timeout_minutes" gorm:"default:5"`
}
