// ============================================================
// CV-Mister — App.jsx (Production Sync)
// ============================================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import ProtectedAdminRoute from './components/Layout/ProtectedAdminRoute';
import ChatWidget from './components/Common/ChatWidget';
import { useSocket } from './hooks/useSocket';
import { API_ROUTES } from './api/config';

import Landing from './pages/Landing';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import CoverLetterBuilder from './pages/CoverLetterBuilder';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Contact from './pages/Contact';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

import useStyleStore from './store/useStyleStore';
import useAuthStore from './store/useAuthStore';
import useThemeStore from './store/useThemeStore';
import useCMSStore from './store/useCMSStore';

// Inner component to access useLocation inside Router
function AppContent() {
  const loadSettings = useCMSStore((s) => s.loadSettings);
  const language = useStyleStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const darkMode = useThemeStore((s) => s.darkMode);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAppRoute = location.pathname.startsWith('/builder') || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  // ── Global Real-time Sync for User Plan ──────────────────────
  const userId = user?._id || user?.id || user?.firebaseUID;
  console.log('[App] 🔌 Socket room ID:', userId);

  useSocket({
    room: userId,
    events: {
      'my-plan-updated': (event) => {
        console.log('[App] 🌐 Global Real-time Plan Update:', event.data);
        const { plan, status, isPremium, rejectionReason, resumesLimit, resumeCredits, subscriptionEndDate } = event.data;
        
        // Update user state dynamically — including isPremium and resumeCredits
        useAuthStore.setState((state) => ({ 
           user: { 
             ...state.user, 
             ...(plan && { plan }), 
             ...(status && { paymentStatus: status }),
             ...(resumesLimit !== undefined && { resumesLimit }),
             ...(resumeCredits !== undefined && { resumeCredits }),
             ...(subscriptionEndDate && { subscriptionEndDate }),
             isPremium: isPremium !== undefined ? isPremium : (plan === 'pro')
           } 
        }));

        if (plan === 'free' || status === 'rejected' || status === 'none') {
          import('react-hot-toast').then(m => m.default.error(
            rejectionReason || 'تم إلغاء تفعيل باقة Pro الخاصة بك. يرجى الدفع مرة أخرى للوصول للقوالب المدفوعة ❌', 
            { duration: 8000, id: 'plan-deactivated', icon: '🔒' }
          ));
        } else if (plan === 'pro') {
          import('react-hot-toast').then(m => m.default.success('مبروك! تم تفعيل اشتراك Pro الخاص بك! ✨ القوالب المدفوعة مفتوحة الآن.', { duration: 5000, id: 'plan-activated' }));
        }
      }
    }
  });


  // Load CMS content and Sync dark class with HTML element
  useEffect(() => {
    loadSettings(); // Fetch content from backend

    // ── Mandatory Plan Sync on Mount ─────────────────────────
    // Also fixes missing _id issue for Socket.IO room join
    const syncUserStatus = async () => {
      if (!user) return;
      try {
        const token = useAuthStore.getState().token;
        if (!token) return;
        const res = await import('axios').then(m => m.default.get(`${API_ROUTES.AUTH}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }));
        if (res.data && res.data._id) {
          console.log('[App] 🔄 User synced on mount — _id:', res.data._id, 'plan:', res.data.plan);
          useAuthStore.setState((state) => ({ 
            user: { ...state.user, ...res.data, emailVerified: state.user?.emailVerified } 
          }));
        }
      } catch (err) {
        console.error('[App] ❌ Status sync failed:', err);
      }
    };
    syncUserStatus();

    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, loadSettings]); // user omitted intentionally to avoid loops, only run on mount/login change implicitly handled by Navbar/Router logic if needed

  return (
    <div 
      dir={language === 'ar' ? 'rtl' : 'ltr'} 
      className={`app-root ${darkMode ? 'dark' : 'light'}`}
      style={{ 
        minHeight: '100vh', 
        display: 'flex',
        flexDirection: 'column',
        fontFamily: language === 'ar' ? "'Readex Pro', sans-serif" : "'Inter', sans-serif",
      }}
    >
      {!isAdminRoute && <Navbar />}
      
      <main style={{ paddingTop: isAdminRoute ? '0px' : '72px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Auth Routes (Redirect to dashboard only if fully verified) */}
            <Route path="/login" element={(!user || !user.emailVerified) ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={(!user || !user.emailVerified) ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/builder/resume" element={
              <ProtectedRoute><ResumeBuilder /></ProtectedRoute>
            } />
            <Route path="/builder/cover-letter" element={
              <ProtectedRoute><CoverLetterBuilder /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {!isAppRoute && <Footer />}
        <ChatWidget />
      </div>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <AppContent />
    </Router>
  );
}
