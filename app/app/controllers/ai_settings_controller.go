package controllers

import (
	"app/app/models"
	"app/bootstrap"
	"github.com/gofiber/fiber/v2"
)

func GetSystemSettings(c *fiber.Ctx) error {
	var settings models.SystemSettings
	// We only need one row for system settings, so we just get the first one.
	if err := bootstrap.DB.First(&settings).Error; err != nil {
		// If not found, return empty settings
		return c.JSON(models.SystemSettings{})
	}
	return c.JSON(settings)
}

func UpdateSystemSettings(c *fiber.Ctx) error {
	var req models.SystemSettings
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var settings models.SystemSettings
	if err := bootstrap.DB.First(&settings).Error; err != nil {
		// Create if not exists
		bootstrap.DB.Create(&req)
		return c.JSON(req)
	}

	// Update existing
	settings.GeminiAPIKey = req.GeminiAPIKey
	settings.GeminiModel = req.GeminiModel
	settings.PromptDos = req.PromptDos
	settings.PromptDonts = req.PromptDonts
	settings.HandoffRules = req.HandoffRules
	settings.AdminWhatsAppNumbers = req.AdminWhatsAppNumbers
	bootstrap.DB.Save(&settings)

	return c.JSON(settings)
}

func GetAIPersonas(c *fiber.Ctx) error {
	var personas []models.AIPersona
	if err := bootstrap.DB.Find(&personas).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch personas"})
	}
	return c.JSON(personas)
}

func CreateAIPersona(c *fiber.Ctx) error {
	var req models.AIPersona
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if err := bootstrap.DB.Create(&req).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create persona"})
	}
	return c.JSON(req)
}

func UpdateAIPersona(c *fiber.Ctx) error {
	id := c.Params("id")
	var persona models.AIPersona
	if err := bootstrap.DB.First(&persona, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Persona not found"})
	}

	var req models.AIPersona
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	persona.Name = req.Name
	persona.Gender = req.Gender
	persona.Dialect = req.Dialect
	persona.Description = req.Description
	persona.IsActive = req.IsActive

	bootstrap.DB.Save(&persona)
	return c.JSON(persona)
}

func DeleteAIPersona(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := bootstrap.DB.Delete(&models.AIPersona{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete persona"})
	}
	return c.JSON(fiber.Map{"message": "Deleted successfully"})
}
