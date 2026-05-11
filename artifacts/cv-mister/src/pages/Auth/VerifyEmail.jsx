import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/Layout/AuthLayout';
import useAuthStore from '../../store/useAuthStore';
import useStyleStore from '../../store/useStyleStore';
import toast from 'react-hot-toast';
import { Mail, Loader2, RefreshCw } from 'lucide-react';
import { auth } from '../../config/firebase';
import axios from 'axios';
import { API_ROUTES } from '../../api/config';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const language = useStyleStore((s) => s.language);
  const [resending, setResending] = useState(false);

  const registeredEmail =
    location.state?.email ||
    auth.currentUser?.email ||
    '';

  useEffect(() => {
    let interval;

    interval = setInterval(async () => {
      try {
        if (!auth.currentUser) return;

        await auth.currentUser.reload();

        if (auth.currentUser.emailVerified) {
          clearInterval(interval);

          const freshToken = await auth.currentUser.getIdToken(true);

          let userData = null;
          try {
            const syncRes = await axios.post(`${API_ROUTES.AUTH}/sync`, {
              firebaseUID: auth.currentUser.uid,
              email: auth.currentUser.email,
              fullName: auth.currentUser.displayName || registeredEmail.split('@')[0],
            });
            userData = syncRes.data?.user || null;
          } catch {
            userData = {
              firebaseUID: auth.currentUser.uid,
              email: auth.currentUser.email,
              fullName: auth.currentUser.displayName || registeredEmail.split('@')[0],
              plan: 'free',
              emailVerified: true,
            };
          }

          useAuthStore.setState({
            user: { ...(userData || {}), emailVerified: true },
            token: freshToken,
          });

          toast.success(
            language === 'ar'
              ? '✅ تم تفعيل الحساب! جاري الدخول...'
              : '✅ Email verified! Redirecting...'
          );

          setTimeout(() => navigate('/dashboard'), 1200);
        }
      } catch (err) {
        console.error('[VerifyEmail] Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [language, navigate, registeredEmail]);

  const handleResend = async () => {
    setResending(true);
    try {
      const { sendEmailVerification } = await import('firebase/auth');
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        toast.success(
          language === 'ar'
            ? '📧 تم إعادة إرسال رابط التفعيل!'
            : '📧 Verification email resent!'
        );
      } else {
        toast.error(
          language === 'ar'
            ? 'لم يتم العثور على الجلسة. يرجى التسجيل من جديد.'
            : 'Session not found. Please register again.'
        );
      }
    } catch (err) {
      toast.error(
        language === 'ar'
          ? 'فشل إعادة الإرسال. حاول مرة أخرى.'
          : 'Failed to resend. Try again.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title={language === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
      subtitle={language === 'ar' ? 'خطوة أخيرة لتفعيل حسابك' : 'One last step to activate your account'}
    >
      <div style={{ textAlign: 'center', padding: '8px 0' }}>

        <div style={{
          width: '88px', height: '88px',
          background: 'linear-gradient(135deg, var(--accent-light, #ede9fe), #dbeafe)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 8px 24px rgba(99,102,241,0.15)',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          <Mail size={40} color="var(--accent-color, #6366f1)" strokeWidth={1.5} />
        </div>

        {registeredEmail && (
          <div style={{
            background: 'var(--bg-elevated, #f8fafc)',
            border: '1px solid var(--border-default, #e2e8f0)',
            borderRadius: '12px',
            padding: '12px 20px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--accent-color, #6366f1)',
            wordBreak: 'break-all',
          }}>
            {registeredEmail}
          </div>
        )}

        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: '1.7', fontSize: '14px' }}>
          {language === 'ar'
            ? 'لقد أرسلنا رابط التفعيل إلى بريدك الإلكتروني. افتح الرسالة واضغط على الرابط، وسيتم تحويلك للوحة التحكم تلقائياً.'
            : "We sent an activation link to your email. Open the message and click the link — you'll be redirected to your dashboard automatically."}
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '10px', color: 'var(--accent-color, #6366f1)',
          fontWeight: 600, fontSize: '13px',
          background: 'var(--accent-light, #ede9fe)',
          borderRadius: '10px', padding: '12px 20px',
          marginBottom: '24px',
        }}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          <span>{language === 'ar' ? 'بانتظار التفعيل تلقائياً...' : 'Waiting for verification automatically...'}</span>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)', marginBottom: '16px' }}>
          {language === 'ar' ? 'لم تجد الرسالة؟ تحقق من مجلد Spam' : "Didn't receive it? Check your Spam folder"}
        </p>

        <button
          onClick={handleResend}
          disabled={resending}
          className="btn-premium"
          style={{
            width: '100%',
            marginBottom: '12px',
            background: 'var(--accent-color, #6366f1)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          {resending
            ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            : <RefreshCw size={16} />}
          {language === 'ar' ? 'إعادة إرسال رابط التفعيل' : 'Resend Verification Email'}
        </button>

        <button
          onClick={() => navigate('/login')}
          className="btn-premium"
          style={{
            width: '100%',
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
          }}
        >
          {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 24px rgba(99,102,241,0.15); }
          50% { transform: scale(1.05); box-shadow: 0 12px 32px rgba(99,102,241,0.25); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AuthLayout>
  );
}
