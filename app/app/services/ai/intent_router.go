package ai

import (
	"context"
	"strings"
)

type Intent string

const (
	IntentGreeting        Intent = "GREETING"
	IntentClinicInfo      Intent = "CLINIC_INFO"
	IntentDoctorInfo      Intent = "DOCTOR_INFO"
	IntentServiceInfo     Intent = "SERVICE_INFO"
	IntentPrice           Intent = "PRICE"
	IntentAppointment     Intent = "APPOINTMENT"
	IntentHumanRequest    Intent = "HUMAN_REQUEST"
	IntentMedicalQuestion Intent = "MEDICAL_QUESTION"
	IntentUnknown         Intent = "UNKNOWN"
)

func ClassifyIntent(ctx context.Context, provider AIProvider, userMessage string) Intent {
	systemPrompt := `أنت مصنف للنوايا. وظيفتك الوحيدة هي قراءة رسالة المريض وتصنيفها إلى واحدة من النوايا التالية بدقة، وبدون أي نص إضافي:

- GREETING: إذا كانت الرسالة مجرد سلام، مرحبا، شلونكم، الخ.
- CLINIC_INFO: يسأل عن موقع العيادة، ساعات العمل، رقم الهاتف.
- DOCTOR_INFO: يسأل عن الأطباء، التخصصات، أوقات دوام الأطباء.
- SERVICE_INFO: يسأل عن تفاصيل خدمة معينة (تقويم، تبييض، زراعة) بدون ذكر السعر.
- PRICE: يسأل عن السعر أو التكلفة.
- APPOINTMENT: يطلب حجز موعد.
- HUMAN_REQUEST: يطلب التحدث مع موظف، دكتور، شخص حقيقي.
- MEDICAL_QUESTION: يسأل سؤال طبي، أو يعرض حالة طبية (عندي ألم، دواء، نزيف).
- UNKNOWN: إذا كانت الرسالة غير مفهومة أو لا تنتمي لأي من الفئات.

يجب أن يكون الرد كلمة واحدة فقط من الكلمات الإنجليزية أعلاه.`

	resp, err := provider.Generate(ctx, AIRequest{
		SystemInstruction: systemPrompt,
		Messages: []Message{
			{Role: "user", Content: userMessage},
		},
	})

	if err != nil {
		return IntentUnknown
	}

	intentStr := strings.TrimSpace(resp.Text)
	// Sometimes LLMs add quotes or periods
	intentStr = strings.Trim(intentStr, "\".\n")
	intentStr = strings.ToUpper(intentStr)

	switch Intent(intentStr) {
	case IntentGreeting, IntentClinicInfo, IntentDoctorInfo, IntentServiceInfo, IntentPrice, IntentAppointment, IntentHumanRequest, IntentMedicalQuestion:
		return Intent(intentStr)
	default:
		return IntentUnknown
	}
}
