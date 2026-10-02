package controllers

import (
	"time"
	"app/bootstrap"
	"app/app/models"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthController struct{}

var jwtSecret = []byte("super-secret-clinic-key-2026")

func (a *AuthController) Register(c *fiber.Ctx) error {
	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid data"})
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), 14)
	user.Password = string(hashedPassword)

	if err := bootstrap.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Could not create user"})
	}

	return c.Status(201).JSON(fiber.Map{"message": "User registered successfully"})
}

func (a *AuthController) Login(c *fiber.Ctx) error {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid input"})
	}

	var user models.User
	if err := bootstrap.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{"message": "Invalid credentials"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return c.Status(401).JSON(fiber.Map{"message": "Invalid credentials"})
	}

	// Generate JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	t, err := token.SignedString(jwtSecret)
	if err != nil {
		return c.SendStatus(500)
	}

	// Set cookie
	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    t,
		Expires:  time.Now().Add(time.Hour * 72),
		HTTPOnly: true,
		Secure:   false,
		SameSite: "Lax",
	})

	return c.JSON(fiber.Map{"token": t, "user": user})
}

func (a *AuthController) Logout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
	})

	return c.JSON(fiber.Map{"message": "Logged out successfully"})
}

func (a *AuthController) Me(c *fiber.Ctx) error {
	// Either from Locals (Header) or parse from Cookie
	var userID float64
	
	if userLocal := c.Locals("user"); userLocal != nil {
		token := userLocal.(*jwt.Token)
		claims := token.Claims.(jwt.MapClaims)
		userID = claims["user_id"].(float64)
	} else {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized"})
	}

	var dbUser models.User
	bootstrap.DB.First(&dbUser, uint(userID))
	if dbUser.ID == 0 {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized"})
	}

	return c.JSON(dbUser)
}

