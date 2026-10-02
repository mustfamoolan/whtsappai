package whatsapp

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"app/app/models"
	"app/bootstrap"
	"app/config"
	"app/app/services/ai"
	"app/app/services/audit"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/store"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"
	waLog "go.mau.fi/whatsmeow/util/log"
	"go.uber.org/zap"
	_ "github.com/lib/pq"
	"gorm.io/gorm"
	"go.mau.fi/whatsmeow/proto/waE2E"
	"go.mau.fi/whatsmeow/proto/waCompanionReg"
	"google.golang.org/protobuf/proto"
)

type ConnectionState string

const (
	StateDisconnected ConnectionState = "DISCONNECTED"
	StateConnecting   ConnectionState = "CONNECTING"
	StateConnected    ConnectionState = "CONNECTED"
	StateDegraded     ConnectionState = "DEGRADED"
	StateReconnecting ConnectionState = "RECONNECTING"
	StateLoggedOut    ConnectionState = "LOGGED_OUT"
)

type Service struct {
	client     *whatsmeow.Client
	state      ConnectionState
	stateMu    sync.RWMutex
	logger     *zap.Logger
	currentQR  string
	qrMu       sync.RWMutex
	debounceMu    sync.Mutex
	debounce      map[string]*time.Timer
	connectedAt   *time.Time
	lastReconnect *time.Time
	reconnectCnt  int
	container     *sqlstore.Container
	aiSentMessages sync.Map
}

var instance *Service
var once sync.Once

func GetService(logger *zap.Logger) *Service {
	once.Do(func() {
		instance = &Service{
			state:    StateDisconnected,
			logger:   logger.Named("whatsapp"),
			debounce: make(map[string]*time.Timer),
		}
		instance.init()
	})
	return instance
}

func (s *Service) init() {
	// Set default device properties to Mac OS to avoid being blocked by WhatsApp
	store.DeviceProps.PlatformType = waCompanionReg.DeviceProps_CHROME.Enum()
	store.DeviceProps.Os = proto.String("Mac OS")

	dbConfig := config.Global.Database
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Shanghai",
		dbConfig.Host, dbConfig.Username, dbConfig.Password, dbConfig.Database, dbConfig.Port)

	dbLog := waLog.Stdout("Database", "WARN", true)
	container, err := sqlstore.New(context.Background(), "postgres", dsn, dbLog)
	if err != nil {
		s.logger.Fatal("Failed to connect to WhatsApp database", zap.Error(err))
	}
	s.container = container

	deviceStore, err := s.container.GetFirstDevice(context.Background())
	if err != nil {
		s.logger.Fatal("Failed to get device store", zap.Error(err))
	}

	clientLog := waLog.Stdout("Client", "WARN", true)
	s.client = whatsmeow.NewClient(deviceStore, clientLog)
	s.client.AddEventHandler(s.eventHandler)

	// Auto-connect on boot if session exists
	if s.client.Store.ID != nil {
		go func() {
			s.logger.Info("Existing session found, auto-connecting on boot...")
			s.Connect()
		}()
	}

	go s.watchdog()
	go s.startAutoAITimeoutJob()
	go s.startOutboxWorker()
}

func (s *Service) Connect() error {
	if s.client.IsConnected() {
		s.setState(StateConnected)
		return nil
	}
	
	if s.GetState() == StateConnecting {
		// Already connecting, don't spawn multiple goroutines
		return nil
	}
	
	s.setState(StateConnecting)

	if s.client.Store.ID == nil {
		// No ID stored, new login
		qrChan, _ := s.client.GetQRChannel(context.Background())
		err := s.client.Connect()
		if err != nil {
			s.setState(StateDisconnected)
			return err
		}
		go func() {
			for evt := range qrChan {
				if evt.Event == "code" {
					s.qrMu.Lock()
					s.currentQR = evt.Code
					s.qrMu.Unlock()
					s.logger.Info("QR code generated")
				} else if evt.Event == "timeout" {
					s.qrMu.Lock()
					s.currentQR = ""
					s.qrMu.Unlock()
					s.logger.Info("QR code timed out")
					s.setState(StateDisconnected)
				} else {
					s.logger.Info("QR channel event", zap.String("event", evt.Event))
				}
			}
		}()
	} else {
		// Already logged in, just connect
		err := s.client.Connect()
		if err != nil {
			s.setState(StateDisconnected)
			return err
		}
	}
	return nil
}

func (s *Service) Refresh() error {
	s.client.Disconnect()
	s.qrMu.Lock()
	s.currentQR = ""
	s.qrMu.Unlock()
	s.setState(StateDisconnected)
	return s.Connect()
}

