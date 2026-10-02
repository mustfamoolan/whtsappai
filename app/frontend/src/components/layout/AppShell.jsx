import React, { useState } from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

export default function AppShell({ children, header, onLogout, clinicName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background" dir="rtl">
    {/* Desktop & Mobile Sidebar */}
      <AppSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onLogout={onLogout} clinicName={clinicName} />

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 lg:pr-60 h-full overflow-hidden">
        {/* Top header */}
        <AppHeader onMenuClick={() => setSidebarOpen(true)} header={header} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6 flex flex-col">
          {children}
        </main>
        
        {/* We can place AppFooter here if needed, Arshif doesn't have one but we can keep it subtle */}
        <AppFooter />
      </div>
    </div>
  );
}
