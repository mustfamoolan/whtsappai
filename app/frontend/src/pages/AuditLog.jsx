import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/v1/audit');
      if (response.ok) {
        const data = await response.json();
        setLogs(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Auto refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getEventBadge = (event) => {
    const variants = {
      'AI_REPLY': 'bg-purple-100 text-purple-800 border-purple-200',
      'HUMAN_REPLY': 'bg-blue-100 text-blue-800 border-blue-200',
      'MODE_CHANGE': 'bg-orange-100 text-orange-800 border-orange-200',
      'APPT_CREATED': 'bg-green-100 text-green-800 border-green-200',
      'WA_CONNECTED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'WA_DISCONNECTED': 'bg-red-100 text-red-800 border-red-200',
      'AI_TRACE': 'bg-slate-100 text-slate-800 border-slate-200'
    };

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${variants[event] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {event}
      </span>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">سجل التدقيق (Audit Log)</h1>
        <p className="text-sm text-gray-500 mt-1">
          تتبع جميع الحركات والأحداث الهامة في النظام ومسار عمل الذكاء الاصطناعي.
        </p>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardHeader className="bg-gray-50/50 border-b pb-4">
          <CardTitle className="text-lg">سجل الأحداث</CardTitle>
          <CardDescription>يتم عرض آخر 100 حدث مسجل في النظام.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {loading && logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">جاري تحميل السجل...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">لا توجد أحداث مسجلة بعد.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs.filter(log => !['AI_REPLY', 'HUMAN_REPLY', 'AI_TRACE'].includes(log.event)).map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {getEventBadge(log.event)}
                        <span className="text-xs text-gray-400">
                          {new Date(log.created_at).toLocaleString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mt-2">{log.details}</p>
                      
                      {log.entity_id && (
                        <p className="text-xs text-gray-500">
                          المعرف (Entity ID): <span className="font-mono bg-gray-100 px-1 rounded">{log.entity_id}</span>
                        </p>
                      )}
                      
                      {log.payload && (
                        <div className="mt-3">
                          <pre className="text-xs bg-slate-900 text-slate-50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed" dir="ltr">
                            {log.payload}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
