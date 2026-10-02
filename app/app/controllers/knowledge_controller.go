package controllers

import (
	"app/app/models"
	"app/bootstrap"
	"github.com/gofiber/fiber/v2"
)

// --- CLINIC ---

func GetClinicInfo(c *fiber.Ctx) error {
	var clinic models.Clinic
	if err := bootstrap.DB.First(&clinic).Error; err != nil {
		// If not found, return empty
		return c.JSON(fiber.Map{})
	}
	return c.JSON(clinic)
}

func UpdateClinicInfo(c *fiber.Ctx) error {
	var req models.Clinic
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	var clinic models.Clinic
	if err := bootstrap.DB.First(&clinic).Error; err != nil {
		// Create if not exists
		bootstrap.DB.Create(&req)
		return c.JSON(req)
	}

	// Update existing
	clinic.Name = req.Name
	clinic.Address = req.Address
	clinic.Phone = req.Phone
	clinic.WorkingHours = req.WorkingHours
	clinic.Location = req.Location
	clinic.Description = req.Description
	bootstrap.DB.Save(&clinic)

	return c.JSON(clinic)
}

// --- DOCTORS ---

func GetDoctors(c *fiber.Ctx) error {
	var docs []models.Doctor
	bootstrap.DB.Find(&docs)
	return c.JSON(docs)
}

func CreateDoctor(c *fiber.Ctx) error {
	var doc models.Doctor
	if err := c.BodyParser(&doc); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	bootstrap.DB.Create(&doc)
	return c.JSON(doc)
}

func UpdateDoctor(c *fiber.Ctx) error {
	id := c.Params("id")
	var doc models.Doctor
	if err := bootstrap.DB.First(&doc, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Not found"})
	}
	if err := c.BodyParser(&doc); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	bootstrap.DB.Save(&doc)
	return c.JSON(doc)
}

func DeleteDoctor(c *fiber.Ctx) error {
	id := c.Params("id")
	bootstrap.DB.Delete(&models.Doctor{}, id)
	return c.JSON(fiber.Map{"message": "Deleted"})
}

// --- SERVICES ---

func GetServices(c *fiber.Ctx) error {
	var svcs []models.Service
	bootstrap.DB.Find(&svcs)
	return c.JSON(svcs)
}

func CreateService(c *fiber.Ctx) error {
	var svc models.Service
	if err := c.BodyParser(&svc); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	bootstrap.DB.Create(&svc)
	return c.JSON(svc)
}

func UpdateService(c *fiber.Ctx) error {
	id := c.Params("id")
	var svc models.Service
	if err := bootstrap.DB.First(&svc, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Not found"})
	}
	if err := c.BodyParser(&svc); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	bootstrap.DB.Save(&svc)
	return c.JSON(svc)
}

func DeleteService(c *fiber.Ctx) error {
	id := c.Params("id")
	bootstrap.DB.Delete(&models.Service{}, id)
	return c.JSON(fiber.Map{"message": "Deleted"})
}

// --- FAQ ---

func GetFAQs(c *fiber.Ctx) error {
	var faqs []models.FAQ
	bootstrap.DB.Find(&faqs)
	return c.JSON(faqs)
}

func CreateFAQ(c *fiber.Ctx) error {
	var faq models.FAQ
	if err := c.BodyParser(&faq); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	bootstrap.DB.Create(&faq)
	return c.JSON(faq)
}

func UpdateFAQ(c *fiber.Ctx) error {
	id := c.Params("id")
	var faq models.FAQ
	if err := bootstrap.DB.First(&faq, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Not found"})
	}
	if err := c.BodyParser(&faq); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	bootstrap.DB.Save(&faq)
	return c.JSON(faq)
}

func DeleteFAQ(c *fiber.Ctx) error {
	id := c.Params("id")
	bootstrap.DB.Delete(&models.FAQ{}, id)
	return c.JSON(fiber.Map{"message": "Deleted"})
}
