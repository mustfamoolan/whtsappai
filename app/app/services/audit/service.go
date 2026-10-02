package audit

import (
	"app/app/models"
	"app/bootstrap"
	"time"
)

func LogEvent(event models.AuditEvent, details, entityID, payload string) {
	if bootstrap.DB == nil {
		return
	}
	bootstrap.DB.Create(&models.AuditLog{
		Event:     event,
		Details:   details,
		EntityID:  entityID,
		Payload:   payload,
		CreatedAt: time.Now(),
	})
}