func (s *Service) Disconnect() {
	s.client.Disconnect()
	s.setState(StateDisconnected)
}

func (s *Service) startAutoAITimeoutJob() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for {
		<-ticker.C
		db := bootstrap.DB
		if db == nil {
			continue
		}

		var settings models.SystemSettings
		db.First(&settings)
		timeoutMinutes := settings.AutoAITimeoutMinutes
		if timeoutMinutes <= 0 {
			timeoutMinutes = 5 // Fallback default
		}

		cutoffTime := time.Now().Add(-time.Duration(timeoutMinutes) * time.Minute)

		var affectedRows int64
		// Revert to AI mode if it's HUMAN and last activity was before the cutoff
		res := db.Exec(`
			UPDATE conversations 
			SET mode = 'AI' 
			WHERE mode = 'HUMAN' AND last_activity < ?
		`, cutoffTime)
		affectedRows = res.RowsAffected

		if affectedRows > 0 {
			s.logger.Info(fmt.Sprintf("Auto-reverted %d conversations back to AI mode due to %d minutes inactivity", affectedRows, timeoutMinutes))
		}
	}
}

func (s *Service) Logout() error {
	s.setState(StateLoggedOut)
	
	s.qrMu.Lock()
	s.currentQR = ""
	s.qrMu.Unlock()
	
	// Perform logout
	err := s.client.Logout(context.Background())
	
	s.client.Disconnect()
	
	// Force purge the device store just in case Logout failed due to network
	if s.container != nil && s.client.Store != nil {
		s.client.Store.Delete(context.Background())
	}

	deviceStore, dbErr := s.container.GetFirstDevice(context.Background())
	if dbErr == nil {
		clientLog := waLog.Stdout("Client", "WARN", true)
		s.client = whatsmeow.NewClient(deviceStore, clientLog)
		s.client.AddEventHandler(s.eventHandler)
	}
	
	return err
}

func (s *Service) GetQR() string {
	s.qrMu.RLock()
	defer s.qrMu.RUnlock()
	return s.currentQR
}

func (s *Service) GetState() ConnectionState {
	s.stateMu.RLock()
	defer s.stateMu.RUnlock()
	return s.state
}

func (s *Service) createNotification(notifType models.NotificationType, title, message string) {
	if bootstrap.DB == nil {
		return
	}
	bootstrap.DB.Create(&models.Notification{
		Type:    notifType,
		Title:   title,
		Message: message,
	})
}

func (s *Service) setState(state ConnectionState) {
	s.stateMu.Lock()
	defer s.stateMu.Unlock()
	
	now := time.Now()
	
	if state == StateConnected && s.state != StateConnected {
		if s.connectedAt == nil {
			s.connectedAt = &now
		} else {
			s.lastReconnect = &now
			s.reconnectCnt++
		}
		audit.LogEvent(models.EventWAConnected, "تم الاتصال بالواتساب بنجاح", "", "")
	} else if state == StateDisconnected && s.state != StateDisconnected {
		// Log disconnect notification
		s.createNotification(models.NotifTypeSystem, "انقطاع الاتصال", "فقد الخادم الاتصال بالواتساب، وجاري محاولة إعادة الاتصال تلقائياً.")
		audit.LogEvent(models.EventWADisconnected, "انقطع الاتصال بالواتساب", "", "")
	}
	
	s.state = state
	s.logger.Info("WhatsApp state changed", zap.String("state", string(state)))
}

func formatDuration(d time.Duration) string {
	days := int(d.Hours() / 24)
	hours := int(d.Hours()) % 24
	minutes := int(d.Minutes()) % 60
	seconds := int(d.Seconds()) % 60

	if days > 365 {
		years := days / 365
		days = days % 365
		return fmt.Sprintf("%d سنة %d يوم", years, days)
	}
	if days > 30 {
		months := days / 30
		days = days % 30
		return fmt.Sprintf("%d شهر %d يوم", months, days)
	}
	if days > 0 {
		return fmt.Sprintf("%d يوم %d ساعة", days, hours)
	}
	if hours > 0 {
		return fmt.Sprintf("%d ساعة %d دقيقة", hours, minutes)
	}
	if minutes > 0 {
		return fmt.Sprintf("%d دقيقة", minutes)
	}
	return fmt.Sprintf("%d ثانية", seconds)
}

