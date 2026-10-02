import React, { useState, useEffect } from 'react';
import PageContainer from './layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', specialty: '', working_days: '', working_hours: '', consultation_fee: '' });
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing ? `/api/v1/knowledge/doctors/${form.id}` : '/api/v1/knowledge/doctors';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        resetForm();
        fetchDoctors();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطبيب؟")) return;
    try {
      await fetch(`/api/v1/knowledge/doctors/${id}`, { method: 'DELETE' });
      fetchDoctors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (doc) => {
    setForm({
      id: doc.id,
      name: doc.name,
      specialty: doc.specialty,
      working_days: doc.working_days,
      working_hours: doc.working_hours,
      consultation_fee: doc.consultation_fee || ''
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setForm({ id: null, name: '', specialty: '', working_days: '', working_hours: '', consultation_fee: '' });
    setIsEditing(false);
  };

  return (
    <PageContainer title="إدارة الأطباء" description="إضافة وتعديل وحذف الأطباء في العيادة">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'تعديل طبيب' : 'إضافة طبيب جديد'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <label className="text-sm font-medium">سعر الكشفية</label>
                <Input value={form.consultation_fee} onChange={e => setForm({...form, consultation_fee: e.target.value})} placeholder="مثال: 25,000 د.ع" required />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {isEditing ? 'تحديث' : 'إضافة'}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    إلغاء
                  </Button>
                )}
              </div>
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
                      <p className="text-xs text-primary font-medium mt-1">الكشفية: {doc.consultation_fee || 'غير محدد'}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(doc)}>تعديل</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(doc.id)}>حذف</Button>
                    </div>
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
