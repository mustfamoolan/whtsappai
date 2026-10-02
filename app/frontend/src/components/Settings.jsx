import React from 'react';
import PageContainer from './layout/PageContainer';
import ClinicSettings from './ClinicSettings';
import WhatsAppDashboard from './WhatsAppDashboard';

export default function Settings() {
  return (
    <PageContainer title="الإعدادات الشاملة" description="إدارة إعدادات العيادة وربط خدمة الواتساب">
      <div className="space-y-12">
        
        {/* القسم الأول: إعدادات العيادة */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">1. البيانات الأساسية للعيادة</h2>
            <p className="text-sm text-muted-foreground">هذه البيانات تستخدم لتدريب المساعد الذكي للرد على أسئلة المرضى.</p>
          </div>
          <ClinicSettings />
        </section>

        {/* القسم الثاني: ربط الواتساب */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">2. ربط حساب الواتساب</h2>
            <p className="text-sm text-muted-foreground">قم بربط حساب العيادة ليتمكن المساعد الذكي من الرد آلياً.</p>
          </div>
          <WhatsAppDashboard />
        </section>

      </div>
    </PageContainer>
  );
}