// GetStats returns connection stats
func (s *Service) GetStats() map[string]interface{} {
	s.stateMu.RLock()
	defer s.stateMu.RUnlock()
	
	var uptime string
	if s.connectedAt != nil && s.state == StateConnected {
		uptime = formatDuration(time.Since(*s.connectedAt))
	} else {
		uptime = "0 ثانية"
	}
	
	var lastRec string
	if s.lastReconnect != nil {
		lastRec = formatDuration(time.Since(*s.lastReconnect)) + " مضت"
	} else {
		lastRec = "لم يحدث"
	}
	
	return map[string]interface{}{
		"status":         string(s.state),
		"uptime":         uptime,
		"last_reconnect": lastRec,
		"reconnects":     s.reconnectCnt,
	}
}

func (s *Service) GetClient() *whatsmeow.Client {
	return s.client
}

func (s *Service) eventHandler(evt interface{}) {
	switch v := evt.(type) {
	case *events.Connected:
		s.setState(StateConnected)
	case *events.Disconnected:
		s.setState(StateDisconnected)
	case *events.KeepAliveTimeout:
		s.setState(StateDegraded)
	case *events.KeepAliveRestored:
		s.setState(StateConnected)
	case *events.LoggedOut:
		s.setState(StateLoggedOut)
	case *events.StreamReplaced:
		s.setState(StateDisconnected)
	case *events.Message:
		s.logger.Info("Received message", zap.String("id", v.Info.ID))
		s.processMessage(v)
	}
}

