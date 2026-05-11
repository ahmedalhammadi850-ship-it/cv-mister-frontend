import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/Layout/AuthLayout';
import useAuthStore from '../../store/useAuthStore';
import useStyleStore from '../../store/useStyleStore';
import toast from 'react-hot-toast';
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

const SESSION_KEY = 'cv_register_draft';

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveDraft(data) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {}
}

function clearDraft() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

export default function Register() {
  const navigate = useNavigate();
  const language = useStyleStore((s) => s.language);
  const { register, loading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const draft = loadDraft();
  const [formData, setFormData] = useState({
    fullName: draft?.fullName || '',
    email: draft?.email || '',
    password: draft?.password || '',
    confirmPassword: draft?.confirmPassword || '',
  });

  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    saveDraft(formData);
  }, [formData]);

  const rules = {
    minLength: formData.password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(formData.password),
    matches: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0,
  };

  const passwordValid = rules.minLength && rules.hasLetter;
  const confirmValid = rules.matches;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordValid) {
      return toast.error(
        language === 'ar'
          ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف واحد'
          : 'Password must be at least 8 characters and contain a letter'
      );
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
    }

    const success = await register(formData.fullName, formData.email, formData.password);

    if (success) {
      clearDraft();
      navigate('/verify-email', { state: { email: formData.email, password: formData.password }, replace: true });
    } else {
      const storeError = useAuthStore.getState().error;

      const isNetworkError =
        !storeError ||
        storeError === 'Network Error' ||
        storeError?.toLowerCase?.().includes('network') ||
        storeError?.toLowerCase?.().includes('failed to fetch');

      const { auth: firebaseAuth } = await import('../../config/firebase');
      const currentUser = firebaseAuth.currentUser;

      if (isNetworkError && currentUser) {
        clearDraft();
        navigate('/verify-email', { state: { email: currentUser.email || formData.email }, replace: true });
      } else if (storeError?.includes('مسجل بالفعل') || storeError?.includes('already-in-use')) {
        toast.error(language === 'ar'
          ? 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.'
          : 'This email is already registered. Please sign in.');
      } else {
        toast.error(storeError || (language === 'ar' ? 'حدث خطأ أثناء إنشاء الحساب' : 'Registration failed'));
      }
    }
  };

  const RuleItem = ({ ok, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: ok ? '#10b981' : '#94a3b8' }}>
      {ok ? <CheckCircle size={13} /> : <XCircle size={13} />}
      <span>{label}</span>
    </div>
  );

  return (
    <AuthLayout
      title={language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
      subtitle={language === 'ar' ? 'انضم إلى آلاف المحترفين اليوم' : 'Join thousands of professionals today'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label className="form-label">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
          <input
            type="text"
            className="form-input"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            placeholder={language === 'ar' ? 'أحمد محمد' : 'John Doe'}
          />
        </div>

        <div>
          <label className="form-label">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
          <input
            type="email"
            className="form-input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="form-label">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
              required
              minLength={8}
              autoComplete="new-password"
              style={{ paddingInlineEnd: '44px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute', top: '50%', insetInlineEnd: '14px',
                transform: 'translateY(-50%)', background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {(touched.password || formData.password.length > 0) && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <RuleItem ok={rules.minLength} label={language === 'ar' ? '8 أحرف على الأقل' : 'At least 8 characters'} />
              <RuleItem ok={rules.hasLetter} label={language === 'ar' ? 'يحتوي على حرف واحد على الأقل' : 'Contains at least one letter'} />
            </div>
          )}
        </div>

        <div>
          <label className="form-label">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              className="form-input"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              onBlur={() => setTouched(t => ({ ...t, confirmPassword: true }))}
              required
              autoComplete="new-password"
              style={{
                paddingInlineEnd: '44px',
                borderColor: touched.confirmPassword && formData.confirmPassword
                  ? (confirmValid ? '#10b981' : '#ef4444')
                  : undefined
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              style={{
                position: 'absolute', top: '50%', insetInlineEnd: '14px',
                transform: 'translateY(-50%)', background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center'
              }}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {touched.confirmPassword && formData.confirmPassword && (
            <div style={{ marginTop: '6px' }}>
              <RuleItem
                ok={confirmValid}
                label={language === 'ar'
                  ? (confirmValid ? 'كلمتا المرور متطابقتان' : 'كلمتا المرور غير متطابقتين')
                  : (confirmValid ? 'Passwords match' : 'Passwords do not match')
                }
              />
            </div>
          )}
        </div>

        <button
          className="btn-premium"
          disabled={loading}
          style={{ width: '100%', marginTop: '12px' }}
        >
          {loading
            ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...')
            : (language === 'ar' ? 'إنشاء حساب' : 'Sign Up')}
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '16px' }}>
          {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
          <Link to="/login" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>
            {language === 'ar' ? 'دخول' : 'Sign In'}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
