package ai

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"app/app/models"
	"app/app/services/audit"
	"app/bootstrap"
)

type Processor struct {
	provider AIProvider
}

func NewProcessor(provider AIProvider) *Processor {
	return &Processor{provider: provider}
}

func (p *Processor) ProcessMessage(ctx context.Context, conv *models.Conversation, userMessage string) (string, Intent, error) {
	// 1. Identify Intent
	intent := ClassifyIntent(ctx, p.provider, userMessage)

	// 2. Human Handoff Check (Phase 9)
	if intent == IntentHumanRequest {
		return "يرجى الانتظار، سيتم تحويلك إلى موظف الاستقبال في أقرب وقت ممكن.", intent, nil
	}

	// 3. Gather Knowledge (Phase 5 integration)
	knowledgeContext := p.gatherKnowledgeContext(intent)

	db := bootstrap.DB
	
	// Fetch Settings
	var settings models.SystemSettings
	if db != nil {
		db.First(&settings)
	}

	// Fetch or Assign Persona
	var persona models.AIPersona
	if db != nil {
		if conv.AssignedPersonaID == 0 {
			// Pick a random active persona
			db.Where("is_active = ?", true).Order("RANDOM()").First(&persona)
			if persona.ID != 0 {
				conv.AssignedPersonaID = persona.ID
				db.Save(conv)
			}
		} else {
			db.First(&persona, conv.AssignedPersonaID)
		}
	}

	// Build System Rules
	personaContext := ""
	if persona.ID != 0 {
		personaContext = fmt.Sprintf("أنت تمثل شخصية بالاسم '%s'. النوع: %s. اللهجة: %s.\nتفاصيل الشخصية:\n%s\n\nيجب عليك الالتزام بهذه الشخصية واللهجة في جميع ردودك.", 
			persona.Name, persona.Gender, persona.Dialect, persona.Description)
	} else {
		personaContext = "أنت مساعد افتراضي لعيادة طب أسنان."
	}

	systemRules := fmt.Sprintf(`%s

قواعد إجبارية (المسموحات):
%s

ممنوعات قطعية (الخطوط الحمراء):
%s

قواعد التحويل للموظف البشري:
%s

قواعد عامة:
أجب فقط اعتمادًا على المعلومات المعتمدة الموجودة في السياق أدناه. لا تخترع معلومات. لا تقدم تشخيصًا طبيًا ولا أدوية.
إذا طلب المستخدم حجز موعد تأكد من أخذ رقم هاتفه (إلا إذا كان معروفاً لديك مسبقاً في سياق المحادثة). واكتملت المعلومات (اسم الطبيب، الخدمة، التاريخ، الوقت، رقم الهاتف)، يجب عليك أن تبدأ رسالتك بـ:
[BOOK_APPOINTMENT|اسم الطبيب|اسم الخدمة|التاريخ|الوقت|رقم الهاتف]
ثم تكتب رسالة للمريض تخبره فيها أنه تم استلام طلبه وسيتواصل معه الموظف بخصوص الحجز قريباً.
إذا قررت أنه يجب تحويل المريض لموظف بشري (بناءً على قواعد التحويل أعلاه)، يجب عليك أن تبدأ رسالتك بكلمة [HANDOFF] ثم رسالة التوديع للمريض (مثال: "[HANDOFF] جاري تحويلك للموظف المختص").

[معلومات العيادة المعتمدة]
%s`, personaContext, settings.PromptDos, settings.PromptDonts, settings.HandoffRules, knowledgeContext)

	// 5. Build AI Request (Phase 12: Conversation Memory)
	var recentMessages []models.Message
	if db != nil {
		db.Where("conversation_id = ?", conv.ID).Order("created_at desc").Limit(10).Find(&recentMessages)
	}

	var history []Message
	for i := len(recentMessages) - 1; i >= 0; i-- {
		msg := recentMessages[i]
		if msg.Content == userMessage {
			continue 
		}
		
		role := "user"
		if msg.Direction == models.DirOutgoing {
			role = "model"
		}
		
		history = append(history, Message{
			Role:    role,
			Content: msg.Content,
		})
	}

	if userMessage != "" {
		history = append(history, Message{
			Role:    "user",
			Content: userMessage,
		})
	}

	req := AIRequest{
		SystemInstruction: systemRules,
		Messages:          history,
	}

	// 6. Generate Response
	resp, err := p.provider.Generate(ctx, req)
	if err != nil {
		return "", intent, err
	}

	responseText := resp.Text

	// Parse [HANDOFF] keyword
	if strings.HasPrefix(strings.TrimSpace(responseText), "[HANDOFF]") {
		intent = IntentHumanRequest
		responseText = strings.Replace(responseText, "[HANDOFF]", "", 1)
		responseText = strings.TrimSpace(responseText)
	}

	// Parse [BOOK_APPOINTMENT|Doctor|Service|Date|Time] keyword case-insensitively
	re := regexp.MustCompile(`(?i)\[BOOK_APPOINTMENT\|(.*?)\]`)
	match := re.FindStringSubmatch(responseText)
	
	if len(match) > 1 {
		fullTag := match[0]
		innerContent := match[1]
		parts := strings.Split(innerContent, "|")
		
		if len(parts) >= 4 {
			doctorName := strings.TrimSpace(parts[0])
			serviceName := strings.TrimSpace(parts[1])
			date := strings.TrimSpace(parts[2])
			timeStr := strings.TrimSpace(parts[3])
			
			extractedPhone := conv.Phone
			if len(parts) >= 5 {
				p := strings.TrimSpace(parts[4])
				if p != "" && p != "رقم الهاتف" {
					extractedPhone = p
					
					// Update conversation phone if it was an LID or just to keep it updated with the real number
					if db != nil && extractedPhone != conv.Phone {
						db.Model(&conv).Update("phone", extractedPhone)
					}
				}
			}
			
			if db != nil {
				var doctor models.Doctor
				var service models.Service
				
				var docID *uint
				var srvID *uint
				
				if err := db.Where("name ILIKE ?", "%"+doctorName+"%").First(&doctor).Error; err == nil {
					docID = &doctor.ID
				}
				if err := db.Where("name ILIKE ?", "%"+serviceName+"%").First(&service).Error; err == nil {
					srvID = &service.ID
				}
				
				appt := models.Appointment{
					DoctorID:  docID,
					ServiceID: srvID,
					Phone:     extractedPhone,
					Name:      conv.Name,
					Date:      date,
					Time:      timeStr,
					Status:    models.ApptPending,
				}
				
				db.Create(&appt)
				
				// Admin notification is handled in service.go for appointments, but we will return intent
				intent = IntentAppointment
				
				audit.LogEvent(models.EventApptCreated, "تم طلب حجز موعد جديد", conv.Phone, fmt.Sprintf("الطبيب: %s, الخدمة: %s, الموعد: %s %s", doctorName, serviceName, date, timeStr))
			}
		}
		// Remove the tag from response
		responseText = strings.Replace(responseText, fullTag, "", 1)
		responseText = strings.TrimSpace(responseText)
		
		if responseText == "" {
			responseText = "تم استلام طلبك! سيتواصل معك الموظف قريباً لتأكيد الحجز."
		}
	}

	return responseText, intent, nil
}

