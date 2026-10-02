import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function AISettings() {
  const [settings, setSettings] = useState({
    gemini_api_key: '',
    gemini_model: '',
    prompt_dos: '',
    prompt_donts: '',
    handoff_rules: '',
    admin_whatsapp_numbers: ''
  });
  
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Persona Form State
  const [newPersona, setNewPersona] = useState({ name: '', gender: '', dialect: '', description: '', is_active: true });

  useEffect(() => {
    fetchSettings();
    fetchPersonas();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/v1/ai-settings');
      if (res.ok) {
        const data = await res.json();
        if (data.ID) { // If it exists
          setSettings(data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPersonas = async () => {
    try {
      const res = await fetch('/api/v1/ai-personas');
      if (res.ok) {
        setPersonas(await res.json() || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/ai-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('تم حفظ إعدادات الذكاء الاصطناعي بنجاح');
      }
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الحفظ');
    }
    setLoading(false);
  };

  const addPersona = async () => {
    if (!newPersona.name || !newPersona.gender || !newPersona.dialect || !newPersona.description) return alert("يرجى ملء جميع حقول الشخصية");
    try {
      const res = await fetch('/api/v1/ai-personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPersona)
      });
      if (res.ok) {
        fetchPersonas();
        setNewPersona({ name: '', gender: '', dialect: '', description: '', is_active: true });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deletePersona = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الشخصية؟')) return;
    try {
      const res = await fetch(`/api/v1/ai-personas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPersonas();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إعدادات الذكاء الاصطناعي (AI Settings)</h1>
        <p className="text-sm text-gray-500 mt-1">
          إدارة المفاتيح، القواعد، والشخصيات الخاصة بالمساعد الذكي.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: API & Rules */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مفتاح الربط (API Key) & الإشعارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gemini API Key</label>
                <Input 
                  type="password" 
                  value={settings.gemini_api_key || ''} 
                  onChange={(e) => setSettings({...settings, gemini_api_key: e.target.value})}
                  placeholder="AIzaSy..." 
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gemini Model</label>
                <Input 
                  value={settings.gemini_model || ''} 
                  onChange={(e) => setSettings({...settings, gemini_model: e.target.value})}
                  placeholder="مثال: gemini-1.5-flash أو gemini-2.5-flash" 
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">أرقام واتساب الإدارة (لتحويل المحادثات)</label>
                <Input 
                  value={settings.admin_whatsapp_numbers || ''} 
                  onChange={(e) => setSettings({...settings, admin_whatsapp_numbers: e.target.value})}
                  placeholder="مثال: 9647700000000, 9647800000000" 
                  dir="ltr"
                />
                <p className="text-xs text-gray-500">مفصولة بفاصلة. سيقوم النظام بمراسلتهم عند الحاجة لتدخل بشري.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">مدة تحويل الموظف للذكاء الاصطناعي (بالدقائق)</label>
                <Input 
                  type="number"
                  value={settings.auto_ai_timeout_minutes || ''} 
                  onChange={(e) => setSettings({...settings, auto_ai_timeout_minutes: parseInt(e.target.value) || 0})}
                  placeholder="مثال: 5" 
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>القواعد العامة (Global Prompts)</CardTitle>
              <CardDescription>هذه القواعد تطبق على كل الشخصيات.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-700">المسموحات (Dos)</label>
                <textarea 
                  className="w-full min-h-[100px] p-3 border rounded-md text-sm"
                  placeholder="بماذا يحق للذكاء الاصطناعي التحدث؟ (مثال: أجب بلطف، اعتمد على جدول الأسعار، ...)"
                  value={settings.prompt_dos || ''}
                  onChange={(e) => setSettings({...settings, prompt_dos: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-red-700">الممنوعات (Don'ts)</label>
                <textarea 
                  className="w-full min-h-[100px] p-3 border rounded-md text-sm"
                  placeholder="ما هي الخطوط الحمراء؟ (مثال: يمنع منعاً باتاً وصف الأدوية، لا تخترع أسعار، ...)"
                  value={settings.prompt_donts || ''}
                  onChange={(e) => setSettings({...settings, prompt_donts: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-700">قواعد التحويل للبشري (Handoff Rules)</label>
                <textarea 
                  className="w-full min-h-[100px] p-3 border rounded-md text-sm"
                  placeholder="متى يجب أن ينسحب الـ AI؟ (مثال: إذا غضب المريض، إذا طلب التحدث مع موظف، إذا كانت حالة طارئة...)"
                  value={settings.handoff_rules || ''}
                  onChange={(e) => setSettings({...settings, handoff_rules: e.target.value})}
                />
              </div>
              <Button onClick={saveSettings} disabled={loading} className="w-full">
                {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات والقواعد'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Personas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الشخصيات (AI Personas)</CardTitle>
              <CardDescription>عند بدء محادثة جديدة، سيختار النظام إحدى هذه الشخصيات عشوائياً ويثبتها مع المريض.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* List of Personas */}
              <div className="space-y-3">
                {personas.length === 0 && <p className="text-sm text-gray-500">لا توجد شخصيات. يرجى إضافة واحدة على الأقل.</p>}
                {personas.map(p => (
                  <div key={p.ID} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{p.name} {p.is_active ? <span className="text-xs text-green-600">(نشط)</span> : <span className="text-xs text-red-600">(معطل)</span>}</p>
                      <p className="text-xs text-gray-500">النوع: {p.gender} | اللهجة: {p.dialect}</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deletePersona(p.ID)}>حذف</Button>
                  </div>
                ))}
              </div>

              {/* Add New Persona Form */}
              <div className="pt-4 border-t mt-4 space-y-3">
                <h4 className="text-sm font-bold">إضافة شخصية جديدة</h4>
                <Input 
                  placeholder="اسم الشخصية (مثال: زهراء)"
                  value={newPersona.name}
                  onChange={(e) => setNewPersona({...newPersona, name: e.target.value})}
                />
                <Input 
                  placeholder="النوع (مثال: أنثى)"
                  value={newPersona.gender}
                  onChange={(e) => setNewPersona({...newPersona, gender: e.target.value})}
                />
                <Input 
                  placeholder="اللهجة (مثال: عراقية عامة)"
                  value={newPersona.dialect}
                  onChange={(e) => setNewPersona({...newPersona, dialect: e.target.value})}
                />
                <textarea 
                  className="w-full min-h-[120px] p-3 border rounded-md text-sm"
                  placeholder="تفاصيل الشخصية (مثال: زهراء شخصية عراقية ودودة وهادئة...)"
                  value={newPersona.description}
                  onChange={(e) => setNewPersona({...newPersona, description: e.target.value})}
                />
                <Button variant="secondary" onClick={addPersona} className="w-full">إضافة الشخصية</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
