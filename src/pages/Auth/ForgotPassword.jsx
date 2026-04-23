// ============================================================
// CV-Mister — Forgot Password Page
// ============================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/Layout/AuthLayout';
import useStyleStore from '../../store/useStyleStore';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const language = useStyleStore((s) => s.language);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      toast.success(language === 'ar' ? 'تم إرسال رابط الاستعادة إلى بريدك' : 'Recovery link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error sending link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title={language === 'ar' ? 'استعادة كلمة المرور' : 'Reset Password'} 
      subtitle={language === 'ar' ? 'أدخل بريدك الإلكتروني لإرسال رابط الاستعادة' : 'Enter your email to receive a recovery link'}
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
          />
        </div>

        <button className="btn-premium" disabled={loading} style={{ width: '100%' }}>
          {loading ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (language === 'ar' ? 'إرسال الرابط' : 'Send Reset Link')}
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '16px' }}>
          <Link to="/login" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>
            {language === 'ar' ? 'العودة للدخول' : 'Back to Login'}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
