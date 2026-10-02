package controllers

import (
	"app/app/models"
	"app/bootstrap"
	"github.com/gofiber/fiber/v2"
	"strconv"
	"math"
)

func GetAppointments(c *fiber.Ctx) error {
	db := bootstrap.DB.Model(&models.Appointment{})
	
	// Pagination parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "10"))
	
	if page < 1 { page = 1 }
	if perPage < 1 { perPage = 10 }
	if perPage > 100 { perPage = 100 } // max limit

	var total int64
	db.Count(&total)

	var appointments []models.Appointment
	db.Preload("Doctor").Preload("Service").Order("date desc, time desc").Offset((page - 1) * perPage).Limit(perPage).Find(&appointments)

	lastPage := math.Ceil(float64(total) / float64(perPage))
	if lastPage < 1 { lastPage = 1 }

	return c.JSON(fiber.Map{
		"data": appointments,
		"current_page": page,
		"last_page": lastPage,
		"total": total,
		"per_page": perPage,
	})
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
