package controllers

import (
	"app/app/models"
	"app/bootstrap"
	"github.com/gofiber/fiber/v2"
)

// GetNotifications returns all notifications, ordered by newest first
func GetNotifications(c *fiber.Ctx) error {
	var notifications []models.Notification
	if err := bootstrap.DB.Order("created_at desc").Limit(50).Find(&notifications).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(notifications)
}

// MarkNotificationRead marks a specific notification as read
func MarkNotificationRead(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is required"})
	}

	if err := bootstrap.DB.Model(&models.Notification{}).Where("id = ?", id).Update("is_read", true).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Notification marked as read"})
}

// MarkAllNotificationsRead marks all notifications as read
func MarkAllNotificationsRead(c *fiber.Ctx) error {
	if err := bootstrap.DB.Model(&models.Notification{}).Where("is_read = ?", false).Update("is_read", true).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "All notifications marked as read"})
}
