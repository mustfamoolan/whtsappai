import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import PageContainer from './layout/PageContainer';

export default function WhatsAppDashboard() {
  const [status, setStatus] = useState('DISCONNECTED');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/v1/whatsapp/status');
      const data = await response.json();
      setStatus(data.status);
    } catch (err) {
      console.error('Failed to fetch status', err);
    }
  };

  const fetchQR = async () => {
    try {
      const response = await fetch('/api/v1/whatsapp/qr');
      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qr || '');
      } else {
        setQrCode('');
      }
    } catch (err) {
      console.error('Failed to fetch QR', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus();
      if (status === 'CONNECTING') {
        fetchQR();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [status]);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/whatsapp/connect', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to connect');
      }
      fetchStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/whatsapp/logout', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to logout');
      }
      fetchStatus();
      setQrCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (currentStatus) => {
    switch (currentStatus) {
      case 'CONNECTED': return 'text-green-500';
      case 'DISCONNECTED': return 'text-red-500';
      case 'CONNECTING': return 'text-yellow-500';
      case 'DEGRADED': return 'text-orange-500';
      case 'LOGGED_OUT': return 'text-gray-500';
      case 'RECONNECTING': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">حالة الاتصال</CardTitle>
              <div className={`h-4 w-4 rounded-full ${status === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-xl font-bold ${getStatusColor(status)}`} dir="ltr">
                {status}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {status === 'CONNECTED' ? 'جاهز لاستقبال الرسائل' : 'يتطلب الإجراء'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>اتصال الواتساب</CardTitle>
            <CardDescription>اربط حساب الواتساب الخاص بالعيادة مع المساعد الذكي.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div className="flex items-center gap-4">
              {status !== 'CONNECTED' && status !== 'CONNECTING' && (
                <Button onClick={handleConnect} disabled={loading}>
                  {loading ? 'جاري الاتصال...' : 'اتصال بالواتساب'}
                </Button>
              )}
              
              {status === 'CONNECTED' && (
                <Button variant="destructive" onClick={handleLogout} disabled={loading}>
                  {loading ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}
                </Button>
              )}
            </div>

            {status === 'CONNECTING' && qrCode && (
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border max-w-sm mt-4">
                <h3 className="mb-4 text-sm font-medium text-slate-900">امسح الرمز بواسطة واتساب</h3>
                <QRCodeSVG value={qrCode} size={256} />
                <p className="mt-4 text-xs text-slate-500 text-center">
                  افتح واتساب على هاتفك، اذهب إلى الإعدادات {'>'} الأجهزة المرتبطة {'>'} ربط جهاز.
                </p>
              </div>
            )}
            
            {status === 'CONNECTING' && !qrCode && (
              <div className="flex items-center justify-center p-12 text-sm text-slate-500 border rounded-lg max-w-sm mt-4">
                في انتظار الرمز...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
