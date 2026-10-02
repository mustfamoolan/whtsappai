package controllers

import (
	"app/app/models"
	"app/bootstrap"
	"github.com/gofiber/fiber/v2"
)

func GetAppointments(c *fiber.Ctx) error {
	var appointments []models.Appointment
	bootstrap.DB.Preload("Doctor").Preload("Service").Order("date desc, time desc").Find(&appointments)
	return c.JSON(appointments)
}

func CreateAppointment(c *fiber.Ctx) error {
	var appointment models.Appointment
	if err := c.BodyParser(&appointment); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	
	appointment.Status = models.ApptPending
	
	if err := bootstrap.DB.Create(&appointment).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	
	// Reload to get doctor and service info
	bootstrap.DB.Preload("Doctor").Preload("Service").First(&appointment, appointment.ID)
	
	return c.Status(201).JSON(appointment)
}

func UpdateAppointment(c *fiber.Ctx) error {
	id := c.Params("id")
	var appointment models.Appointment
	
	if err := bootstrap.DB.First(&appointment, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Appointment not found"})
	}
	
	if err := c.BodyParser(&appointment); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	
	if err := bootstrap.DB.Save(&appointment).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	
	bootstrap.DB.Preload("Doctor").Preload("Service").First(&appointment, appointment.ID)
	return c.JSON(appointment)
}

func DeleteAppointment(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := bootstrap.DB.Delete(&models.Appointment{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	
	return c.SendStatus(204)
}
