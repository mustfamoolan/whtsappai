package controllers

import (
	"app/app/models"
	"app/bootstrap"
	"app/app/services/whatsapp"
	"app/app/services/audit"
	"github.com/gofiber/fiber/v2"
	"go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/proto/waE2E"
	"google.golang.org/protobuf/proto"
	"time"
	"net/url"
)

// GetConversations lists all conversations
func GetConversations(c *fiber.Ctx) error {
	var conversations []models.Conversation
	if err := bootstrap.DB.Order("last_activity desc").Find(&conversations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(conversations)
}

// GetMessages lists messages for a specific conversation
func GetMessages(c *fiber.Ctx) error {
	convID, _ := url.PathUnescape(c.Params("id"))
	if convID == "" {
		convID = c.Params("id")
	}
	var messages []models.Message
	if err := bootstrap.DB.Where("conversation_id = ?", convID).Order("timestamp asc").Find(&messages).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(messages)
}

// SendMessage sends a manual message
func SendMessage(c *fiber.Ctx) error {
	type Request struct {
		ConversationID string `json:"conversation_id"`
		Content        string `json:"content"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	svc := whatsapp.GetService(bootstrap.Log)
	if svc.GetState() != whatsapp.StateConnected {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "WhatsApp is not connected"})
	}

	client := svc.GetClient()
	if client == nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "WhatsApp client is not available"})
	}

	jid, err := types.ParseJID(req.ConversationID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid conversation ID (JID)"})
	}

	// Save to DB
	now := time.Now()
	msgID := "human-out-" + fmt.Sprintf("%d", now.UnixNano())

	newMsg := models.Message{
		ID:             msgID,
		ConversationID: req.ConversationID,
		Sender:         "me",
		Direction:      models.DirOutgoing,
		Timestamp:      now,
		Type:           models.MsgTypeText,
		Content:        req.Content,
		Status:         "SENT",
		SentAt:         &now,
	}

	// Enqueue to Outbox
	outboxMsg := models.OutboxMessage{
		JID:    jid.String(),
		Text:   req.Content,
		Status: models.OutboxPending,
	}
	bootstrap.DB.Create(&outboxMsg)

	if err := bootstrap.DB.Create(&newMsg).Error; err != nil {
		bootstrap.Log.Error("Failed to save outgoing message to DB: " + err.Error())
	}
	
	// Update Conversation
	bootstrap.DB.Model(&models.Conversation{}).Where("id = ?", req.ConversationID).Updates(map[string]interface{}{
		"last_message":  req.Content,
		"last_activity": now,
	})

	audit.LogEvent(models.EventHumanReply, "تم الرد يدوياً من لوحة التحكم", req.ConversationID, req.Content)

	return c.JSON(fiber.Map{"message": "Sent", "message_id": msgID})
}

// UpdateConversationMode updates the AI/HUMAN mode of a conversation
func UpdateConversationMode(c *fiber.Ctx) error {
	convID, _ := url.PathUnescape(c.Params("id"))
	if convID == "" {
		convID = c.Params("id")
	}
	
	type Request struct {
		Mode models.ConversationMode `json:"mode"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.Mode != models.ModeAI && req.Mode != models.ModeHuman && req.Mode != models.ModePaused && req.Mode != models.ModeClosed {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid mode"})
	}

	var conv models.Conversation
	if err := bootstrap.DB.Where("id = ?", convID).First(&conv).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Conversation not found"})
	}

	conv.Mode = req.Mode
	bootstrap.DB.Save(&conv)

	if req.Mode == models.ModeAI {
		audit.LogEvent(models.EventModeChange, "تم تفعيل الذكاء الاصطناعي", convID, string(req.Mode))
	} else if req.Mode == models.ModeHuman {
		audit.LogEvent(models.EventModeChange, "تم إيقاف الذكاء الاصطناعي (تدخل بشري)", convID, string(req.Mode))
	}

	return c.JSON(fiber.Map{"message": "Mode updated successfully", "mode": conv.Mode})
}

// MarkConversationRead marks all unread messages as read in the DB and WhatsApp
func MarkConversationRead(c *fiber.Ctx) error {
	convID, _ := url.PathUnescape(c.Params("id"))
	if convID == "" {
		convID = c.Params("id")
	}
	
	var conv models.Conversation
	if err := bootstrap.DB.Where("id = ?", convID).First(&conv).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Conversation not found"})
	}

	if conv.UnreadCount > 0 {
		// Reset unread_count in DB
		bootstrap.DB.Model(&conv).Update("unread_count", 0)

		// Try to mark as read on WhatsApp
		svc := whatsapp.GetService(bootstrap.Log)
		if svc.GetState() == whatsapp.StateConnected && svc.GetClient() != nil {
			// Find the last incoming message to mark read up to it
			var lastIncoming models.Message
			if err := bootstrap.DB.Where("conversation_id = ? AND direction = ?", convID, models.DirIncoming).Order("timestamp desc").First(&lastIncoming).Error; err == nil {
				chatJID, _ := types.ParseJID(convID)
				senderJID, _ := types.ParseJID(lastIncoming.Sender + "@s.whatsapp.net") // Best effort parsing
				
				err := svc.GetClient().MarkRead(c.Context(), []types.MessageID{lastIncoming.ID}, lastIncoming.Timestamp, chatJID, senderJID)
				if err != nil {
					bootstrap.Log.Error("Failed to mark read on WhatsApp: " + err.Error())
				}
			}
		}
	}
	
	return c.JSON(fiber.Map{"message": "Conversation marked as read"})
}

// DeleteConversation deletes a conversation and all its messages
func DeleteConversation(c *fiber.Ctx) error {
	convID, _ := url.PathUnescape(c.Params("id"))
	if convID == "" {
		convID = c.Params("id")
	}

	// Delete all messages in the conversation first (or rely on cascade, but manual is safer)
	if err := bootstrap.DB.Where("conversation_id = ?", convID).Delete(&models.Message{}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete messages"})
	}

	// Delete the conversation itself
	if err := bootstrap.DB.Where("id = ?", convID).Delete(&models.Conversation{}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete conversation"})
	}

	audit.LogEvent("CONVERSATION_DELETED", "تم مسح المحادثة بالكامل", convID, "")

	return c.JSON(fiber.Map{"message": "Conversation deleted successfully"})
}
