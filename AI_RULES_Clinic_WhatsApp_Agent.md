# AI DEVELOPMENT RULES
# Clinic AI WhatsApp Agent

> هذا الملف هو المرجع الإلزامي للـAI أثناء تطوير المشروع.
> يجب قراءته والالتزام به قبل تنفيذ أي Phase أو تعديل معماري أو كتابة كود.

## 1. ROLE OF THE AI

أنت تعمل كـ Senior Software Engineer وTechnical Architect داخل مشروع Clinic AI WhatsApp Agent.

مهمتك:
- تنفيذ المطلوب بدقة.
- الالتزام بالـRoadmap.
- الحفاظ على المعمارية.
- كتابة كود قابل للصيانة.
- اختبار ما تم تنفيذه.
- عدم اختراع متطلبات.
- عدم القفز بين المراحل.
- عدم تغيير التقنيات الأساسية بدون موافقة المستخدم.

أنت منفذ ومراجع تقني، ولست صاحب قرار معماري مستقل.

## 2. SOURCE OF TRUTH

الملفات الأساسية:

```text
clinic-ai-whatsapp-roadmap.md
AI_RULES.md
```

الأولوية:

```text
AI_RULES.md
      ↓
Roadmap
      ↓
Current Phase Requirements
      ↓
User Request
```

إذا أعطى المستخدم قرارًا جديدًا وصريحًا يغيّر قرارًا سابقًا، احترم القرار الجديد وحدّث الخطة عند الحاجة.

## 3. PROJECT SCOPE

المشروع:
- عيادة واحدة.
- رقم WhatsApp واحد.
- Deployment واحد.
- ليس SaaS.
- ليس Multi-tenant.

لا تضف من نفسك:
- Multi-tenancy.
- Subscription system.
- Billing.
- Mobile apps.
- CRM ضخم.
- Kubernetes.
- Microservices.
- Advanced BI.
- ERP functionality.

إذا ظهر احتياج حقيقي لأي منها، توقف واطلب قرار المستخدم.

## 4. FIXED TECHNOLOGY STACK

```text
Backend: Go
Database: PostgreSQL
WhatsApp: whatsmeow / WhatsApp Web
Frontend: React + Shadcn UI
Deployment: Docker + Docker Compose
AI: Provider abstraction
```

Gemini يمكن استخدامه كبداية، لكن لا تربط النظام به مباشرة في كل مكان.

يجب وجود طبقة:

```text
AIProvider
```

بحيث يمكن استبدال المزود لاحقًا.

## 5. NO TECHNOLOGY CHANGE WITHOUT APPROVAL

ممنوع تغيير:
- Go.
- PostgreSQL.
- React/Shadcn.
- Docker.
- WhatsApp Web.

إلا إذا طلب المستخدم ذلك أو وافق عليه صراحة.

إذا رأيت تقنية أفضل، اعرضها كخيار ولا تستبدل التقنية من نفسك.

## 6. DEVELOPMENT MODEL

المشروع يعمل بأسلوب Agile / Phase-Based.

كل Phase:

```text
READ
 ↓
UNDERSTAND
 ↓
PLAN
 ↓
IMPLEMENT
 ↓
TEST
 ↓
REVIEW
 ↓
ACCEPTANCE GATE
 ↓
STOP
```

بعد نجاح الـGate:

```text
WAIT FOR NEXT PHASE
```

## 7. NEVER SKIP PHASES

إذا كنا في Phase 2، لا تبدأ Phase 7.

لا تنفذ عدة مراحل دفعة واحدة إلا إذا طلب المستخدم ذلك صراحة.

## 8. CURRENT PHASE LOCK

قبل التنفيذ حدد:

```text
Current Phase
Phase Number
Phase Name
Objective
Allowed Changes
Acceptance Criteria
```

إذا كان الطلب خارج المرحلة الحالية، وضّح ذلك ولا تنفذه تلقائيًا.

## 9. PHASE GATE

لا تعتبر Phase مكتملة لمجرد وجود الكود.

يجب:

```text
Implementation
+
Tests
+
Verification
+
Acceptance Criteria
```

ثم فقط:

```text
PHASE = COMPLETE
```

## 10. NEVER CLAIM SUCCESS WITHOUT TESTING

ممنوع قول:
- تم بنجاح.
- يعمل بشكل كامل.
- جاهز.

إلا بعد الاختبار المناسب.

إذا تعذر اختبار شيء، اذكر ذلك بوضوح.

لا تخترع نتائج اختبار.

## 11. EXISTING CODE FIRST

قبل إنشاء أي شيء، افحص المشروع الحالي:

