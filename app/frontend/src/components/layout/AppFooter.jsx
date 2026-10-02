import React from 'react';

export default function AppFooter() {
  return (
    <footer className="h-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-6 shrink-0 text-xs text-slate-500 dark:text-slate-400">
      <div>
        <span>© 2026 Clinic AI WhatsApp Agent - تطوير المهندس مصطفى | 07737777424</span>
      </div>
      <div className="flex items-center gap-4">
        <span>الإصدار 1.0.0</span>
      </div>
    </footer>
  );
}
