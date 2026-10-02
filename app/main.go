package main

import (
	"fmt"
	"log"

	"app/app/services/whatsapp"
	"app/app/services/audit"
	"app/bootstrap"
	"app/config"
	"app/routes"
	"github.com/gofiber/fiber/v2"
)

func main() {
	// 1. Initialize Config
	bootstrap.InitializeConfig()

	// 1.1 Initialize Logger (Zap)
	bootstrap.InitializeLogger()

	// 1.2 Initialize Cache (Redis)
	bootstrap.InitializeCache()

	// 1.3 Start Audit Cleanup Job
	go audit.StartCleanupJob()

	// 2. Initialize Database
	bootstrap.InitializeDatabase()
	
	// Reset all conversations to AI mode on boot
	if bootstrap.DB != nil {
		bootstrap.DB.Exec("UPDATE conversations SET mode = 'AI' WHERE mode != 'AI'")
	}

	// 2.1 Initialize WhatsApp Service
	whatsapp.GetService(bootstrap.Log)

	// 3. Initialize Fiber
	app := fiber.New(fiber.Config{
		AppName: config.Global.App.Name + " - almoq3 Framework",
	})

	// 4. Register Routes
	routes.Register(app)

	port := config.Global.App.Port
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🚀 %s Started on port %s\n", config.Global.App.Name, port)
	log.Fatal(app.Listen(":" + port))
}
