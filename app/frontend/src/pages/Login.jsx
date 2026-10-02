import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Stethoscope, Lock, Mail } from 'lucide-react';

export default function Login({ setAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [clinicName, setClinicName] = useState('العيادة الذكية');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch clinic name for the UI
    const fetchClinicName = async () => {
      try {
        const res = await fetch('/api/v1/knowledge/clinic');
        if (res.ok) {
          const data = await res.json();
          if (data && data.name) setClinicName(data.name);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchClinicName();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAuthenticated(true);
        navigate('/');
      } else {
        setError(data.message || 'بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
        <div className="bg-indigo-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{clinicName}</h1>
        <p className="text-slate-500 mt-2">لوحة التحكم والمساعد الذكي</p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
          <CardDescription className="text-center">
            أدخل بيانات الاعتماد للوصول إلى لوحة الإدارة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">اسم المستخدم / البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                <Input 
                  type="text" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-3 pr-10"
                  dir="ltr"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                <Input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-3 pr-10"
                  dir="ltr"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 mt-2 text-lg"
              disabled={loading}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'دخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <p className="text-xs text-slate-400 mt-8 text-center">
        نظام الإدارة المدعوم بالذكاء الاصطناعي &copy; 2026 <br/> 
        تطوير المهندس مصطفى - 07737777424
      </p>
    </div>
  );
}
