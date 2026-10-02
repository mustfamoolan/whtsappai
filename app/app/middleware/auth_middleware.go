package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"strings"
)

func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := ""
		authHeader := c.Get("Authorization")
		if authHeader != "" {
			tokenString = strings.Replace(authHeader, "Bearer ", "", 1)
		} else {
			tokenString = c.Cookies("jwt")
		}

		if tokenString == "" {
			return c.Status(401).JSON(fiber.Map{"message": "Unauthorized"})
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte("super-secret-clinic-key-2026"), nil // Keep this consistent
		})

		if err != nil || !token.Valid {
			return c.Status(401).JSON(fiber.Map{"message": "Invalid token"})
		}

		c.Locals("user", token)
		return c.Next()
	}
}