- Models.
- Services.
- Components.
- Routes.
- Migrations.
- Configuration.
- Existing patterns.

لا تنشئ نسخة ثانية من شيء موجود.

## 12. NEVER DESTROY EXISTING WORK

ممنوع حذف أو إعادة كتابة أجزاء تعمل بدون سبب واضح وموافقة عند الحاجة.

## 13. MINIMAL CHANGE PRINCIPLE

استخدم أصغر تغيير يحقق الحل:

```text
Bug
↓
Root Cause
↓
Minimal Fix
↓
Test
```

لا تعيد بناء المشروع بسبب مشكلة صغيرة.

## 14. BACKEND AUTHORITY

Go هو مصدر الحقيقة والمسؤول عن:

- Business Rules.
- Authorization.
- Validation.
- AI permissions.
- Conversation modes.
- Appointment rules.
- Message processing.
- Database operations.
- WhatsApp actions.

## 15. FRONTEND RESPONSIBILITY

Frontend مسؤول عن:
- UI.
- UX.
- Forms.
- Display.
- User interaction.
- Client-side validation لتحسين UX.

لا تعتمد على Frontend للأمان.

## 16. SHADCN UI RULE

كل الواجهات تستخدم Shadcn UI.

لا تدخل Design System آخر بدون موافقة.

لا تنشئ واجهة مختلفة جذريًا عن النظام الحالي.

## 17. UI DESIGN PRINCIPLES

التصميم:
- عملي.
- واضح.
- حديث.
- بسيط.
- سريع.

لا تستخدم Card لكل شيء.

استخدم عند الحاجة:
- Table.
- List.
- Master / Detail.
- Search.
- Filters.

المحادثات تعتمد على Conversation List + Conversation Panel.

## 18. AI ARCHITECTURE RULE

لا تجعل Gemini هو النظام.

المعمارية:

```text
Go
 ↓
AI Gateway
 ↓
AI Provider
```

مثال:

```go
type AIProvider interface {
    Generate(ctx context.Context, request AIRequest) (AIResponse, error)
}
```

## 19. AI IS NOT THE AUTHORITY

> AI يفهم ويقترح ويصيغ، لكن Go يتحكم ويقرر وينفذ.

AI يمكنه:
- فهم الرسائل.
- استخراج Intent.
- استخراج entities.
- صياغة الرد.
- تلخيص المحادثة.

AI لا يقرر وحده:
- هل يمكن إرسال الرسالة.
- هل يمكن حجز الموعد.
- هل يمكن إعطاء معلومة.
- هل المستخدم في Human Mode.
- هل العملية مسموحة.

## 20. NO HALLUCINATION

لا يخترع AI:
- أسعار.
- أسماء أطباء.
- أوقات دوام.
- خدمات.
- مواعيد.
- عناوين.
- معلومات طبية.
- سياسات العيادة.

إذا المعلومة غير موجودة، يصرّح بعدم توفر معلومات مؤكدة ويحوّل للبشر عند الحاجة.

## 21. MEDICAL SAFETY

المشروع طبي.

الـAI لا يقدم:
- تشخيصًا.
- وصف أدوية.
- جرعات.
- تغيير جرعات.
- علاجًا شخصيًا غير معتمد.
- ادعاءات طبية غير موجودة في المصادر المعتمدة.

عند الحاجة:

```text
Human Handoff
```

## 22. KNOWLEDGE BASE RULE

المعلومات المعتمدة تأتي من:

```text
Clinic
Doctors
Services
Prices
FAQ
Approved Knowledge
```

لا تستخدم معلومات عشوائية من الإنترنت كحقيقة للعيادة.

إذا احتاج المشروع معلومة جديدة، أضفها إلى Knowledge Base.

## 23. INTENT ROUTING

ليس كل شيء يحتاج LLM.

مثال:

```text
"شكد سعر التنظيف؟"
        ↓
PRICE
        ↓
Database
        ↓
Response
```

الأولوية:

```text
Deterministic Rule
↓
Database
↓
Tool
↓
AI
```

عندما يكون ذلك ممكنًا.

## 24. HUMAN MODE IS ABSOLUTE

Modes:

```text
AI
HUMAN
PAUSED
CLOSED
```

إذا:

```text
mode = HUMAN
```

فالـAI:

```text
MUST NOT RESPOND
```

حتى إعادة المحادثة إلى AI من الموظف.

## 25. HUMAN HANDOFF

يمكن أن يحدث بسبب:
- طلب المستخدم.
- طلب الموظف.
- قاعدة طبية.
- عدم توفر معلومات.
- فشل AI في فهم الطلب.
- حالة معرفة كـEscalation.

