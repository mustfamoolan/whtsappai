import React, { useState, useEffect } from 'react';
import PageContainer from './layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Faq() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ question: '', approved_answer: '' });

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

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/knowledge/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ question: '', approved_answer: '' });
        fetchFaqs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/v1/knowledge/faqs/${id}`, { method: 'DELETE' });
      fetchFaqs();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <PageContainer title="الأسئلة الشائعة" description="إدارة الأسئلة وإجاباتها المعتمدة للذكاء الاصطناعي">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>إضافة سؤال جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium">السؤال المتوقع من المريض</label>
                <Input value={form.question} onChange={e => setForm({...form, question: e.target.value})} placeholder="مثال: هل يتوفر تبييض أسنان؟" required />
              </div>
              <div>
                <label className="text-sm font-medium">الإجابة المعتمدة (سيتم تدريب AI عليها)</label>
                <Input value={form.approved_answer} onChange={e => setForm({...form, approved_answer: e.target.value})} placeholder="مثال: نعم، يتوفر تبييض بتقنية الليزر..." required />
              </div>
              <Button type="submit" disabled={loading}>إضافة سؤال</Button>
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
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(faq.id)} className="absolute top-4 left-4 h-6 px-2 text-[10px]">حذف</Button>
                    <h4 className="font-semibold text-sm pl-12 text-primary">{faq.question}</h4>
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
