import React, { useState, useEffect } from 'react';
import PageContainer from './layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';

export default function Appointments() {
  const [data, setData] = useState({ data: [], current_page: 1, last_page: 1, total: 0, per_page: 10 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    fetchAppointments();
  }, [page, perPage]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/appointments?page=${page}&per_page=${perPage}`);
      if (res.ok) {
        const result = await res.json();
        // Fallback for transition period
        if (Array.isArray(result)) {
          setData({ data: result, current_page: 1, last_page: 1, total: result.length, per_page: result.length });
        } else {
          setData(result);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`/api/v1/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'COMPLETED': 'bg-blue-100 text-blue-800',
    };
    const labels = {
      'PENDING': 'قيد الانتظار',
      'CONFIRMED': 'مؤكد',
      'CANCELLED': 'ملغى',
      'COMPLETED': 'مكتمل',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <PageContainer title="المواعيد" description="إدارة مواعيد المرضى المحجوزة عبر الذكاء الاصطناعي">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            إجمالي المواعيد: <strong className="text-gray-900">{data.total}</strong>
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
        </div>

        {loading && data.data.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">جاري تحميل المواعيد...</div>
        ) : data.data.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">لا توجد مواعيد حالياً</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 text-gray-700 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">الاسم</th>
                    <th className="px-4 py-3 font-medium">رقم الهاتف</th>
                    <th className="px-4 py-3 font-medium">الطبيب</th>
                    <th className="px-4 py-3 font-medium">الخدمة</th>
                    <th className="px-4 py-3 font-medium">التاريخ</th>
                    <th className="px-4 py-3 font-medium">الوقت</th>
                    <th className="px-4 py-3 font-medium">الحالة</th>
                    <th className="px-4 py-3 font-medium text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.data.map(appt => (
                    <tr key={appt.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{appt.name}</td>
                      <td className="px-4 py-3 text-gray-600" dir="ltr">{appt.phone}</td>
                      <td className="px-4 py-3 text-gray-600">{appt.doctor?.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{appt.service?.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{appt.date}</td>
                      <td className="px-4 py-3 text-gray-600">{appt.time}</td>
                      <td className="px-4 py-3">{getStatusBadge(appt.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {appt.status === 'PENDING' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                                onClick={() => updateStatus(appt.id, 'CONFIRMED')}
                              >
                                <CheckCircle className="w-3 h-3 ml-1" /> تأكيد
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-8 text-xs"
                                onClick={() => updateStatus(appt.id, 'CANCELLED')}
                              >
                                <XCircle className="w-3 h-3 ml-1" /> إلغاء
                              </Button>
                            </>
                          )}
                          {appt.status === 'CONFIRMED' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-xs"
                              onClick={() => updateStatus(appt.id, 'COMPLETED')}
                            >
                              مكتمل
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
          </div>
        )}
      </div>
    </PageContainer>
  );
}
