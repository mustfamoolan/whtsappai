package controllers

import (
	"github.com/gofiber/fiber/v2"
	"app/app/models"
	"app/bootstrap"
)

func GetAuditLogs(c *fiber.Ctx) error {
	var logs []models.AuditLog
	db := bootstrap.DB
	
	// Optional filtering by event type
	event := c.Query("event")
	if event != "" {
		db = db.Where("event = ?", event)
	}

	// Fetch logs ordered by most recent
	if err := db.Order("created_at desc").Limit(100).Find(&logs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch audit logs"})
	}

	return c.JSON(logs)
}
