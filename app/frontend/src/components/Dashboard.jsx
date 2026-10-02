import React from 'react';
import PageContainer from './layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Users, MessageCircle, Calendar, Activity } from 'lucide-react';

export default function Dashboard() {
  return (
    <PageContainer title="الرئيسية" description="إحصائيات ونظرة عامة على أداء العيادة والمساعد الذكي">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">الرسائل اليوم</CardTitle>
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+20% عن الأمس</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">المرضى المتفاعلين</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38</div>
            <p className="text-xs text-muted-foreground">+5 من الأسبوع الماضي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">المواعيد المحجوزة</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">عن طريق الذكاء الاصطناعي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">نسبة الرد الآلي</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">تم التعامل معها بدون تدخل بشري</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>معدل التفاعل خلال الأسبوع</CardTitle>
            <CardDescription>هذا الرسم البياني سيعرض لاحقاً (قيد التطوير)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
              <span className="text-slate-400">مساحة مخصصة للرسم البياني (Chart Placeholder)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>آخر النشاطات</CardTitle>
            <CardDescription>النشاطات الأخيرة في النظام (قيد التطوير)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
