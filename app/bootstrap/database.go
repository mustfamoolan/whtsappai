package bootstrap

import (
	"fmt"
	"log"

	"app/app/models"
	"app/config"
	"github.com/fatih/color"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitializeDatabase() *gorm.DB {
	var err error
	var dialector gorm.Dialector

	dbConfig := config.Global.Database

	switch dbConfig.Driver {
	case "mysql":
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			dbConfig.Username, dbConfig.Password, dbConfig.Host, dbConfig.Port, dbConfig.Database)
		dialector = mysql.Open(dsn)
	case "postgres":
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Shanghai",
			dbConfig.Host, dbConfig.Username, dbConfig.Password, dbConfig.Database, dbConfig.Port)
		dialector = postgres.Open(dsn)
	case "sqlite":
		dialector = sqlite.Open(dbConfig.Database + ".db")
	default:
		log.Fatalf("%s Unsupported database driver: %s", color.RedString("FATAL:"), dbConfig.Driver)
	}

	DB, err = gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		log.Fatalf("%s Failed to connect to database: %v", color.RedString("FATAL:"), err)
	}

	fmt.Printf("%s Database connected successfully (%s)\n", color.CyanString("⚙️"), dbConfig.Driver)
	
	err = DB.AutoMigrate(
		&models.User{},
		&models.Conversation{},
		&models.Message{},
		&models.Clinic{},
		&models.Doctor{},
		&models.Service{},
		&models.FAQ{},
		&models.Patient{},
		&models.Appointment{},
		&models.Notification{},
		&models.AuditLog{},
		&models.SystemSettings{},
		&models.AIPersona{},
	)
	if err != nil {
		log.Printf("%s Failed to auto-migrate database: %v", color.YellowString("WARN:"), err)
	} else {
		fmt.Printf("%s Database migrated successfully\n", color.CyanString("⚙️"))
	}
	
	// Seed admin user
	var count int64
	DB.Model(&models.User{}).Count(&count)
	if count == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("12345678"), bcrypt.DefaultCost)
		admin := models.User{
			Name:     "Admin",
			Email:    "admin",
			Password: string(hash),
		}
		DB.Create(&admin)
	}
	
	return DB
}
