import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/Layout/AuthLayout';
import useAuthStore from '../../store/useAuthStore';
import useStyleStore from '../../store/useStyleStore';
import toast from 'react-hot-toast';
import { Mail, Loader2 } from 'lucide-react';
import { auth } from '../../config/firebase';

export default function Register() {
  const navigate = useNavigate();
  const language = useStyleStore((s) => s.language);
  const { register, loading } = useAuthStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // ── Auto-Redirect Logic ────────────────────────────────────
  useEffect(() => {
    let interval;
    if (isSubmitted) {
      console.log("[Register] Polling started for email verification...");
      interval = setInterval(async () => {
        try {
          if (auth.currentUser) {
            await auth.currentUser.reload();
            console.log("[Register] User status reloaded. Verified:", auth.currentUser.emailVerified);
            
            if (auth.currentUser.emailVerified) {
              clearInterval(interval);
              console.log("[Register] ✅ Email verified! Refreshing token...");
              
              // Force refresh token so it contains email_verified=true
              const freshToken = await auth.currentUser.getIdToken(true);
              
              toast.success(language === 'ar' ? 'تم تفعيل الحساب بنجاح! جاري الدخول...' : 'Email verified! Redirecting...');
              
              // Update store with verified status and fresh token
              useAuthStore.setState((state) => ({
                user: { ...state.user, emailVerified: true },
                token: freshToken
              }));

              setTimeout(() => navigate('/dashboard'), 1500);
            }
          } else {
            console.warn("[Register] No active Firebase user found during polling.");
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
    if (formData.password !== formData.confirmPassword) {
      return toast.error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
    }
    
    console.log("[Register] Starting registration process...");
    const success = await register(formData.fullName, formData.email, formData.password);
    
    if (success) {
      console.log("[Register] Registration successful, showing success screen.");
      setRegisteredEmail(formData.email);
      setIsSubmitted(true);
    } else {
      console.error("[Register] Registration failed.");
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إنشاء الحساب' : 'Registration failed');
    }
  };

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
        <div>
          <label className="form-label">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
          <input 
            type="text" 
            className="form-input" 
            value={formData.fullName} 
            onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
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
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="form-label">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
          <input 
            type="password" 
            className="form-input" 
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="form-label">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
          <input 
            type="password" 
            className="form-input" 
            value={formData.confirmPassword} 
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
            required 
          />
        </div>

        <button className="btn-premium" disabled={loading} style={{ width: '100%', marginTop: '12px' }}>
          {loading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : (language === 'ar' ? 'إنشاء حساب' : 'Sign Up')}
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '16px' }}>
          {language === 'ar' ? 'لديك حساب بالفعل؟' : "Already have an account?"} {' '}
          <Link to="/login" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>
            {language === 'ar' ? 'دخول' : 'Sign In'}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
