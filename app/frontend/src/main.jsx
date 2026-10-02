import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom'
import App from './App.jsx'
import Docs from './Docs.jsx'
import UIShowcase from './UIShowcase.jsx'
import Dashboard from './components/Dashboard.jsx'
import ChatDashboard from './components/ChatDashboard.jsx'
import Doctors from './components/Doctors.jsx'
import Services from './components/Services.jsx'
import Faq from './components/Faq.jsx'
import Settings from './components/Settings.jsx'
import Appointments from './components/Appointments.jsx'
import AppShell from './components/layout/AppShell.jsx'
import AuditLog from './pages/AuditLog.jsx'
import AISettings from './pages/AISettings.jsx'
import Login from './pages/Login.jsx'
import './index.css'

function AppLayout({ setAuthenticated }) {
  const navigate = useNavigate();
  const [clinicName, setClinicName] = useState('');

  useEffect(() => {
    const fetchClinicName = async () => {
      try {
        const res = await fetch('/api/v1/knowledge/clinic');
        if (res.ok) {
          const data = await res.json();
          if (data && data.name) setClinicName(data.name);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchClinicName();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      setAuthenticated(false);
      navigate('/login');
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <AppShell header="لوحة التحكم" onLogout={handleLogout} clinicName={clinicName}>
      <Outlet />
    </AppShell>
  );
}

function AuthWrapper({ children, authenticated, setAuthenticated }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (res.ok) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (e) {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [setAuthenticated]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">جاري التحقق من الهوية...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function MainApp() {
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={
          authenticated ? <Navigate to="/dashboard" replace /> : <Login setAuthenticated={setAuthenticated} />
        } />
        <Route path="/docs" element={<Docs />} />
        <Route path="/ui-showcase" element={<UIShowcase />} />
        
        {/* Application Routes wrapped in AppShell and Auth */}
        <Route element={
          <AuthWrapper authenticated={authenticated} setAuthenticated={setAuthenticated}>
            <AppLayout setAuthenticated={setAuthenticated} />
          </AuthWrapper>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<ChatDashboard />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/services" element={<Services />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/ai-settings" element={<AISettings />} />
          <Route path="/audit" element={<AuditLog />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainApp />
  </StrictMode>,
)
