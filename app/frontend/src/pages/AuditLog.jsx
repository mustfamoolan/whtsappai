import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function AuditLog() {
  const [data, setData] = useState({ data: [], current_page: 1, last_page: 1, total: 0, per_page: 10 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/v1/audit?page=${page}&per_page=${perPage}`);
      if (response.ok) {
        const result = await response.json();
        // Fallback for transition period if backend is not yet deployed
        if (Array.isArray(result)) {
          setData({ data: result, current_page: 1, last_page: 1, total: result.length, per_page: result.length });
        } else {
          setData(result);
        }
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, perPage]);

  // Periodic refresh only on page 1
  useEffect(() => {
    if (page !== 1) return;
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [page, perPage]);

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
          تتبع جميع الحركات والأحداث الهامة في النظام.
        </p>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardHeader className="bg-gray-50/50 border-b pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">سجل الأحداث</CardTitle>
            <CardDescription>إجمالي العمليات المسجلة: <strong className="text-gray-900">{data.total}</strong></CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">الصفوف:</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="text-sm border-gray-300 rounded-md shadow-sm"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {loading && data.data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">جاري تحميل السجل...</div>
          ) : data.data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">لا توجد أحداث مسجلة.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.data.map((log) => (
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
        {/* Pagination Footer */}
        {data.last_page > 1 && (
          <div className="border-t bg-gray-50 p-4 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              صفحة {data.current_page} من {data.last_page}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={data.current_page <= 1}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(data.last_page, p + 1))}
                disabled={data.current_page >= data.last_page}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
