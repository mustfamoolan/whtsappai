import React, { useState, useEffect } from 'react';
import PageContainer from './layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', description: '', price: 0, duration: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/v1/knowledge/services');
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setServices([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing ? `/api/v1/knowledge/services/${form.id}` : '/api/v1/knowledge/services';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...form, price: parseFloat(form.price)})
      });
      
      if (res.ok) {
        resetForm();
        fetchServices();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;
    try {
      await fetch(`/api/v1/knowledge/services/${id}`, { method: 'DELETE' });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (svc) => {
    setForm({
      id: svc.id,
      name: svc.name,
      description: svc.description,
      price: svc.price,
      duration: svc.duration
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setForm({ id: null, name: '', description: '', price: 0, duration: '' });
    setIsEditing(false);
  };

  return (
    <PageContainer title="إدارة الخدمات" description="إضافة وتعديل وحذف خدمات العيادة وأسعارها">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'تعديل خدمة' : 'إضافة خدمة جديدة'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">اسم الخدمة</label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <label className="text-sm font-medium">الوصف</label>
                <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">السعر</label>
                <Input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
              </div>
              <div>
                <label className="text-sm font-medium">المدة المتوقعة</label>
                <Input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="مثال: 30 دقيقة" required />
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
            <CardTitle>قائمة الخدمات</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا يوجد خدمات مضافة.</p>
            ) : (
              <div className="space-y-4">
                {services.map(svc => (
                  <div key={svc.id} className="flex justify-between items-center p-4 border rounded-lg bg-card">
                    <div>
                      <h4 className="font-medium">{svc.name}</h4>
                      <p className="text-xs text-muted-foreground">{svc.description}</p>
                      <p className="text-sm font-semibold mt-1 text-primary">{svc.price} د.ع | {svc.duration}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(svc)}>تعديل</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(svc.id)}>حذف</Button>
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
