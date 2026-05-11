// ============================================================
// CV-Mister — Login Page
// ============================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/Layout/AuthLayout';
import useAuthStore from '../../store/useAuthStore';
import useStyleStore from '../../store/useStyleStore';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const language = useStyleStore((s) => s.language);
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retrying, setRetrying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRetrying(false);

    // Show retry message after 5s if still loading (cold start)
    const retryTimer = setTimeout(() => setRetrying(true), 5000);

    const result = await login(email, password);
    clearTimeout(retryTimer);
    setRetrying(false);

    if (result.success) {
      toast.success(language === 'ar' ? 'تم تسجيل الدخول بنجاح ✅' : 'Logged in successfully ✅');
      navigate('/dashboard');
    } else if (result.notVerified) {
      toast.error(language === 'ar' ? 'يرجى تفعيل البريد الإلكتروني أولاً' : 'Please verify your email first');
    } else {
      const msg = useAuthStore.getState().error;
      toast.error(msg || (language === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'));
    }
  };

  const getButtonLabel = () => {
    if (!loading) return language === 'ar' ? 'دخول' : 'Sign In';
    if (retrying) return language === 'ar' ? 'جاري تشغيل الخادم، انتظر...' : 'Server starting, please wait...';
    return language === 'ar' ? 'جاري التحقق...' : 'Signing in...';
  };

  return (
    <AuthLayout 
      title={language === 'ar' ? 'تسجيل الدخول' : 'Sign In'} 
      subtitle={language === 'ar' ? 'مرحباً بك مجدداً في CV-Mister' : 'Welcome back to CV-Mister'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label className="form-label">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
          <input 
            type="email" 
            className="form-input" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="name@company.com"
            autoComplete="email"
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
            <Link to="/forgot-password" style={{ fontSize: '12px', color: '#3B82F6', textDecoration: 'none' }}>
              {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot?'}
            </Link>
          </div>
          <input 
            type="password" 
            className="form-input" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            autoComplete="current-password"
          />
        </div>

        {retrying && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #f59e0b',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '13px',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>⏳</span>
            <span>{language === 'ar' 
              ? 'الخادم في وضع السكون، يتم تشغيله... سيكتمل خلال ثوانٍ'
              : 'Server is warming up, this takes a few seconds...'
            }</span>
          </div>
        )}

        <button className="btn-premium" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
          {getButtonLabel()}
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '16px' }}>
          {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"} {' '}
          <Link to="/register" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>
            {language === 'ar' ? 'إنشاء حساب جديد' : 'Sign Up'}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