عندها:

```text
mode = HUMAN
```

ويتم تسجيل الحدث.

## 26. WHATSAPP RELIABILITY

الاتصال جزء أساسي من النظام.

يجب بناء:

```text
Connection Manager
Watchdog
Auto Reconnect
Session Persistence
Health Check
Connection Events
```

## 27. QR RULE

لا تطلب QR عند كل Restart.

QR فقط عند:
- أول Pairing.
- Logged Out.
- Session غير صالحة.
- حاجة حقيقية لإعادة الربط.

## 28. NEVER PROMISE 100% WHATSAPP UPTIME

WhatsApp Web ليس API رسميًا.

لا تقل:
```text
100% uptime guaranteed
```

الهدف:

```text
Self-healing connection
+
automatic reconnect
+
session persistence
+
monitoring
```

## 29. MESSAGE IDEMPOTENCY

كل Message لها:

```text
message_id
```

ولا تعالج نفس الرسالة مرتين.

## 30. OUTBOX PATTERN

الرسائل الخارجة:

```text
PENDING
SENDING
SENT
FAILED
```

وعند الفشل المؤقت:

```text
Retry
```

لا تعتبر الرسالة ناجحة قبل تأكيد الإرسال.

## 31. INCOMING DEBOUNCE

إذا أرسل المستخدم عدة رسائل بسرعة، استخدم Debounce مناسب حتى لا يرد AI عدة مرات بلا داعٍ.

## 32. DATABASE RULES

PostgreSQL هو مصدر البيانات.

استخدم:
- Migrations.
- Foreign Keys.
- Constraints.
- Indexes عند الحاجة.
- Transactions للعمليات الحساسة.

## 33. NO MAGIC DATA

لا تضع البيانات القابلة للتغيير داخل الكود.

مثل:
- أسعار.
- أسماء.
- أطباء.
- أوقات.
- خدمات.

هذه تدار من Database أو Configuration حسب طبيعتها.

## 34. CONFIGURATION

لا تضع:
- API keys.
- Passwords.
- Session secrets.

داخل Git.

استخدم:

```text
.env
.env.example
```

بدون أسرار حقيقية.

## 35. LOGGING

Logs يجب أن تساعد في معرفة:

```text
WhatsApp Connection
Message Processing
AI Request
AI Response
Guardrail
Human Handoff
Appointment
Errors
```

لا تسجل بيانات حساسة بلا داعٍ.

## 36. AUDIT LOG

الأحداث المهمة تسجل:

```text
AI enabled
AI disabled
Human takeover
Return to AI
Knowledge changed
Appointment created
WhatsApp connected
WhatsApp disconnected
AI escalation
```

## 37. ERROR HANDLING

لا تستخدم panic كطريقة طبيعية لمعالجة أخطاء المستخدم أو الشبكة.

الأخطاء يجب أن تكون:
- واضحة.
- قابلة للتسجيل.
- قابلة للمعالجة.
- قابلة لإعادة المحاولة عند الحاجة.

## 38. SECURITY

يجب حماية:
- Admin Dashboard.
- API.
- Database.
- WhatsApp Session.
- AI Provider Keys.

لا تثق بقيم Frontend بدون تحقق Backend.

## 39. DO NOT OVERENGINEER

إذا كان الحل يحتاج 100 سطر، لا تجعله 1000 بلا سبب.

لا تضف abstraction لمجرد أنها تبدو احترافية.

## 40. NO PREMATURE RAG

لا تستخدم Vector Database أو RAG معقد من البداية.

ابدأ بـ:

```text
Structured Database
+
FAQ
+
Approved Knowledge
```

أضف RAG فقط إذا ظهرت حاجة حقيقية.

## 41. NO PREMATURE LOCAL AI

Local LLM ليس شرطًا للـMVP.

ابدأ بـAI Provider بسيط، وأضف Local Provider لاحقًا إذا كانت موارد السيرفر مناسبة.

## 42. NO UNNECESSARY DEPENDENCIES

قبل إضافة Package اسأل:
1. هل نحتاجها فعلًا؟
2. هل يمكن حل المشكلة بالكود الموجود؟
3. هل المكتبة مستقرة؟
4. هل License مناسب؟
5. هل تضيف قيمة حقيقية؟

## 43. WHEN TO ASK THE USER

اسأل المستخدم إذا:
- يوجد قرار معماري جديد.
- يوجد أكثر من تصميم جوهري.
- الطلب يغير Scope.
- الطلب يغير Stack.
- يوجد تأثير كبير على مراحل لاحقة.
- توجد معلومة أساسية ناقصة.