func (p *Processor) gatherKnowledgeContext(intent Intent) string {
	db := bootstrap.DB
	if db == nil {
		return ""
	}

	var sb strings.Builder

	// Always load clinic basic info
	var clinic models.Clinic
	if err := db.First(&clinic).Error; err == nil {
		sb.WriteString(fmt.Sprintf("- اسم العيادة: %s\n", clinic.Name))
		sb.WriteString(fmt.Sprintf("- رقم الهاتف: %s\n", clinic.Phone))
		sb.WriteString(fmt.Sprintf("- ساعات العمل: %s\n", clinic.WorkingHours))
		sb.WriteString(fmt.Sprintf("- العنوان: %s\n", clinic.Address))
		if clinic.Location != "" {
			sb.WriteString(fmt.Sprintf("- رابط خرائط جوجل: %s\n", clinic.Location))
		}
	}

	var docs []models.Doctor
	db.Where("active = ?", true).Find(&docs)
	if len(docs) > 0 {
		sb.WriteString("\n[الأطباء]\n")
		for _, d := range docs {
			sb.WriteString(fmt.Sprintf("- %s (تخصص: %s) | أيام العمل: %s | ساعات: %s\n", d.Name, d.Specialty, d.WorkingDays, d.WorkingHours))
		}
	}

	var svcs []models.Service
	db.Where("active = ?", true).Find(&svcs)
	if len(svcs) > 0 {
		sb.WriteString("\n[الخدمات والأسعار]\n")
		for _, s := range svcs {
			sb.WriteString(fmt.Sprintf("- %s: %s | السعر: %.2f د.ع | المدة: %s\n", s.Name, s.Description, s.Price, s.Duration))
		}
	}

	// Load FAQs
	var faqs []models.FAQ
	db.Where("active = ?", true).Find(&faqs)
	if len(faqs) > 0 {
		sb.WriteString("\n[أسئلة شائعة وإجاباتها المعتمدة]\n")
		for _, f := range faqs {
			sb.WriteString(fmt.Sprintf("س: %s\nج: %s\n", f.Question, f.ApprovedAnswer))
		}
	}

	return sb.String()
}
