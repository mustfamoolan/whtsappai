import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageCircle, 
  Calendar, 
  Users, 
  Settings, 
  HelpCircle,
  FileText,
  PhoneCall,
  X,
  User,
  LogOut
} from 'lucide-react';

export default function AppSidebar({ isOpen, setIsOpen, onLogout, clinicName }) {
  const navItems = [
    { label: 'الرئيسية', href: '/dashboard', icon: LayoutDashboard },
    { label: 'المحادثات', href: '/chat', icon: MessageCircle },
    { label: 'المواعيد', href: '/appointments', icon: Calendar },
    { label: 'الأطباء', href: '/doctors', icon: Users },
    { label: 'الخدمات', href: '/services', icon: FileText },
    { label: 'الأسئلة الشائعة', href: '/faq', icon: HelpCircle },
    { label: 'إعدادات الذكاء', href: '/ai-settings', icon: Settings },
    { label: 'سجل التدقيق', href: '/audit', icon: FileText },
    { label: 'الإعدادات العامة', href: '/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-6">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
            <PhoneCall className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm">{clinicName || 'Clinic AI'}</span>
        </NavLink>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col gap-1 p-3 overflow-y-auto">
        <p className="px-3 pb-1 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
          القائمة الرئيسية
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-secondary font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </div>

      {/* User footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <span className="text-xs font-medium text-foreground">A</span>
          </div>
          <div className="flex-1 min-w-0 text-right">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">@admin</p>
          </div>
          <button
            onClick={onLogout}
            title="تسجيل الخروج"
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:right-0 lg:w-60 border-l border-border bg-background z-20">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-64 flex flex-col border-l border-border bg-background transform transition-transform duration-200 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <span className="font-semibold text-sm">القائمة</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-1 p-3 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-secondary font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <span className="text-xs font-medium text-foreground">A</span>
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-muted-foreground">مدير</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
