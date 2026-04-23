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
  const { login, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success(language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Logged in successfully');
      navigate('/dashboard');
    } else if (result.notVerified) {
      toast.error(language === 'ar' ? 'يرجى تفعيل البريد الإلكتروني أولاً' : 'Please verify your email first');
    } else {
      toast.error(language === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed');
    }
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
          />
        </div>

        <button className="btn-premium" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
          {loading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : (language === 'ar' ? 'دخول' : 'Sign In')}
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
