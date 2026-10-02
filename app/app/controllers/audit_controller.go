package controllers

import (
	"github.com/gofiber/fiber/v2"
	"app/app/models"
	"app/bootstrap"
	"strconv"
	"math"
)

func GetAuditLogs(c *fiber.Ctx) error {
	db := bootstrap.DB.Model(&models.AuditLog{})
	
	// Optional filtering by event type
	event := c.Query("event")
	if event != "" {
		db = db.Where("event = ?", event)
	} else {
		// Default: exclude noisy chat events unless explicitly requested
		db = db.Where("event NOT IN ?", []string{"AI_REPLY", "HUMAN_REPLY", "AI_TRACE"})
	}

	// Pagination parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "10"))
	
	if page < 1 { page = 1 }
	if perPage < 1 { perPage = 10 }
	if perPage > 100 { perPage = 100 } // max limit

	var total int64
	db.Count(&total)

	var logs []models.AuditLog
	if err := db.Order("created_at desc").Offset((page - 1) * perPage).Limit(perPage).Find(&logs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch audit logs"})
	}

	lastPage := math.Ceil(float64(total) / float64(perPage))
	if lastPage < 1 { lastPage = 1 }

	return c.JSON(fiber.Map{
		"data": logs,
		"current_page": page,
		"last_page": lastPage,
		"total": total,
		"per_page": perPage,
	})
}
