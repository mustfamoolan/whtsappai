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

func StartCleanupJob() {
	ticker := time.NewTicker(24 * time.Hour)
	for range ticker.C {
		if bootstrap.DB != nil {
			oneMonthAgo := time.Now().AddDate(0, -1, 0)
			bootstrap.DB.Where("created_at < ?", oneMonthAgo).Delete(&models.AuditLog{})
		}
	}
}
