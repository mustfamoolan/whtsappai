package controllers

import (
	"app/app/services/whatsapp"
	"app/bootstrap"
	"github.com/gofiber/fiber/v2"
)

func GetWhatsAppStatus(c *fiber.Ctx) error {
	svc := whatsapp.GetService(bootstrap.Log)
	stats := svc.GetStats()
	return c.JSON(stats)
}

func GetWhatsAppQR(c *fiber.Ctx) error {
	svc := whatsapp.GetService(bootstrap.Log)
	qr := svc.GetQR()
	
	if qr == "" {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "No QR code available",
		})
	}
	
	return c.JSON(fiber.Map{
		"qr": qr,
	})
}

func ConnectWhatsApp(c *fiber.Ctx) error {
	svc := whatsapp.GetService(bootstrap.Log)
	err := svc.Connect()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	
	return c.JSON(fiber.Map{
		"message": "Connection initiated",
	})
}

func RefreshWhatsApp(c *fiber.Ctx) error {
	svc := whatsapp.GetService(bootstrap.Log)
	err := svc.Refresh()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	
	return c.JSON(fiber.Map{
		"message": "Refresh initiated",
	})
}

func LogoutWhatsApp(c *fiber.Ctx) error {
	svc := whatsapp.GetService(bootstrap.Log)
	err := svc.Logout()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	
	return c.JSON(fiber.Map{
		"message": "Logged out successfully",
	})
}
