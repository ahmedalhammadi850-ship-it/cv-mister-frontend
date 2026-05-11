// ============================================================
// CV-Mister — Reset Password Page
// ============================================================

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/Layout/AuthLayout';
import useStyleStore from '../../store/useStyleStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../api/config';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const language = useStyleStore((s) => s.language);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error(language === 'ar' ? 'الباسورد غير متطابق' : 'Passwords do not match');
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password/${token}`, { password });
      toast.success(language === 'ar' ? 'تم تغيير كلمة المرور' : 'Password reset successful');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title={language === 'ar' ? 'كلمة مرور جديدة' : 'New Password'} 
      subtitle={language === 'ar' ? 'قم بتعيين كلمة مرور قوية جديدة' : 'Set a strong new password for your account'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label className="form-label">{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
          <input 
            type="password" 
            className="form-input" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label className="form-label">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
          <input 
            type="password" 
            className="form-input" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
        </div>

        <button className="btn-premium" disabled={loading} style={{ width: '100%' }}>
          {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password')}
        </button>
      </form>
    </AuthLayout>
  );
}
