import React, { useState, useEffect } from 'react';
import PageContainer from './layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function ClinicSettings() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    address: '', 
    phone: '', 
    working_hours: '', 
    location: '', 
    description: '' 
  });

  useEffect(() => {
    fetchClinicInfo();
  }, []);

  const fetchClinicInfo = async () => {
    try {
      const res = await fetch('/api/v1/knowledge/clinic');
      const data = await res.json();
      if (data && data.name) {
        setForm(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/knowledge/clinic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        // Show some success feedback if needed
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>معلومات العيادة</CardTitle>
            <CardDescription>البيانات الأساسية التي سيستخدمها المساعد الذكي للإجابة عن أسئلة المرضى. هذه المعلومات دقيقة جداً ويجب ألا يتم إضافة معلومات غير معتمدة.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">اسم العيادة</label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div>
                  <label className="text-sm font-medium">رقم الهاتف الأساسي</label>
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required dir="ltr" className="text-right" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">العنوان بالتفصيل</label>
                  <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
                </div>
                <div>
                  <label className="text-sm font-medium">ساعات العمل الأساسية</label>
                  <Input value={form.working_hours} onChange={e => setForm({...form, working_hours: e.target.value})} placeholder="مثال: من السبت للخميس، 9ص - 9م" required />
                </div>
                <div>
                  <label className="text-sm font-medium">رابط الموقع (خرائط جوجل)</label>
                  <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} dir="ltr" className="text-right" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">وصف العيادة ومجال التخصص</label>
                  <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="عيادة متخصصة في طب وتجميل الأسنان..." />
                </div>
              </div>
              <div className="pt-4 border-t mt-6 flex justify-end">
                <Button type="submit" disabled={loading}>حفظ التغييرات</Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </div>
  );
}