func (s *Service) processMessage(evt *events.Message) {
	// Skip messages from status/broadcasts unless we want to process them
	if evt.Info.IsGroup {
		return
	}

	phone := evt.Info.Chat.User
	remoteJid := evt.Info.Chat.String() // Use chat JID as conversation ID
	senderName := ""
	if !evt.Info.IsFromMe {
		senderName = evt.Info.PushName
	}
	msgID := evt.Info.ID
	timestamp := evt.Info.Timestamp

	// Determine content and type
	var content string
	var msgType models.MessageType

	if evt.Message.GetConversation() != "" {
		content = evt.Message.GetConversation()
		msgType = models.MsgTypeText
	} else if evt.Message.GetExtendedTextMessage() != nil {
		content = evt.Message.GetExtendedTextMessage().GetText()
		msgType = models.MsgTypeText
	} else if evt.Message.GetImageMessage() != nil {
		content = evt.Message.GetImageMessage().GetCaption()
		msgType = models.MsgTypeImage
	} else if evt.Message.GetDocumentMessage() != nil {
		content = evt.Message.GetDocumentMessage().GetTitle()
		msgType = models.MsgTypeDocument
	} else {
		// Unsupported or other type for now
		content = "[رسالة غير مدعومة]"
		msgType = models.MsgTypeText
	}

	db := bootstrap.DB
	if db == nil {
		s.logger.Error("Database not initialized, cannot save message")
		return
	}

	// 1. Idempotency Check
	var existing models.Message
	if err := db.Where("id = ?", msgID).First(&existing).Error; err == nil {
		s.logger.Info("Message already processed (idempotency)", zap.String("msgID", msgID))
		return
	}

	// 2. Upsert Conversation
	var conv models.Conversation
	err := db.Where("id = ?", remoteJid).First(&conv).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new
			conv = models.Conversation{
				ID:           remoteJid,
				Phone:        phone,
				Name:         senderName,
				Status:       "Active",
				Mode:         models.ModeAI,
				LastMessage:  content,
				LastActivity: timestamp,
				UnreadCount:  1,
			}
			if evt.Info.IsFromMe {
				_, isAiMsg := s.aiSentMessages.Load(msgID)
				if !isAiMsg {
					conv.Mode = models.ModeHuman
					conv.UnreadCount = 0
				}
			}
			db.Create(&conv)
		} else {
			s.logger.Error("Failed to query conversation", zap.Error(err))
			return
		}
	} else {
		// Update existing
		conv.LastMessage = content
		conv.LastActivity = timestamp
		if senderName != "" {
			conv.Name = senderName // Update name just in case it changed
		}
		conv.Phone = phone // Ensure correct phone is saved
		
		if evt.Info.IsFromMe {
			_, isAiMsg := s.aiSentMessages.Load(msgID)
			if !isAiMsg {
				conv.Mode = models.ModeHuman
				conv.UnreadCount = 0
				s.logger.Info("Conversation mode changed to HUMAN because reply came from phone", zap.String("convID", conv.ID))
				audit.LogEvent(models.EventHumanReply, "تم الرد يدوياً من الموبايل", conv.ID, content)
				audit.LogEvent(models.EventModeChange, "تم إيقاف الذكاء الاصطناعي (تدخل بشري من الموبايل)", conv.ID, "HUMAN")
			}
		} else {
			conv.UnreadCount += 1
		}
		
		db.Save(&conv)
	}

	// 3. Save Message
	direction := models.DirIncoming
	if evt.Info.IsFromMe {
		direction = models.DirOutgoing
	}
	
	newMsg := models.Message{
		ID:             msgID,
		ConversationID: remoteJid,
		Sender:         phone,
		Direction:      direction,
		Timestamp:      timestamp,
		Type:           msgType,
		Content:        content,
		Status:         "DELIVERED",
	}
	if err := db.Create(&newMsg).Error; err != nil {
		s.logger.Error("Failed to save message", zap.Error(err))
	} else {
		s.logger.Info("Message saved", zap.String("msgID", msgID), zap.String("phone", phone))
		
		// If it's an incoming message, trigger AI processing
		if !evt.Info.IsFromMe {
			// 4. AI Handling Guard & Debounce (Phase 13)
			if conv.Mode == models.ModeAI {
			s.logger.Info("Message queued for AI processing", zap.String("convID", conv.ID))
			
			// Mark as read on WhatsApp (because the AI is processing it)
			err := s.client.MarkRead(context.Background(), []types.MessageID{msgID}, evt.Info.Timestamp, evt.Info.Chat, evt.Info.Sender)
			if err != nil {
				s.logger.Error("Failed to mark message as read", zap.Error(err))
			}
			
			s.debounceMu.Lock()
			if timer, exists := s.debounce[conv.ID]; exists {
				timer.Stop()
			}
			
			s.debounce[conv.ID] = time.AfterFunc(1*time.Second, func() {
				s.debounceMu.Lock()
				delete(s.debounce, conv.ID)
				s.debounceMu.Unlock()
				
				// Initialize Provider and Processor
				provider := ai.NewGeminiProvider("")
				processor := ai.NewProcessor(provider)
				
				// In Phase 12 we updated the processor to pull the last 10 messages from DB.
				// Trigger the generation with the latest content, it will fetch context.
				replyText, intent, err := processor.ProcessMessage(context.Background(), &conv, "")
				if err != nil {
					s.logger.Error("AI processing failed", zap.Error(err))
					audit.LogEvent("AI_ERROR", "فشل في معالجة الذكاء الاصطناعي", conv.ID, err.Error())
					return
				}

				// Phase 9 & Phase 10: Human Handoff and Appointment booking alerts
				if intent == ai.IntentHumanRequest || intent == ai.IntentAppointment {
					if intent == ai.IntentHumanRequest {
						db.Model(&conv).Update("mode", models.ModeHuman)
						s.createNotification(models.NotifTypeHuman, "طلب تدخل بشري", fmt.Sprintf("المريض %s طلب التحدث مع موظف.", conv.Name))
						s.logger.Info("Conversation mode changed to HUMAN due to intent", zap.String("convID", conv.ID))
					} else if intent == ai.IntentAppointment {
						s.createNotification(models.NotifTypeAppt, "حجز موعد جديد", fmt.Sprintf("المريض %s قام بحجز موعد.", conv.Name))
						s.logger.Info("AI recorded an appointment", zap.String("convID", conv.ID))
					}
					
					// Send smart notification to admin WhatsApp numbers
					var settings models.SystemSettings
					if db.First(&settings).Error == nil && settings.AdminWhatsAppNumbers != "" {
						adminNumbers := strings.Split(settings.AdminWhatsAppNumbers, ",")
						for _, adminNum := range adminNumbers {
							adminNum = strings.TrimSpace(adminNum)
							if adminNum == "" {
								continue
							}
							
							adminNum = strings.ReplaceAll(adminNum, "+", "")
							adminNum = strings.TrimPrefix(adminNum, "00")
							
							// Auto-format Iraqi local numbers
							if strings.HasPrefix(adminNum, "07") {
								adminNum = "964" + adminNum[1:]
							}
							
							if !strings.Contains(adminNum, "@s.whatsapp.net") {
								adminNum = adminNum + "@s.whatsapp.net"
							}
							
							adminJID, err := types.ParseJID(adminNum)
							if err == nil {
								var alertMsg string
								if intent == ai.IntentHumanRequest {
									alertMsg = fmt.Sprintf("🚨 *تنبيه تدخل بشري*\nالمريض: %s\nرقم الهاتف: %s\nطلب التحدث مع موظف.\nيرجى الدخول للوحة التحكم للرد عليه.", conv.Name, conv.Phone)
								} else {
									alertMsg = fmt.Sprintf("📅 *حجز موعد جديد*\nالمريض: %s\nرقم الهاتف: %s\nقام بحجز موعد عبر المساعد الذكي.\nيرجى مراجعة لوحة المواعيد.", conv.Name, conv.Phone)
								}
								
								// Enqueue to Outbox
								outboxMsg := models.OutboxMessage{
									JID:    adminJID.String(),
									Text:   alertMsg,
									Status: models.OutboxPending,
								}
								db.Create(&outboxMsg)
								s.logger.Info("Admin notification queued to outbox", zap.String("adminJID", adminJID.String()))
							} else {
								s.logger.Error("Failed to parse admin JID", zap.Error(err), zap.String("adminNum", adminNum))
							}
						}
					}
				}

				// Send reply
				jid, err := types.ParseJID(conv.ID)
				if err == nil && replyText != "" {
					now := time.Now()
					fakeID := "ai-out-" + fmt.Sprintf("%d", now.UnixNano())
					
					// Save outgoing message for UI
					outMsg := models.Message{
						ID:             fakeID,
						ConversationID: conv.ID,
						Sender:         "ai",
						Direction:      models.DirOutgoing,
						Timestamp:      now,
						Type:           models.MsgTypeText,
						Content:        replyText,
						Status:         "SENT",
						SentAt:         &now,
					}
					db.Create(&outMsg)

					// Update conv
					db.Model(&conv).Updates(map[string]interface{}{
						"last_message":  replyText,
						"last_activity": now,
					})
					
					// Enqueue to Outbox for real delivery
					outboxMsg := models.OutboxMessage{
						JID:    jid.String(),
						Text:   replyText,
						Status: models.OutboxPending,
					}
					db.Create(&outboxMsg)

					audit.LogEvent(models.EventAIReply, "قام الذكاء الاصطناعي بالرد", conv.ID, replyText)
					audit.LogEvent(models.EventAITrace, "سجل عمليات الذكاء الاصطناعي", conv.ID, fmt.Sprintf("Intent: %s\nReply: %s", intent, replyText))
				}
			})
			s.debounceMu.Unlock()
			} else {
				s.logger.Info("AI prevented from replying, conversation is in HUMAN mode", zap.String("convID", conv.ID))
			}
		}
	}
}

