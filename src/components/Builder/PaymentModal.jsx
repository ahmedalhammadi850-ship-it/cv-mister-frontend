// ============================================================
// CV-Mister — Premium Payment Modal (V4 — Rate-Limited)
// Clean white grid background, hawala proof upload
// Cooldown: 10min per rejection, 24h lockout after 3 fails
// ============================================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiUploadCloud, FiX, FiCheck, FiLock, FiImage, FiAlertCircle, FiClock, FiCopy, FiShield, FiAlertTriangle } from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore';
import useResumeStore from '../../store/useResumeStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';
import Tesseract from 'tesseract.js';

export default function PaymentModal({ isOpen, onClose, templateName }) {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [verifyStatus, setVerifyStatus] = useState('جاري تحليل الصورة...');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  // OCR states
  const [ocrAnalyzing, setOcrAnalyzing] = useState(false);
  const [ocrValid, setOcrValid] = useState(false);

  const fileRef = useRef(null);
  const { token, user } = useAuthStore();

  // ── Rate Limit State ────────────────────────────────────────
  const [rateLimit, setRateLimit] = useState(null);       // { blocked, isLockout, message, remainMs, failedAttempts, maxAttempts }
  const [cooldownRemain, setCooldownRemain] = useState(0); // seconds remaining
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusChecked, setStatusChecked] = useState(false);


  const updateAuthUser = useCallback((updatedFields) => {
    useAuthStore.setState((state) => ({ user: { ...state.user, ...updatedFields } }));
  }, []);

  // ── Real-time Socket.IO ───────────────────────────────────
  useSocket({
    room: user?._id || user?.id, // User's unique room
    events: {
      'my-plan-updated': (event) => {
        console.log('[RT] 🔔 My Plan Updated:', event.data);
        if (event.data.plan === 'pro') {
          setVerifyProgress(100);
          updateAuthUser({ plan: 'pro', isPremium: true });
          setSuccess(true);
          setVerifying(false);
          toast.success('تم تفعيل حسابك بنجاح بواسطة الإدارة! 🎉', {
            duration: 5000,
            icon: '⚡',
            style: { background: '#1e293b', color: '#10b981', border: '1px solid rgba(16,211,153,0.3)' },
          });
          setTimeout(() => handleClose(), 3000);
        } else if (event.data.status === 'rejected') {
          setVerifying(false);
          setVerifyProgress(0);
          setRejectionReason(event.data.rejectionReason || 'تم رفض النقل من قبل الإدارة');
          toast.error(`تم رفض الطلب: ${event.data.rejectionReason}`, {
            duration: 6000,
            style: { background: '#1e293b', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' },
          });
        }
      },
    },
  });

  // ── Fetch upgrade status (rate limit info) on open ──────────
  useEffect(() => {
    if (!isOpen || !token) return;
    setStatusChecked(false);

    const checkStatus = async () => {
      try {
        const res = await axios.get('/api/upgrade/status', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        // If last request was rejected, show rejection reason
        if (data.request?.status === 'rejected' && data.request?.rejectionReason) {
          setRejectionReason(data.request.rejectionReason);
        } else {
          setRejectionReason('');
        }

        // Set rate limit info
        if (data.rateLimit) {
          setRateLimit(data.rateLimit);
          if (data.rateLimit.blocked && data.rateLimit.remainMs > 0) {
            setCooldownRemain(Math.ceil(data.rateLimit.remainMs / 1000));
          }
        }

        // If already pro
        if (data.plan === 'pro') {
          updateAuthUser({ plan: 'pro' });
          setSuccess(true);
        }

        // If there's a pending request, resume verifying
        if (data.request?.status === 'pending') {
          setVerifying(true);
        }
      } catch (err) {
        console.error('[PaymentModal] Status check error:', err);
      } finally {
        setStatusChecked(true);
      }
    };

    checkStatus();
  }, [isOpen, token, updateAuthUser]);

  // ── Countdown Timer ─────────────────────────────────────────
  useEffect(() => {
    if (cooldownRemain <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemain((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Reset rate limit when cooldown expires
          setRateLimit((rl) => (rl ? { ...rl, blocked: false } : null));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemain]);

  // ── Polling & Progress Effect — Check for n8n approval/rejection ──────
  useEffect(() => {
    let intervalId;
    let progressId;

    if (verifying && !success) {
      // Rotate messages
      const messages = [
        'جاري تحليل الصورة بواسطة الذكاء الاصطناعي...',
        'جاري استخراج بيانات التحويل...',
        'جاري المطابقة مع قواعد البيانات...',
        'جاري التحقق من صحة الحوالة...',
        'تقريباً انتهينا...',
      ];
      let msgIdx = 0;

      progressId = setInterval(() => {
        setVerifyProgress(prev => {
          if (prev >= 98) return prev;
          const next = prev + (prev > 90 ? 0.5 : 2);
          
          // Update message based on progress
          const mIdx = Math.min(Math.floor(next / 20), messages.length - 1);
          if (mIdx !== msgIdx) {
            setVerifyStatus(messages[mIdx]);
            msgIdx = mIdx;
          }
          return next;
        });
      }, 200);

      intervalId = setInterval(async () => {
        try {
          const res = await axios.get('/api/upgrade/status', {
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = res.data;
          const plan = data.plan;
          const reqStatus = data.request?.status;

          if (plan === 'pro') {
            setVerifyProgress(100);
            updateAuthUser({ plan: 'pro', isPremium: true });
            setSuccess(true);
            setVerifying(false);
            clearInterval(intervalId);
            clearInterval(progressId);
            toast.success('تم تفعيل حسابك بنجاح! 🎉', {
              style: {
                background: '#1e293b', color: '#f1f5f9',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                borderRadius: '12px', fontFamily: "'Cairo', sans-serif",
                fontSize: '13px', fontWeight: 600,
              },
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            });
            setTimeout(() => handleClose(), 3000);
          } else if (reqStatus === 'rejected') {
            setVerifying(false);
            clearInterval(intervalId);
            clearInterval(progressId);
            setVerifyProgress(0);
            const reason = data.request?.rejectionReason || 'الصورة غير واضحة أو البيانات لا تتطابق';
            setRejectionReason(reason);

            if (data.rateLimit) {
              setRateLimit(data.rateLimit);
              if (data.rateLimit.remainMs > 0) {
                setCooldownRemain(Math.ceil(data.rateLimit.remainMs / 1000));
              }
            }

            toast.error(`تم رفض الطلب: ${reason}`, {
              duration: 6000,
              style: {
                background: '#1e293b', color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px', fontFamily: "'Cairo', sans-serif",
                fontSize: '13px', fontWeight: 600,
              },
            });
          }
        } catch (err) {
          console.error('Polling error', err);
        }
      }, 3000);
    } else {
      setVerifyProgress(0);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (progressId) clearInterval(progressId);
    };
  }, [verifying, success, token, updateAuthUser]);

  const handleCopy = () => {
    navigator.clipboard.writeText('00154578');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const isAdminBypass = user?.username === 'ahmedyes' || user?.email?.includes('ahmedyes') || user?.plan === 'pro';

  // ── Auto-Submit Logic ────────────────────────────────────
  const performSubmit = useCallback(async (fileObj, fileDataUrl) => {
    setUploading(true);
    setVerifyProgress(15);
    setVerifyStatus('تم التحقق من الحساب، جاري المعالجة...');

    try {
      // STEP 1: Save payment record to MongoDB (status: pending)
      await axios.post('/api/payments/create', {
        proofImage: fileDataUrl,
        amount: 25,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setVerifyProgress(30);

      // STEP 2: Send FormData to n8n Webhook (image as 'data')
      const formData = new FormData();
      formData.append('data', fileObj);
      formData.append('userId', user?._id || user?.id || '');
      formData.append('userName', user?.fullName || '');
      formData.append('action', 'verify_payment_and_improve_cv');

      // Attach current resume text for AI enhancement
      const resumeData = useResumeStore.getState().data;
      formData.append('text', JSON.stringify(resumeData || ''));

      const n8nUrl = 'https://ahmeddd111.app.n8n.cloud/webhook/dfa3be7f-785a-4472-95b8-b9c5fb5bdeeb';

      const n8nResponse = await axios.post(n8nUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, 
      });

      const result = n8nResponse.data;
      console.log('[n8n Response]', result);

      // STEP 3: Handle n8n result
      const isFalse = result === 'FALSE' || result === false ||
        (typeof result === 'string' && result.trim().toUpperCase() === 'FALSE');

      if (isFalse) {
        setVerifying(false);
        setVerifyProgress(0);
        setUploading(false);
        const failReason = 'بيانات الحوالة غير مطابقة. لم يتم العثور على بيانات دفع صحيحة.';
        setError(failReason);

        try {
          const rejectRes = await axios.post('/api/payments/update-status', {
            status: 'rejected',
            reason: failReason,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (rejectRes.data?.rateLimit) {
            setRateLimit(rejectRes.data.rateLimit);
            if (rejectRes.data.rateLimit.blocked && rejectRes.data.rateLimit.remainMs > 0) {
              setCooldownRemain(Math.ceil(rejectRes.data.rateLimit.remainMs / 1000));
            }
          }
        } catch (rejectErr) {}

        toast.error(`تم رفض الطلب: ${failReason}`);
      } else {
        setVerifyProgress(90);
        setVerifyStatus('تم التأكد بنجاح! جاري التفعيل...');

        await axios.post('/api/payments/update-status', {
          status: 'approved',
          activatedBy: 'AI Agent (n8n)'
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setVerifyProgress(100);
        setUploading(false);
        updateAuthUser({ plan: 'pro', paymentStatus: 'approved' });

        if (typeof result === 'string' && result.length > 10) {
          try {
            const parsed = JSON.parse(result);
            useResumeStore.getState().setData(parsed);
          } catch {
            useResumeStore.getState().setSummary(result);
          }
        }

        setSuccess(true);
        setVerifying(false);

        toast.success('تم تفعيل حسابك بنجاح! مرحباً بك في Pro 🎉');
        setTimeout(() => handleClose(), 3000);
      }
    } catch (err) {
      console.error('[Payment Flow Error]', err);
      setVerifying(false);

      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('انتهت مهلة الاتصال بالمحرك الذكي (30 ثانية). يرجى المحاولة لاحقاً.');
      } else if (err.response?.status === 429) {
        const errData = err.response.data;
        setRateLimit({
          blocked: true,
          message: errData.error || 'أنت محظور مؤقتاً',
          remainMs: errData.remainMs || 0,
        });
        if (errData.remainMs > 0) {
          setCooldownRemain(Math.ceil(errData.remainMs / 1000));
        }
        setError(errData.error || 'أنت محظور مؤقتاً من إرسال طلبات جديدة.');
      } else {
        setError(err.response?.data?.error || 'حدث خطأ في معالجة الطلب. يرجى المحاولة لاحقاً.');
      }
    } finally {
      setUploading(false);
    }
  }, [token, user, updateAuthUser]);

  const handleFile = useCallback(async (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('يرجى رفع صورة فقط (PNG, JPG, WEBP)');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('حجم الصورة يجب ألا يتجاوز 10MB');
      return;
    }
    
    setError('');
    setFile(f);
    setOcrValid(false);
    
    const reader = new FileReader();
    const resultUrl = await new Promise(r => {
      reader.onload = e => r(e.target.result);
      reader.readAsDataURL(f);
    });
    setPreviewUrl(resultUrl);

    if (rateLimit?.blocked && !isAdminBypass) {
      toast.error(rateLimit.message);
      return;
    }

    if (isAdminBypass) {
      // ── Remote Control Bypass ───────────────────────
      // If manually activated in DB or admin, skip OCR and auto-submit
      setVerifying(true);
      performSubmit(f, resultUrl);
      return;
    }

    // ── Smart Gate OCR Validation ────────────────────────────────
    setOcrAnalyzing(true);
    let isMatch = false;

    try {
      const result = await Tesseract.recognize(f, 'ara+eng');
      const text = result.data.text;
      const cleanedText = text.replace(/\s+/g, '');
      
      const hasNumber = text.includes('00154578');
      const nameParts = ['أحمد', 'احمد', 'عبدالله', 'عقلان', 'الحمادي'];
      const hasName = nameParts.some(part => cleanedText.includes(part));

      if (hasNumber && hasName) {
        isMatch = true;
      } else {
        // FAIL: Stop completely. Don't send any data.
        setError('عذراً، الإيصال غير مطابق لبيانات الحساب المعتمد');
        setFile(null);
        setPreviewUrl(null);
      }
    } catch (err) {
      setError('حدث خطأ أثناء الفحص الذكي. الإيصال غير مطابق لبيانات الحساب المعتمد');
      setFile(null);
      setPreviewUrl(null);
    } finally {
      setOcrAnalyzing(false);
    }

    if (isMatch) {
      // SUCCESS: Instantly hide pay UI, show processing, and auto-submit to n8n
      setOcrValid(true);
      setVerifying(true);
      performSubmit(f, resultUrl);
    }
  }, [rateLimit, isAdminBypass, performSubmit]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  }, [handleFile]);

  const handleClose = () => {
    setPreviewUrl(null);
    setFile(null);
    setSuccess(false);
    setVerifying(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  // ── Helper: Format countdown ────────────────────────────────
  const formatCountdown = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const isBlocked = !isAdminBypass && (rateLimit?.blocked && cooldownRemain > 0);
  const isLockedOut = !isAdminBypass && rateLimit?.isLockout;
  const failedAttempts = isAdminBypass ? 0 : (rateLimit?.failedAttempts || 0);

  return createPortal(
    <>
      <style>{`
        @keyframes pmOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pmCardIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pmSuccessPop {
          0% { transform: scale(0); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes pmSpinner {
          to { transform: rotate(360deg); }
        }
        @keyframes pmPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .pm-upload-zone:hover {
          border-color: rgba(99, 102, 241, 0.5) !important;
          background: rgba(99, 102, 241, 0.03) !important;
        }
      `}</style>

      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'pmOverlayIn 0.2s ease-out',
          fontFamily: "'IBM Plex Sans Arabic', 'Cairo', 'Inter', sans-serif",
          direction: 'rtl',
        }}
      >
        {/* Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '90%',
            maxWidth: '480px',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 32px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
            animation: 'pmCardIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* Grid Background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 28px 0',
            position: 'relative',
            zIndex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
              }}>
                <FiLock size={20} color="#fff" />
              </div>
              <div>
                <h3 style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}>
                  ترقية إلى Pro
                </h3>
                <p style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  margin: '2px 0 0',
                  fontWeight: 500,
                }}>
                  {`لاستخدام قالب "${templateName}"`}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#475569'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '24px 28px 28px', position: 'relative', zIndex: 1 }}>

            {verifying || success ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: success ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  animation: success ? 'pmSuccessPop 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'pmOverlayIn 0.3s ease-out',
                  boxShadow: success ? '0 8px 24px rgba(16, 185, 129, 0.3)' : '0 8px 24px rgba(99, 102, 241, 0.3)',
                }}>
                  {success ? (
                    <FiCheck size={32} color="#fff" strokeWidth={3} />
                  ) : (
                    <FiClock size={32} color="#fff" />
                  )}
                </div>
                <h4 style={{
                  fontSize: '18px', fontWeight: 800,
                  color: success ? '#059669' : '#0f172a',
                  margin: '0 0 8px',
                }}>
                  {success ? 'تم تفعيل حسابك بنجاح! 🎉' : verifyStatus}
                </h4>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px', lineHeight: 1.6 }}>
                  {success ? 'تم فتح جميع القوالب وميزات الـ AI.' : 'قد تستغرق هذه العملية حوالي (10 ثوانٍ) كحد أقصى'}
                </p>

                {verifying && !success && (
                  <div style={{ marginTop: '24px', padding: '0 20px' }}>
                    {/* Progress Track */}
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: '#f1f5f9',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${verifyProgress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                        borderRadius: '10px',
                        transition: 'width 0.3s ease-out',
                        boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
                      }} />
                    </div>
                    {/* Progress Text */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      marginTop: '8px', fontSize: '11px', fontWeight: 700, color: '#94a3b8'
                    }}>
                      <span>{Math.round(verifyProgress)}%</span>
                      <span>معالجة ذكية...</span>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      justifyContent: 'center', marginTop: '16px',
                      color: '#6366f1', fontSize: '12px', fontWeight: 600
                    }}>
                      <div style={{
                        width: '12px', height: '12px',
                        border: '2px solid rgba(99,102,241,0.2)',
                        borderTopColor: '#6366f1',
                        borderRadius: '50%',
                        animation: 'pmSpinner 1s linear infinite',
                      }} />
                      جاري الاتصال بالسيرفر...
                    </div>
                  </div>
                )}
                {success && (
                  <button
                    onClick={handleClose}
                    style={{
                      display: 'block', width: '100%', padding: '14px', borderRadius: '14px',
                      border: 'none', background: '#10b981', color: '#fff',
                      fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                      marginTop: '24px', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#10b981'; }}
                  >
                    البدء باستخدام Pro
                  </button>
                )}
              </div>

            /* ── DEFAULT STATE (Upload Form) ─────────────────── */
            ) : (
              <>
                {/* ── Rejection Banner (if previous request was rejected) ─── */}
                {rejectionReason && (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '16px', borderRadius: '16px',
                    background: '#fef2f2', border: '1px solid #fecaca',
                    marginBottom: '16px',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.05)',
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '10px',
                      background: '#fee2e2', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                    }}>
                      <FiAlertTriangle size={18} color="#dc2626" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#991b1b', marginBottom: '4px' }}>
                        {failedAttempts >= 2 ? 'عذراً، الصورة غير واضحة' : 'تم رفض طلبك السابق'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#b91c1c', lineHeight: 1.6, fontWeight: 500 }}>
                        {failedAttempts >= 2 
                          ? 'يرجى محاولة التصوير في إضاءة جيدة، أو أرسلها للمراجعة اليدوية وسنفعلها لك خلال دقائق'
                          : `السبب: ${rejectionReason}`
                        }
                      </div>
                      
                      {failedAttempts >= 2 && (
                        <button
                          onClick={handleManualReview}
                          disabled={submittingManual}
                          style={{
                            marginTop: '12px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: '#dc2626',
                            color: '#fff',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#dc2626'}
                        >
                          {submittingManual ? 'جاري الإرسال...' : 'إرسال للمراجعة اليدوية'}
                          <FiShield size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Cooldown Banner (10 min between rejections) ─── */}
                {isBlocked && !isLockedOut && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '14px 16px', borderRadius: '14px',
                    background: '#fffbeb', border: '1px solid #fed7aa',
                    marginBottom: '16px',
                  }}>
                    <FiClock size={18} color="#d97706" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400e', marginBottom: '2px' }}>
                        يرجى الانتظار قبل المحاولة مجدداً
                      </div>
                      <div style={{ fontSize: '12px', color: '#b45309', lineHeight: 1.5 }}>
                        يمكنك إرسال طلب جديد بعد {formatCountdown(cooldownRemain)}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '16px', fontWeight: 800, color: '#d97706',
                      fontFeatureSettings: '"tnum"', animation: 'pmPulse 2s ease-in-out infinite',
                    }}>
                      {formatCountdown(cooldownRemain)}
                    </div>
                  </div>
                )}

                {/* ── Failed Attempts Warning ──────────────────────── */}
                {failedAttempts > 0 && failedAttempts < 3 && !isBlocked && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 14px', borderRadius: '10px',
                    background: '#fff7ed', border: '1px solid #fed7aa',
                    marginBottom: '16px', fontSize: '12px', fontWeight: 600, color: '#c2410c',
                  }}>
                    <FiAlertCircle size={14} />
                    تحذير: لديك {failedAttempts} من {rateLimit?.maxAttempts || 3} محاولات فاشلة. بعد {(rateLimit?.maxAttempts || 3) - failedAttempts} محاولة إضافية سيتم تطبيق حظر مؤقت لمدة 10 دقائق.
                  </div>
                )}

                {/* Price Info Card */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #f0f9ff, #eff6ff)',
                  border: '1px solid #bfdbfe',
                  marginBottom: '20px',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e40af' }}>
                      خطة Pro — وصول كامل
                    </div>
                    <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '2px' }}>
                      جميع القوالب + ميزات متقدمة
                    </div>
                  </div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#1e40af',
                    letterSpacing: '-0.03em',
                  }}>
                    $25
                  </div>
                </div>

                {/* Instructions */}
                <div style={{
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#64748b',
                  lineHeight: 1.7,
                }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px', fontSize: '14px' }}>
                    خطوات الترقية:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      'قم بتحويل المبلغ عبر الحوالة البنكية أو المحفظة الإلكترونية',
                      'التقط صورة واضحة لإيصال التحويل',
                      'ارفع الصورة أدناه وسنراجعها خلال ساعات',
                    ].map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: '#f1f5f9', border: '1px solid #e2e8f0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '10px', fontWeight: 700, color: '#6366f1',
                          flexShrink: 0, marginTop: '1px',
                        }}>
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bank Account Info */}
                <div style={{
                  background: 'rgba(239, 246, 255, 0.5)',
                  border: '1px solid #dbeafe',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '20px',
                  position: 'relative',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>
                    بنك التضامن - Tadhamon Bank
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                    اسم المستفيد: أحمد عبدالله عقلان الحمادي
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', letterSpacing: '1px' }}>00154578</span>
                    <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                      <FiCopy size={14} />
                      نسخ
                    </button>
                  </div>
                  {showToast && (
                    <div style={{
                      position: 'absolute', top: '24px', left: '16px',
                      background: '#10b981', color: '#fff', padding: '4px 12px', borderRadius: '20px',
                      fontSize: '11px', fontWeight: 600, boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                      animation: 'pmOverlayIn 0.2s ease-out'
                    }}>
                      تم النسخ بنجاح
                    </div>
                  )}
                </div>

                {/* Upload Zone */}
                <div
                  className="pm-upload-zone"
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => !isBlocked && fileRef.current?.click()}
                  style={{
                    width: '100%',
                    minHeight: previewUrl ? 'auto' : '180px',
                    borderRadius: '16px',
                    border: `2px dashed ${dragOver ? '#6366f1' : previewUrl ? '#10b981' : isBlocked ? '#e5e7eb' : '#e2e8f0'}`,
                    background: dragOver ? 'rgba(99,102,241,0.04)' : previewUrl ? '#f0fdf4' : isBlocked ? '#f9fafb' : '#fafafa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '10px',
                    cursor: isBlocked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    boxSizing: 'border-box',
                    opacity: isBlocked ? 0.5 : 1,
                    pointerEvents: isBlocked ? 'none' : 'auto',
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFile(e.target.files[0])}
                    style={{ display: 'none' }}
                    disabled={isBlocked}
                  />

                  {previewUrl ? (
                    <div style={{ padding: '12px', width: '100%', boxSizing: 'border-box' }}>
                      <img
                        src={previewUrl}
                        alt="إيصال الحوالة"
                        style={{
                          width: '100%',
                          maxHeight: '220px',
                          objectFit: 'contain',
                          borderRadius: '10px',
                        }}
                      />
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '10px',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#059669',
                        fontWeight: 600,
                      }}>
                        <FiCheck size={14} />
                        {file?.name || 'تم اختيار الصورة'}
                        <span
                          onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setFile(null); }}
                          style={{
                            marginRight: '8px',
                            color: '#ef4444',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: '11px',
                          }}
                        >
                          إزالة
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <FiUploadCloud size={26} color="#94a3b8" />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                          اسحب صورة الحوالة هنا
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                          أو اضغط لاختيار ملف — PNG, JPG, WEBP (حتى 10MB)
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Error Message with Retry */}
                {error && (
                  <div style={{
                    padding: '14px 16px', borderRadius: '14px',
                    background: '#fef2f2', border: '1px solid #fecaca',
                    marginBottom: '16px',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      color: '#dc2626', fontSize: '13px', fontWeight: 600,
                      marginBottom: '10px',
                    }}>
                      <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{error}</span>
                    </div>
                    {!isBlocked && (
                      <button
                        onClick={() => {
                          setError('');
                          setRejectionReason('');
                          setVerifying(false);
                          setUploading(false);
                          setVerifyProgress(0);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          border: '1px solid #fecaca',
                          background: '#fff',
                          color: '#dc2626',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                      >
                        🔄 إعادة المحاولة
                      </button>
                    )}
                  </div>
                )}

                {/* Autonomous Submission (Button kept for visual UI state only) */}
                <button
                  onClick={() => {}}
                  disabled={true}
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '14px',
                    border: 'none',
                    background: (!previewUrl || isBlocked || ocrAnalyzing || !ocrValid) ? '#e2e8f0' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: (!previewUrl || isBlocked || ocrAnalyzing || !ocrValid) ? '#94a3b8' : '#fff',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: (!previewUrl || uploading || isBlocked || ocrAnalyzing || !ocrValid) ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: (previewUrl && !isBlocked && ocrValid) ? '0 4px 20px rgba(99, 102, 241, 0.3)' : 'none',
                    opacity: uploading ? 0.8 : 1,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {uploading ? (
                    <>
                      <div style={{
                        width: '18px', height: '18px',
                        border: '2.5px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'pmSpinner 0.6s linear infinite',
                      }} />
                      جاري الإرسال للمراجعة...
                    </>
                  ) : ocrAnalyzing ? (
                    <>
                      <div style={{
                        width: '18px', height: '18px',
                        border: '2.5px solid rgba(148, 163, 184, 0.3)',
                        borderTopColor: '#64748b',
                        borderRadius: '50%',
                        animation: 'pmSpinner 0.6s linear infinite',
                      }} />
                      فحص سريع للبيانات...
                    </>
                  ) : isBlocked ? (
                    <>
                      <FiClock size={18} />
                      انتظر {formatCountdown(cooldownRemain)}
                    </>
                  ) : (
                    <>
                      <FiUploadCloud size={18} />
                      إرسال طلب الترقية
                    </>
                  )}
                </button>

                {/* Footer Note */}
                <p style={{
                  textAlign: 'center',
                  fontSize: '11px',
                  color: '#94a3b8',
                  marginTop: '14px',
                  marginBottom: 0,
                  lineHeight: 1.5,
                }}>
                  🔒 بياناتك محمية ومشفرة بالكامل
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
