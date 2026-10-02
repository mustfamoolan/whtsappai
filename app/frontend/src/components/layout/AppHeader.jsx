import React, { useState, useEffect, useRef } from 'react';
import { Menu, User, Shield, LogOut, Bell, CheckCircle2 } from 'lucide-react';

export default function AppHeader({ onMenuClick, header }) {
  const [waStatus, setWaStatus] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/v1/whatsapp/status');
        if (res.ok) {
          const data = await res.json();
          setWaStatus(data);
        }
      } catch (e) {
        // ignore
      }
    };
    
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/v1/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data || []);
        }
      } catch (e) {
        // ignore
      }
    };
    
    fetchStatus();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchStatus();
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/v1/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/v1/notifications/read-all`, { method: 'PUT' });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    console.log('Logout');
  };

  return (
    <header className="shrink-0 sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        className="lg:hidden text-muted-foreground hover:text-foreground"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb */}
      <div className="flex-1">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground justify-start">
          <span>{header || 'الرئيسية'}</span>
        </nav>
      </div>

      {/* Header actions */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        {waStatus && (
          <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-full bg-secondary border border-border">
            {waStatus.status === 'CONNECTED' ? (
              <div className="h-2 w-2 rounded-full bg-green-500" />
            ) : waStatus.status === 'RECONNECTING' ? (
              <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-red-500" />
            )}
            <span className="text-[10px] font-medium text-foreground">
              WhatsApp {waStatus.status === 'CONNECTED' ? 'متصل' : 
                       waStatus.status === 'RECONNECTING' ? 'يعيد الاتصال...' : 'مفصول'}
            </span>
          </div>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 rounded-md border border-border bg-background shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
                <h3 className="font-semibold text-sm">الإشعارات</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                    تحديد الكل كمقروء
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    لا توجد إشعارات حالياً
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-border">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`flex gap-3 p-4 hover:bg-secondary/50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-primary/5' : ''}`}
                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${!notif.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notif.type === 'SYSTEM' && '⚙️ '}
                            {notif.type === 'HUMAN' && '🔔 '}
                            {notif.type === 'APPT' && '📅 '}
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-2">
                            {new Date(notif.created_at).toLocaleString('ar-IQ', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="flex-shrink-0 flex items-center">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium leading-none text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1 justify-end">
                <Shield className="h-3 w-3" /> أدمن
              </span>
            </p>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <span className="text-xs font-medium text-foreground">A</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="تسجيل الخروج"
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
