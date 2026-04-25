// ============================================================
// CV-Mister — Payment Modal (V5 — Manual Only)
// Simple: Upload proof image → Send to backend + n8n → Admin approves
// ============================================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiUploadCloud, FiX, FiCheck, FiLock, FiAlertCircle, FiCopy, FiClock } from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../api/config';

export default function PaymentModal({ isOpen, onClose, templateName, amount = 3 }) {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [hasPending, setHasPending] = useState(false);

  const fileRef = useRef(null);
  const { token, user } = useAuthStore();

  const updateAuthUser = useCallback((updatedFields) => {
    useAuthStore.setState((state) => ({ user: { ...state.user, ...updatedFields } }));
  }, []);

  // ── Auto-close modal when user gets activated via real-time ──
  useEffect(() => {
    if (isOpen && user?.isPremium && user?.plan === 'pro') {
      setSuccess(true);
      // App.jsx already shows the toast, just close the modal
      setTimeout(() => handleClose(), 1500);
    }
  }, [isOpen, user?.isPremium, user?.plan]);

  // ── Check if user has a pending request ────────────────────
  useEffect(() => {
    if (!isOpen || !token) return;
    const checkStatus = async () => {
      try {
        const res = await axios.get(`${API_ROUTES.UPGRADE}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.request?.status === 'pending') {
          setHasPending(true);
        }
        if (res.data?.plan === 'pro') {
          updateAuthUser({ plan: 'pro' });
        }
      } catch (err) {
        console.error('[PaymentModal] Status check error:', err);
      }
    };
    checkStatus();
  }, [isOpen, token, updateAuthUser]);

  const handleCopy = () => {
    navigator.clipboard.writeText('00154578');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // ── Handle file selection ──────────────────────────────────
  const handleFile = useCallback((f) => {
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

    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  // ── Submit payment proof ───────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!file || !previewUrl) return;
    setUploading(true);
    setError('');

    try {
      // STEP 1: Save to MongoDB
      await axios.post(`${API_ROUTES.PAYMENTS}/create`, {
        proofImage: previewUrl,
        amount: Number(amount),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // STEP 2: Notify n8n (fire-and-forget)
      const formData = new FormData();
      formData.append('data', file);
      formData.append('userId', user?._id || user?.id || '');
      formData.append('userName', user?.fullName || '');
      formData.append('userEmail', user?.email || '');
      formData.append('action', 'new_manual_payment');

      const n8nUrl = 'https://ahmeddd111.app.n8n.cloud/webhook/dfa3be7f-785a-4472-95b8-b9c5fb5bdeeb';
      try {
        await axios.post(n8nUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 10000,
        });
      } catch (n8nErr) {
        console.warn('[n8n Notify Failed]', n8nErr);
      }

      setUploading(false);
      setSuccess(true);
      toast.success('تم إرسال طلبك بنجاح! سنقوم بتفعيل حسابك خلال دقائق 🎉');
    } catch (err) {
      console.error('[Payment Error]', err);
      setUploading(false);
      if (err.response?.status === 429) {
        setError(err.response.data?.error || 'لديك طلب معلق بالفعل. يرجى الانتظار.');
      } else {
        setError((err.response?.data?.error || 'حدث خطأ في إرسال الطلب.') + ' (LOCAL_DEBUG)');

      }
    }
  }, [file, previewUrl, token, user]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleClose = () => {
    setPreviewUrl(null);
    setFile(null);
    setSuccess(false);
    setError('');
    setUploading(false);
    setHasPending(false);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <style>{`
        @keyframes pmOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pmCardIn { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes pmSuccessPop { 0% { transform: scale(0); } 60% { transform: scale(1.15); } 100% { transform: scale(1); } }
        @keyframes pmSpinner { to { transform: rotate(360deg); } }
        .pm-upload-zone:hover { border-color: rgba(99, 102, 241, 0.5) !important; background: rgba(99, 102, 241, 0.03) !important; }
      `}</style>

      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
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
            width: '90%', maxWidth: '480px',
            background: '#ffffff', borderRadius: '20px',
            boxShadow: '0 32px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
            animation: 'pmCardIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden', position: 'relative',
            maxHeight: '90vh', overflowY: 'auto',
          }}
        >
          {/* Grid Background */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)`,
            backgroundSize: '24px 24px', pointerEvents: 'none', zIndex: 0,
          }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px 0', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
              }}>
                <FiLock size={20} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  ترقية إلى Pro
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
                  {templateName ? `لاستخدام قالب "${templateName}"` : 'لزيادة رصيد السير الذاتية'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                border: '1px solid #e2e8f0', background: '#fff', color: '#94a3b8',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
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

            {/* ── SUCCESS STATE ────────────────────────── */}
            {success ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  animation: 'pmSuccessPop 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                }}>
                  <FiCheck size={32} color="#fff" strokeWidth={3} />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#059669', margin: '0 0 8px' }}>
                  تم إرسال طلبك بنجاح! ✅
                </h4>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px', lineHeight: 1.7 }}>
                  سوف نقوم بمراجعة الحوالة وتفعيل حسابك خلال دقائق.
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 20px' }}>
                  سيتم إشعارك فوراً عند التفعيل 🔔
                </p>
                <button
                  onClick={handleClose}
                  style={{
                    display: 'block', width: '100%', padding: '14px', borderRadius: '14px',
                    border: 'none', background: '#10b981', color: '#fff',
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#10b981'; }}
                >
                  حسناً، سأنتظر التفعيل
                </button>
              </div>

            /* ── PENDING STATE ─────────────────────────── */
            ) : hasPending ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
                }}>
                  <FiClock size={32} color="#fff" />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#d97706', margin: '0 0 8px' }}>
                  طلبك قيد المراجعة ⏳
                </h4>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px', lineHeight: 1.7 }}>
                  لديك طلب تفعيل معلّق بالفعل. سنقوم بمراجعته وتفعيل حسابك خلال دقائق.
                </p>
                <button
                  onClick={handleClose}
                  style={{
                    display: 'block', width: '100%', padding: '14px', borderRadius: '14px',
                    border: 'none', background: '#f59e0b', color: '#fff',
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  حسناً
                </button>
              </div>

            /* ── UPLOAD FORM STATE ─────────────────────── */
            ) : (
              <>
                {/* Price Info */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #f0f9ff, #eff6ff)',
                  border: '1px solid #bfdbfe', marginBottom: '20px',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e40af' }}>خطة Pro — وصول كامل</div>
                    <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '2px' }}>جميع القوالب + ميزات متقدمة</div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#1e40af', letterSpacing: '-0.03em' }}>${amount}</div>
                </div>

                {/* Instructions */}
                <div style={{ marginBottom: '20px', fontSize: '13px', color: '#64748b', lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px', fontSize: '14px' }}>خطوات الترقية:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {['قم بتحويل المبلغ عبر الحوالة البنكية أو المحفظة الإلكترونية', 'التقط صورة واضحة لإيصال التحويل', 'ارفع الصورة أدناه وسنراجعها خلال دقائق'].map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: '#f1f5f9', border: '1px solid #e2e8f0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '10px', fontWeight: 700, color: '#6366f1', flexShrink: 0, marginTop: '1px',
                        }}>{i + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bank Info */}
                <div style={{
                  background: 'rgba(239, 246, 255, 0.5)', border: '1px solid #dbeafe',
                  borderRadius: '16px', padding: '16px', marginBottom: '20px', position: 'relative',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>
                    بنك التضامن - Tadhamon Bank
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                    اسم المستفيد: أحمد عبدالله عقلان الحمادي
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', letterSpacing: '1px' }}>00154578</span>
                    <button onClick={handleCopy} style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: 'transparent', border: 'none', color: '#3b82f6',
                      cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                    }}>
                      <FiCopy size={14} /> نسخ
                    </button>
                  </div>
                  {showToast && (
                    <div style={{
                      position: 'absolute', top: '24px', left: '16px',
                      background: '#10b981', color: '#fff', padding: '4px 12px', borderRadius: '20px',
                      fontSize: '11px', fontWeight: 600, boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                    }}>تم النسخ بنجاح</div>
                  )}
                </div>

                {/* Upload Zone */}
                <div
                  className="pm-upload-zone"
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: '100%', minHeight: previewUrl ? 'auto' : '180px',
                    borderRadius: '16px',
                    border: `2px dashed ${dragOver ? '#6366f1' : previewUrl ? '#10b981' : '#e2e8f0'}`,
                    background: dragOver ? 'rgba(99,102,241,0.04)' : previewUrl ? '#f0fdf4' : '#fafafa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: '10px', cursor: 'pointer',
                    transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                    marginBottom: '16px', boxSizing: 'border-box',
                  }}
                >
                  <input
                    ref={fileRef} type="file" accept="image/*"
                    onChange={(e) => handleFile(e.target.files[0])}
                    style={{ display: 'none' }}
                  />

                  {previewUrl ? (
                    <div style={{ padding: '12px', width: '100%', boxSizing: 'border-box' }}>
                      <img src={previewUrl} alt="إيصال الحوالة" style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: '10px' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', justifyContent: 'center', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                        <FiCheck size={14} />
                        {file?.name || 'تم اختيار الصورة'}
                        <span
                          onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setFile(null); }}
                          style={{ marginRight: '8px', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline', fontSize: '11px' }}
                        >إزالة</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiUploadCloud size={26} color="#94a3b8" />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>اسحب صورة الحوالة هنا</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>أو اضغط لاختيار ملف — PNG, JPG, WEBP (حتى 10MB)</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div style={{ padding: '14px 16px', borderRadius: '14px', background: '#fef2f2', border: '1px solid #fecaca', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>
                      <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!previewUrl || uploading}
                  style={{
                    width: '100%', padding: '15px', borderRadius: '14px', border: 'none',
                    background: (!previewUrl || uploading) ? '#e2e8f0' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: (!previewUrl || uploading) ? '#94a3b8' : '#fff',
                    fontSize: '15px', fontWeight: 800,
                    cursor: (!previewUrl || uploading) ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: previewUrl && !uploading ? '0 4px 20px rgba(99, 102, 241, 0.3)' : 'none',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {uploading ? (
                    <>
                      <div style={{
                        width: '18px', height: '18px',
                        border: '2.5px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff', borderRadius: '50%',
                        animation: 'pmSpinner 0.6s linear infinite',
                      }} />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <FiUploadCloud size={18} />
                      إرسال طلب الترقية
                    </>
                  )}
                </button>

                {/* Footer */}
                <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '14px', marginBottom: 0, lineHeight: 1.5 }}>
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
