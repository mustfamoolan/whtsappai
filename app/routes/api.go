package routes

import (
	"app/app/controllers"
	"app/app/middleware"
	"github.com/gofiber/fiber/v2"
)

func RegisterAPIRoutes(app *fiber.App) {
	api := app.Group("/api")

	// Example V1 Grouping
	v1 := api.Group("/v1")

	// Resource routes
	v1.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "version": "v1"})
	})

	// Public Auth routes
	authController := &controllers.AuthController{}
	auth := v1.Group("/auth")
	auth.Post("/login", authController.Login)
	auth.Post("/logout", authController.Logout)

	// Public Knowledge routes
	kbPublic := v1.Group("/knowledge")
	kbPublic.Get("/clinic", controllers.GetClinicInfo)

	// Protected Group
	protected := v1.Group("", middleware.AuthMiddleware())
	
	// Protected Auth routes
	authProtected := protected.Group("/auth")
	authProtected.Post("/register", authController.Register)
	authProtected.Get("/me", authController.Me)

	// WhatsApp routes
	wa := protected.Group("/whatsapp")
	wa.Get("/status", controllers.GetWhatsAppStatus)
	wa.Get("/qr", controllers.GetWhatsAppQR)
	wa.Post("/connect", controllers.ConnectWhatsApp)
	wa.Post("/logout", controllers.LogoutWhatsApp)

	// Chat routes
	chat := protected.Group("/chat")
	chat.Get("/conversations", controllers.GetConversations)
	chat.Get("/conversations/:id/messages", controllers.GetMessages)
	chat.Put("/conversations/:id/mode", controllers.UpdateConversationMode)
	chat.Put("/conversations/:id/read", controllers.MarkConversationRead)
	chat.Delete("/conversations/:id", controllers.DeleteConversation)
	chat.Post("/messages", controllers.SendMessage)

	// Appointments routes
	appt := protected.Group("/appointments")
	appt.Get("/", controllers.GetAppointments)
	appt.Post("/", controllers.CreateAppointment)
	appt.Put("/:id", controllers.UpdateAppointment)
	appt.Delete("/:id", controllers.DeleteAppointment)

	// Knowledge routes
	kb := protected.Group("/knowledge")
	
	kb.Put("/clinic", controllers.UpdateClinicInfo)
	
	kb.Get("/doctors", controllers.GetDoctors)
	kb.Post("/doctors", controllers.CreateDoctor)
	kb.Put("/doctors/:id", controllers.UpdateDoctor)
	kb.Delete("/doctors/:id", controllers.DeleteDoctor)
	
	kb.Get("/services", controllers.GetServices)
	kb.Post("/services", controllers.CreateService)
	kb.Put("/services/:id", controllers.UpdateService)
	kb.Delete("/services/:id", controllers.DeleteService)
	
	kb.Get("/faqs", controllers.GetFAQs)
	kb.Post("/faqs", controllers.CreateFAQ)
	kb.Put("/faqs/:id", controllers.UpdateFAQ)
	kb.Delete("/faqs/:id", controllers.DeleteFAQ)

	// Notifications routes
	notifs := protected.Group("/notifications")
	notifs.Get("/", controllers.GetNotifications)
	notifs.Put("/read-all", controllers.MarkAllNotificationsRead)
	notifs.Put("/:id/read", controllers.MarkNotificationRead)

	// Audit routes
	audit := protected.Group("/audit")
	audit.Get("/", controllers.GetAuditLogs)

	// AI Settings routes
	aiSettings := protected.Group("/ai-settings")
	aiSettings.Get("/", controllers.GetSystemSettings)
	aiSettings.Put("/", controllers.UpdateSystemSettings)

	// AI Personas routes
	personas := protected.Group("/ai-personas")
	personas.Get("/", controllers.GetAIPersonas)
	personas.Post("/", controllers.CreateAIPersona)
	personas.Put("/:id", controllers.UpdateAIPersona)
	personas.Delete("/:id", controllers.DeleteAIPersona)
}
