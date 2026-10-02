import React, { useState, useEffect } from 'react';
import PageContainer from './layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Faq() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: null, question: '', approved_answer: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/v1/knowledge/faqs');
      const data = await res.json();
      setFaqs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setFaqs([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing ? `/api/v1/knowledge/faqs/${form.id}` : '/api/v1/knowledge/faqs';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        resetForm();
        fetchFaqs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;
    try {
      await fetch(`/api/v1/knowledge/faqs/${id}`, { method: 'DELETE' });
      fetchFaqs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (faq) => {
    setForm({
      id: faq.id,
      question: faq.question,
      approved_answer: faq.approved_answer
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setForm({ id: null, question: '', approved_answer: '' });
    setIsEditing(false);
  };

  return (
    <PageContainer title="الأسئلة الشائعة" description="إدارة الأسئلة وإجاباتها المعتمدة للذكاء الاصطناعي">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'تعديل سؤال' : 'إضافة سؤال جديد'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">السؤال المتوقع من المريض</label>
                <Input value={form.question} onChange={e => setForm({...form, question: e.target.value})} placeholder="مثال: هل يتوفر تبييض أسنان؟" required />
              </div>
              <div>
                <label className="text-sm font-medium">الإجابة المعتمدة (سيتم تدريب AI عليها)</label>
                <Input value={form.approved_answer} onChange={e => setForm({...form, approved_answer: e.target.value})} placeholder="مثال: نعم، يتوفر تبييض بتقنية الليزر..." required />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {isEditing ? 'تحديث' : 'إضافة سؤال'}
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
            <CardTitle>قائمة الأسئلة الشائعة</CardTitle>
          </CardHeader>
          <CardContent>
            {faqs.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا يوجد أسئلة مضافة.</p>
            ) : (
              <div className="space-y-4">
                {faqs.map(faq => (
                  <div key={faq.id} className="flex flex-col p-4 border rounded-lg bg-card gap-2 relative">
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(faq)} className="h-6 px-2 text-[10px]">تعديل</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(faq.id)} className="h-6 px-2 text-[10px]">حذف</Button>
                    </div>
                    <h4 className="font-semibold text-sm pl-24 text-primary">{faq.question}</h4>
                    <p className="text-sm text-muted-foreground">{faq.approved_answer}</p>
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