func (s *Service) watchdog() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		state := s.GetState()
		if state == StateDisconnected || state == StateDegraded {
			if s.client.Store.ID != nil {
				s.logger.Info("Watchdog initiating reconnect...")
				s.setState(StateReconnecting)
				s.client.Disconnect() // Ensure it's fully disconnected
				err := s.client.Connect()
				if err != nil {
					s.logger.Error("Watchdog reconnect failed", zap.Error(err))
					s.setState(StateDisconnected)
				}
			}
		}
	}
}

func (s *Service) startOutboxWorker() {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for {
		<-ticker.C
		if s.client == nil || !s.client.IsConnected() {
			continue
		}

		db := bootstrap.DB
		if db == nil {
			continue
		}

		var pending []models.OutboxMessage
		// Get up to 10 pending messages
		db.Where("status = ?", models.OutboxPending).Limit(10).Find(&pending)

		for _, msg := range pending {
			jid, err := types.ParseJID(msg.JID)
			if err != nil {
				db.Model(&msg).Update("status", models.OutboxFailed)
				s.logger.Error("Outbox: failed to parse JID", zap.Error(err), zap.String("jid", msg.JID))
				continue
			}

			msgProto := &waE2E.Message{
				Conversation: proto.String(msg.Text),
			}

			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			resp, err := s.client.SendMessage(ctx, jid, msgProto)
			cancel()

			if err == nil {
				s.aiSentMessages.Store(resp.ID, true)
				db.Model(&msg).Updates(map[string]interface{}{
					"status": models.OutboxSent,
				})
			} else {
				msg.Retries++
				if msg.Retries >= 3 {
					db.Model(&msg).Updates(map[string]interface{}{
						"status":  models.OutboxFailed,
						"retries": msg.Retries,
					})
					s.logger.Error("Outbox: failed to send message (max retries)", zap.Error(err), zap.String("jid", msg.JID))
				} else {
					db.Model(&msg).Update("retries", msg.Retries)
					s.logger.Warn("Outbox: failed to send message, will retry", zap.Error(err), zap.String("jid", msg.JID), zap.Int("retries", msg.Retries))
				}
			}
		}
	}
}
