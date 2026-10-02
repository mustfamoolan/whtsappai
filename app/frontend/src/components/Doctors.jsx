import React, { useState, useEffect } from 'react';
import PageContainer from './layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', specialty: '', working_days: '', working_hours: '' });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/v1/knowledge/doctors');
      const data = await res.json();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setDoctors([]);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/knowledge/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ name: '', specialty: '', working_days: '', working_hours: '' });
        fetchDoctors();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/v1/knowledge/doctors/${id}`, { method: 'DELETE' });
      fetchDoctors();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <PageContainer title="إدارة الأطباء" description="إضافة وحذف الأطباء في العيادة">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>إضافة طبيب جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium">الاسم</label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <label className="text-sm font-medium">التخصص</label>
                <Input value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} required />
              </div>
              <div>
                <label className="text-sm font-medium">أيام العمل</label>
                <Input value={form.working_days} onChange={e => setForm({...form, working_days: e.target.value})} placeholder="مثال: الأحد إلى الخميس" required />
              </div>
              <div>
                <label className="text-sm font-medium">ساعات العمل</label>
                <Input value={form.working_hours} onChange={e => setForm({...form, working_hours: e.target.value})} placeholder="مثال: 9 ص - 5 م" required />
              </div>
              <Button type="submit" disabled={loading}>إضافة</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>قائمة الأطباء</CardTitle>
          </CardHeader>
          <CardContent>
            {doctors.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا يوجد أطباء مضافين.</p>
            ) : (
              <div className="space-y-4">
                {doctors.map(doc => (
                  <div key={doc.id} className="flex justify-between items-center p-4 border rounded-lg bg-card">
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                      <p className="text-xs text-muted-foreground">{doc.working_days} | {doc.working_hours}</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(doc.id)}>حذف</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