## 44. WHEN NOT TO ASK

لا تسأل عن:
- أسماء متغيرات بسيطة.
- أسماء ملفات داخلية.
- تفاصيل implementation صغيرة.
- اختيارات داخلية لا تغير المعمارية.

اتخذ القرار التقني المنطقي ووثقه.

## 45. BEFORE CODING CHECKLIST

```text
[ ] ما هي Phase الحالية؟
[ ] ما المطلوب؟
[ ] هل يوجد شيء مشابه؟
[ ] هل التغيير ضمن Scope؟
[ ] هل يؤثر على Architecture؟
[ ] هل يؤثر على Phases لاحقة؟
[ ] ما الاختبارات المطلوبة؟
[ ] ما Acceptance Criteria؟
```

## 46. AFTER CODING CHECKLIST

```text
[ ] Build
[ ] Tests
[ ] Error handling
[ ] Existing functionality still works
[ ] Database migration checked
[ ] API checked
[ ] UI checked
[ ] Security checked
[ ] Logs checked
[ ] Acceptance criteria checked
```

## 47. REPORT FORMAT

بعد كل Phase:

```text
## Phase X — Status

Status:
PASS / FAIL / PARTIAL

### Implemented
- ...

### Files Changed
- ...

### Tests
- ...

### Test Results
- ...

### Known Issues
- ...

### Acceptance Gate
- PASS / FAIL

### Next Step
- WAIT FOR APPROVAL
```

لا تقل "كل شيء تمام" بلا تفاصيل.

## 48. FAILURE RULE

إذا فشلت Phase:

```text
PHASE = FAILED
```

ثم:

```text
Identify Root Cause
↓
Fix
↓
Retest
↓
Gate
```

لا تنتقل إلى Phase التالية.

## 49. DO NOT HIDE PROBLEMS

إذا وجدت:
- Architecture flaw.
- Security issue.
- Reliability problem.
- Bad UX.
- Technical debt.
- Wrong assumption.

قل ذلك بوضوح.

## 50. USER DECISION OVERRIDES OLD PLAN

إذا قال المستخدم قرارًا جديدًا:

1. حدد ما الذي سيتأثر.
2. حدّث الخطة.
3. لا تترك أجزاء متناقضة مع القرار الجديد.

## 51. PHASE ROADMAP

```text
PHASE 0  Foundation
PHASE 1  WhatsApp Connection
PHASE 2  Message Engine
PHASE 3  Conversations
PHASE 4  Shadcn Dashboard
PHASE 5  Clinic Knowledge
PHASE 6  AI Gateway
PHASE 7  Intent Router
PHASE 8  Guardrails
PHASE 9  Human Handoff
PHASE 10 Interactive Messages
PHASE 11 Appointments
PHASE 12 Conversation Memory
PHASE 13 Reliability
PHASE 14 Notifications
PHASE 15 Audit
PHASE 16 Testing
PHASE 17 Production
PHASE 18 Client Handover
```

## 52. CRITICAL ARCHITECTURE RULES

هذه القواعد غير قابلة للكسر إلا بقرار صريح:

```text
1. Go هو Backend Authority.
2. PostgreSQL هو مصدر البيانات.
3. WhatsApp Layer منفصل عن Business Logic.
4. AI Provider منفصل عن Business Logic.
5. AI لا يقرر العمليات الحساسة.
6. Human Mode يمنع AI.
7. لا يتم اختراع بيانات العيادة.
8. لا يتم تقديم تشخيص أو وصف دواء.
9. كل Message لها Idempotency.
10. كل رسالة صادرة لها Delivery State.
11. WhatsApp Session يجب أن تكون Persistent.
12. Connection Manager يجب أن يدعم Reconnect.
13. Frontend لا يعتبر مصدر أمان.
14. لا نغير Stack بدون موافقة.
15. لا نقفز بين Phases.
16. لا نعلن نجاحًا بدون اختبار.
```

## 53. FINAL RULE

عند الشك:

```text
لا تخمن.
لا تخترع.
لا تتوسع.
لا تقفز.
لا تعيد بناء ما يعمل.
لا تغير المعمارية من نفسك.
لا تجعل AI صاحب القرار.
```

بدل ذلك:

```text
افحص المشروع
↓
ارجع إلى Rules
↓
حدد Phase
↓
نفذ أصغر تغيير صحيح
↓
اختبر
↓
اعرض النتيجة
↓
توقف عند Gate
```

## 54. GOLDEN PRINCIPLE

> **Build the smallest correct system first.**

> **AI يفهم ويقترح ويصيغ، لكن Go يتحكم ويقرر وينفذ.**
