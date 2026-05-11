import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/Layout/AuthLayout';
import useAuthStore from '../../store/useAuthStore';
import useStyleStore from '../../store/useStyleStore';
import toast from 'react-hot-toast';
import { Mail, Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { auth } from '../../config/firebase';

export default function Register() {
  const navigate = useNavigate();
  const language = useStyleStore((s) => s.language);
  const { register, loading } = useAuthStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  // Password rules
  const rules = {
    minLength: formData.password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(formData.password),
    matches: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0,
  };

  const passwordValid = rules.minLength && rules.hasLetter;
  const confirmValid = rules.matches;

  // ── Auto-Redirect Logic ────────────────────────────────────
  useEffect(() => {
    let interval;
    if (isSubmitted) {
      interval = setInterval(async () => {
        try {
          if (auth.currentUser) {
            await auth.currentUser.reload();
            if (auth.currentUser.emailVerified) {
              clearInterval(interval);
              const freshToken = await auth.currentUser.getIdToken(true);
              toast.success(language === 'ar' ? 'تم تفعيل الحساب بنجاح! جاري الدخول...' : 'Email verified! Redirecting...');
              useAuthStore.setState((state) => ({
                user: { ...state.user, emailVerified: true },
                token: freshToken
              }));
              setTimeout(() => navigate('/dashboard'), 1500);
            }
          }
        } catch (err) {
          console.error("[Register] Polling error:", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSubmitted, language, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordValid) {
      return toast.error(
        language === 'ar'
          ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل وتحتوي على حرف واحد'
          : 'Password must be at least 6 characters and contain a letter'
      );
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
    }

    const success = await register(formData.fullName, formData.email, formData.password);

    if (success) {
      setRegisteredEmail(formData.email);
      setIsSubmitted(true);
    } else {
      const storeError = useAuthStore.getState().error;

      // If Firebase account was created but backend sync failed (Network Error / server sleeping),
      // treat it as a partial success — show the email verification screen.
      const isNetworkError =
        !storeError ||
        storeError === 'Network Error' ||
        storeError?.toLowerCase?.().includes('network') ||
        storeError?.toLowerCase?.().includes('failed to fetch');

      const { auth: firebaseAuth } = await import('../../config/firebase');
      const currentUser = firebaseAuth.currentUser;

      if (isNetworkError && currentUser) {
        // Firebase account exists — backend sync is temporarily down, proceed to verification
        setRegisteredEmail(currentUser.email || formData.email);
        setIsSubmitted(true);
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

  // ── Success State UI ───────────────────────────────────────
  if (isSubmitted) {
    return (
      <AuthLayout
        title={language === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Verify Your Email'}
        subtitle={language === 'ar' ? `لقد أرسلنا بريداً إلكترونياً إلى ${registeredEmail}` : `We sent a verification link to ${registeredEmail}`}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: '80px', height: '80px', background: 'var(--accent-light)',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 24px'
          }}>
            <Mail size={40} color="var(--accent-color)" />
          </div>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
            {language === 'ar'
              ? 'يرجى الضغط على الرابط الموجود في الرسالة لتفعيل حسابك. سيتم تحويلك تلقائياً بعد التفعيل.'
              : 'Please click the link in the email to activate your account. You will be redirected automatically.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--accent-color)', fontWeight: 600, fontSize: '14px' }}>
            <Loader2 size={18} className="spin-icon" />
            <span>{language === 'ar' ? 'بانتظار التفعيل...' : 'Waiting for verification...'}</span>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="btn-premium"
            style={{ width: '100%', marginTop: '32px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
          >
            {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
          </button>
        </div>
      </AuthLayout>
    );
  }

  // ── Registration Form UI ───────────────────────────────────
  return (
    <AuthLayout
      title={language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
      subtitle={language === 'ar' ? 'انضم إلى آلاف المحترفين اليوم' : 'Join thousands of professionals today'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
        {/* Full Name */}
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

        {/* Email */}
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

        {/* Password */}
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
              minLength={6}
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

          {/* Password Rules — show when user has touched the field */}
          {(touched.password || formData.password.length > 0) && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <RuleItem ok={rules.minLength} label={language === 'ar' ? '6 أحرف على الأقل' : 'At least 6 characters'} />
              <RuleItem ok={rules.hasLetter} label={language === 'ar' ? 'يحتوي على حرف واحد على الأقل' : 'Contains at least one letter'} />
            </div>
          )}
        </div>

        {/* Confirm Password */}
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
