// ============================================================
// CV-Mister — Payment Verification Table (V3 — Live Backend)
// Fetches real upgrade requests from /api/upgrade/admin/all
// Approve/reject with real API calls that update user plan
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  FiCheck, FiX, FiImage, FiClock, FiCheckCircle,
  FiXCircle, FiFilter, FiSearch, FiEye, FiDownload,
  FiRefreshCw, FiAlertTriangle, FiShield
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useSocket } from '../../hooks/useSocket';
import { API_BASE_URL } from '../../api/config';

const STATUS_CONFIG = {
  pending:  { label: 'معلّق',   color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)',  border: 'rgba(251,191,36,0.2)',  icon: FiClock },
  approved: { label: 'مُفعّل', color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)',   border: 'rgba(52,211,153,0.2)',  icon: FiCheckCircle },
  rejected: { label: 'مرفوض/ملغي',  color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)',  border: 'rgba(248,113,113,0.2)', icon: FiXCircle },
};

const FILTER_TABS = [
  { key: 'all',      label: 'الكل' },
  { key: 'pending',  label: 'المعلقة' },
  { key: 'approved', label: 'المُفعّلة' },
  { key: 'rejected', label: 'المرفوضة' },
];

// ── Confirm Modal Component (Glassmorphism) ─────────────────
function ConfirmModal({ isOpen, onClose, onConfirm, userName, isLoading, isPending = false }) {
  const [reason, setReason] = useState('');
  useEffect(() => { setReason(''); }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 9998,
          animation: 'confirmFadeIn 0.2s ease-out both',
        }}
      />
      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          width: '100%',
          maxWidth: '420px',
          animation: 'confirmSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
            backdropFilter: 'blur(32px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(239, 68, 68, 0.1)',
            overflow: 'hidden',
            fontFamily: "'Cairo', 'IBM Plex Sans Arabic', sans-serif",
            direction: 'rtl',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '24px 28px 0',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FiAlertTriangle size={20} color="#f87171" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.01em' }}>
                  {isPending ? 'تأكيد الرفض' : 'تأكيد إلغاء التفعيل'}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
                  تحذير: سيتم تحويل الاشتراك للمجاني
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px', height: '32px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.03)', color: '#64748b', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#64748b'; }}
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 28px' }}>
            <div
              style={{
                padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.08)',
              }}
            >
              <p style={{ fontSize: '14px', color: '#e2e8f0', margin: 0, lineHeight: 1.7, fontWeight: 500 }}>
                هل أنت متأكد من {isPending ? 'رفض ترقية' : 'إلغاء تفعيل اشتراك'} <span style={{ color: '#f87171', fontWeight: 700 }}>{userName}</span>؟
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 0', lineHeight: 1.6 }}>
                سيتم تحويل حالة الحوالة إلى "{isPending ? 'مرفوض' : 'ملغي'}" وسيفقد المستخدم اشتراك Pro فوراً.
              </p>
              
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>سبب الرفض (اختياري، يظهر للمستخدم)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="مثال: الصورة غير واضحة"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px', 
                    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)',
                    color: '#f1f5f9', fontSize: '13px', fontFamily: 'inherit', outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(239,68,68,0.4)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{ padding: '0 28px 24px', display: 'flex', gap: '10px', justifyContent: 'flex-start' }}
          >
            <button
              onClick={() => onConfirm(reason)}
              disabled={isLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '12px',
                border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff',
                fontSize: '13px', fontWeight: 700, cursor: isLoading ? 'wait' : 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)', opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
                {isLoading && (
                <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'confirmSpinner 0.7s linear infinite' }} />
              )}
              {isLoading ? 'جاري الإلغاء...' : (isPending ? 'نعم، رفض الطلب ❌' : 'نعم، إلغاء التفعيل ❌')}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '10px 22px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.03)', color: '#94a3b8', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#c7d2fe'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              تراجع
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PaymentTable({ refreshKey, onDataChange }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageModal, setImageModal] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [successFlash, setSuccessFlash] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Deactivate/Reject Modal state
  const [deactivateModal, setDeactivateModal] = useState({ open: false, paymentId: null, userName: '', isPending: false });
  const [imageLoading, setImageLoading] = useState(false);

  // ── Real-time Socket.IO ───────────────────────────────────
  const { isConnected } = useSocket({
    room: 'admin',
    events: {
      'new-payment': (event) => {
        console.log('[RT] 🔔 New payment received:', event.data);
        // Play notification sound
        try { new Audio('data:audio/wav;base64,UklGRl9vT19teleWQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 'tvT19t').play().catch(() => {}); } catch {}
        // Show toast notification
        toast.success(`🔔 طلب تفعيل جديد من ${event.data.userName}`, {
          duration: 5000,
          icon: '💰',
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(52,211,153,0.3)' },
        });
        // Refresh data from server for accuracy
        fetchRequests(false);
      },
      'payment-status-changed': (event) => {
        console.log('[RT] 📡 Status changed:', event.data);
        const { requestId, status, plan, action, userId } = event.data;
        // Update local state in real-time
        setPayments(prev => prev.map(p => {
          const pUserId = (p.user?._id || p.user)?.toString();
          if (p._id === requestId) {
            return { ...p, status, userPlan: plan, reviewedAt: event.timestamp };
          }
          if (pUserId === userId && action === 'deactivate' && p.status === 'approved') {
            return { ...p, status: 'rejected', userPlan: plan, reviewedAt: event.timestamp };
          }
          if (pUserId === userId) {
            return { ...p, userPlan: plan };
          }
          return p;
        }));
        if (onDataChange) onDataChange();
      },
    },
  });

  const getAdminToken = () => {
    try {
      const stored = localStorage.getItem('admin_token');
      return stored || '';
    } catch { return ''; }
  };

  // ── Fetch upgrade requests from backend ───────────────────
  const fetchRequests = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const token = getAdminToken();
      if (!token) return window.location.href = '/admin/login';
      
      const res = await fetch(`${API_BASE_URL}/api/upgrade/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      console.log('[PaymentTable] Received data:', data);
      setPayments(data.requests || []);
    } catch (err) {
      console.error('[PaymentTable] Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();

    // Auto-clean ahmedyes limits when admin mounts
    const cleanAhmedyes = async () => {
      try {
        const token = getAdminToken();
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          const adminObj = data.data.find(u => u.username === 'ahmedyes' || u.email?.includes('ahmedyes'));
          if (adminObj) {
            await fetch(`${API_BASE_URL}/api/admin/unblock-user/${adminObj._id}`, {
              method: 'PUT',
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Cleaned ahmedyes rate limits block automatically.');
          }
        }
      } catch (err) {
        console.error('Failed to clean ahmedyes', err);
      }
    };
    cleanAhmedyes();
  }, [fetchRequests]);

  // Re-fetch when refreshKey changes (cross-component sync)
  useEffect(() => {
    if (refreshKey > 0) {
      fetchRequests(false);
    }
  }, [refreshKey, fetchRequests]);

  // ── Toasts helpers ────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    if (type === 'success') {
      toast.success(msg, {
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          fontFamily: "'Cairo', sans-serif",
          fontSize: '13px',
          fontWeight: 600,
        },
        iconTheme: { primary: '#10b981', secondary: '#fff' },
      });
    } else {
      toast.error(msg, {
        style: {
          background: '#1e293b',
          color: '#fca5a5',
          border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: '12px',
          fontFamily: "'Cairo', sans-serif",
          fontSize: '13px',
          fontWeight: 600,
        },
      });
    }
  };

  const handleOpenImage = async (payment) => {
    if (payment.proofImage) {
      setImageModal(payment);
      return;
    }

    setImageModal({ ...payment, proofImage: null });
    setImageLoading(true);

    try {
      const token = getAdminToken();
      const res = await fetch(`${API_BASE_URL}/api/upgrade/admin/proof/${payment._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.proofImage) {
        setImageModal({ ...payment, proofImage: data.proofImage });
      } else {
        showToast('فشل في تحميل الصورة', 'error');
      }
    } catch (err) {
      console.error('Image fetch error:', err);
      showToast('خطأ في الاتصال بالسيرفر', 'error');
    } finally {
      setImageLoading(false);
    }
  };

  // ── Unified Status Update (Activate/Deactivate/Unblock) ───────
  const handleStatusUpdate = useCallback(async (id, action, rejectionReason = '') => {
    console.log(`[EXPERT DEBUG] Action Triggered: ${action} for Request: ${id}`);
    setProcessing(id);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.post(`${API_BASE_URL}/api/admin/update-status/${id}`, 
        { action, rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data } = res;
      
      // Find the user ID of the targeted request to update its other rows too
      const targetRequest = payments.find(p => p._id === id);
      const targetUserId = (targetRequest?.user?._id || targetRequest?.user)?.toString();

      // Update local state immediately for real-time reflection across all rows for this user
      setPayments((prev) =>
        prev.map((p) => {
          const isTargetRow = p._id === id;
          const currentUserId = (p.user?._id || p.user)?.toString();
          const isSameUser = targetUserId && currentUserId === targetUserId;

          if (isTargetRow || (isSameUser && (p.status === 'pending' || (action === 'deactivate' && p.status === 'approved')))) {
            const newStatus = isTargetRow ? (data.status === 'N/A' || !data.status ? (action === 'deactivate' ? 'rejected' : 'approved') : data.status) : (action === 'activate' ? 'approved' : action === 'deactivate' ? 'rejected' : p.status);
            return {
              ...p,
              status: newStatus,
              userPlan: data.plan,
              reviewedAt: new Date().toISOString(),
              rejectionReason: action === 'deactivate' ? (rejectionReason || 'تم إلغاء التفعيل من قبل الإدارة') : p.rejectionReason,
              processedBy: isTargetRow || (isSameUser && action !== 'review') ? 'Admin (Ahmed)' : p.processedBy
            };
          }
          
          if (isSameUser) {
            return { ...p, userPlan: data.plan };
          }

          return p;
        })
      );

      // Visual feedback via toast
      showToast(data.message || 'تمت العملية بنجاح');
      setSuccessFlash(id);
      setTimeout(() => setSuccessFlash(null), 2000);
      
      // Close modal if open
      setDeactivateModal({ open: false, paymentId: null, userName: '', isPending: false });

      // Notify parent for cross-component refresh (e.g. UsersTable)
      if (onDataChange) onDataChange();
      
      // Additional logic for unblocking if needed
      if (action === 'unblock' || action === 'review') {
         setPayments((prev) =>
           prev.map((p) => p._id === id ? { ...p, isBlocked: false, failedAttempts: 0 } : p)
         );
      }
    } catch (err) {
      console.error('[EXPERT ERROR] Status Update Failed:', err);
      if (err.response && err.response.status === 403) {
        localStorage.removeItem('admin_token');
        showToast('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً', 'error');
        setTimeout(() => { window.location.href = '/admin/login'; }, 1500);
        return;
      }
      const errMsg = err.response?.data?.error || err.message || 'حدث خطأ أثناء التحديث';
      showToast(errMsg, 'error');
    } finally {
      setProcessing(null);
    }
  }, [payments, onDataChange]);

  const handleApprove = (id) => {
    console.log('[Admin] Approving Payment ID:', id);
    handleStatusUpdate(id, 'activate');
  };

  const handleDeactivate = useCallback((reason) => {
    console.log('[EXPERT DEBUG] handleDeactivate called with reason:', reason, 'paymentId:', deactivateModal.paymentId);
    if (!deactivateModal.paymentId) {
      showToast('خطأ: لم يتم تحديد معرف الطلب', 'error');
      return;
    }
    handleStatusUpdate(deactivateModal.paymentId, 'deactivate', reason);
  }, [deactivateModal.paymentId, handleStatusUpdate]);

  const handleUnblock = useCallback((id) => {
    console.log('[EXPERT DEBUG] handleUnblock called for ID:', id);
    handleStatusUpdate(id, 'unblock');
  }, [handleStatusUpdate]);

  const filteredPayments = payments.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.userName?.includes(search) && !p.userEmail?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pendingCount = payments.filter((p) => p.status === 'pending').length;
  const approvedCount = payments.filter((p) => p.status === 'approved').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <style>{`
        @keyframes paymentRowFlash {
          0% { background: rgba(52, 211, 153, 0.15); }
          100% { background: transparent; }
        }
        @keyframes paymentSpinner {
          to { transform: rotate(360deg); }
        }
        @keyframes confirmFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes confirmSlideIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes confirmSpinner {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .payment-row:hover {
          background: rgba(255,255,255,0.02) !important;
        }
        .payment-filter-tab {
          transition: all 0.2s ease;
        }
        .payment-filter-tab:hover {
          background: rgba(255,255,255,0.06) !important;
        }
        .admin-spin {
          animation: paymentSpinner 1s linear infinite;
        }
        .admin-loader {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: paymentSpinner 0.8s linear infinite;
        }
      `}</style>

      {/* ── Confirm Deactivate Modal ──────────────────────── */}
      <ConfirmModal
        isOpen={deactivateModal.open}
        onClose={() => setDeactivateModal({ open: false, paymentId: null, userName: '', isPending: false })}
        onConfirm={handleDeactivate}
        userName={deactivateModal.userName}
        isLoading={processing === deactivateModal.paymentId}
        isPending={deactivateModal.isPending}
      />

      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(24px)',
        borderRadius: '18px',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        {/* ── Header ────────────────────────────────────────── */}
        <div style={{
          padding: '22px 28px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {/* Title Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
          }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                طلبات التفعيل (الحوالات)
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
                  background: isConnected ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                  color: isConnected ? '#34d399' : '#f87171',
                  border: `1px solid ${isConnected ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: isConnected ? '#34d399' : '#f87171',
                    boxShadow: isConnected ? '0 0 8px rgba(52,211,153,0.5)' : 'none',
                    animation: isConnected ? 'pulse 2s ease-in-out infinite' : 'none',
                  }} />
                  {isConnected ? 'مباشر' : 'غير متصل'}
                </span>
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
                {pendingCount} طلب بانتظار المراجعة · {approvedCount} تم تفعيلهم
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Refresh Button */}
              <button
                onClick={() => fetchRequests(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = '#818cf8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <FiRefreshCw size={14} style={{ animation: refreshing ? 'paymentSpinner 0.6s linear infinite' : 'none' }} />
              </button>

              {/* Pending Badge */}
              {pendingCount > 0 && (
                <div style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  background: 'rgba(251, 191, 36, 0.08)',
                  border: '1px solid rgba(251,191,36,0.15)',
                  color: '#fbbf24',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <FiClock size={14} />
                  {pendingCount} معلّق
                </div>
              )}
            </div>
          </div>

          {/* Filters + Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            {/* Filter Tabs */}
            <div style={{
              display: 'flex',
              gap: '4px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              padding: '3px',
            }}>
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  className="payment-filter-tab"
                  onClick={() => setFilter(tab.key)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    background: filter === tab.key
                      ? 'rgba(99,102,241,0.15)'
                      : 'transparent',
                    color: filter === tab.key ? '#a5b4fc' : '#64748b',
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              minWidth: '200px',
            }}>
              <FiSearch size={14} color="#64748b" />
              <input
                type="text"
                placeholder="بحث بالاسم أو البريد..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f1f5f9',
                  fontSize: '12px',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────── */}
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['المستخدم', 'المبلغ', 'صورة الحوالة', 'التاريخ', 'الحالة', 'الخطة', 'بواسطة', 'الإجراء'].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: '14px 24px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569',
                      textAlign: 'right',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      background: 'rgba(255,255,255,0.01)',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '14px',
                  }}>
                    <FiRefreshCw size={28} style={{ display: 'block', margin: '0 auto 12px', animation: 'paymentSpinner 1s linear infinite', opacity: 0.5 }} />
                    جاري التحميل...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#475569',
                    fontSize: '14px',
                  }}>
                    <FiFilter size={32} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                    {payments.length === 0 ? 'لا توجد طلبات ترقية بعد' : 'لا توجد نتائج'}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const statusCfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
                  const isProcessing = processing === payment._id;
                  const isFlashing = successFlash === payment._id;

                  return (
                    <tr
                      key={payment._id}
                      className="payment-row"
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.25s',
                        animation: isFlashing ? 'paymentRowFlash 2s ease-out' : 'none',
                      }}
                    >
                      {/* User Info */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#fff',
                            flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
                          }}>
                            {(payment.userName || '?').charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
                              {payment.userName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                              {payment.userEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: '#f8fafc',
                          fontFeatureSettings: '"tnum"',
                        }}>
                          ${payment.amount || 25}
                        </span>
                      </td>

                      {/* Image Thumbnail */}
                      <td style={{ padding: '16px 24px' }}>
                        <button
                          onClick={() => handleOpenImage(payment)}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            border: '1.5px solid rgba(99, 102, 241, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                            overflow: 'hidden',
                            padding: 0,
                            background: 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          {payment.proofImage ? (
                            <img
                              src={payment.proofImage}
                              alt="proof"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '8px',
                              }}
                            />
                          ) : (
                            <FiImage size={18} color="#818cf8" />
                          )}
                        </button>
                      </td>

                      {/* Date */}
                      <td style={{
                        padding: '16px 24px',
                        fontSize: '13px',
                        color: '#94a3b8',
                        fontWeight: 500,
                      }}>
                        {formatDate(payment.createdAt)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: statusCfg.bg,
                            color: statusCfg.color,
                            border: `1px solid ${statusCfg.border}`,
                          }}>
                            <StatusIcon size={13} />
                            {statusCfg.label}
                          </span>
                          {payment.status === 'rejected' && payment.rejectionReason && (
                            <span style={{ fontSize: '10.5px', color: '#f87171', opacity: 0.9, maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={payment.rejectionReason}>
                              {payment.rejectionReason}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Plan Badge */}
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: payment.userPlan === 'pro' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.04)',
                          color: payment.userPlan === 'pro' ? '#10b981' : '#64748b',
                          border: payment.userPlan === 'pro' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.08)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          {payment.userPlan === 'pro' ? <FiShield size={12} /> : null}
                          {payment.userPlan || 'free'}
                        </span>
                      </td>

                      {/* Processed By */}
                      <td style={{ padding: '16px 24px' }}>
                        {payment.processedBy ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: payment.processedBy.includes('n8n')
                              ? 'rgba(99, 102, 241, 0.08)'
                              : 'rgba(251, 191, 36, 0.08)',
                            color: payment.processedBy.includes('n8n')
                              ? '#818cf8'
                              : '#fbbf24',
                            border: `1px solid ${payment.processedBy.includes('n8n') ? 'rgba(99,102,241,0.15)' : 'rgba(251,191,36,0.15)'}`,
                          }}>
                            {payment.processedBy.includes('n8n') ? '🤖' : '👤'}
                            {payment.processedBy}
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#475569', fontStyle: 'italic' }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          
                          {/* ——— PENDING ACTIONS ——— */}
                          {payment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(payment._id)}
                                disabled={isProcessing}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px',
                                  border: 'none', cursor: isProcessing ? 'wait' : 'pointer', background: 'linear-gradient(135deg, #10b981, #059669)',
                                  color: '#fff', fontSize: '12px', fontWeight: 700, transition: 'all 0.2s', opacity: isProcessing ? 0.5 : 1,
                                  fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                                }}
                                onMouseEnter={(e) => { if(!isProcessing) e.currentTarget.style.transform = 'scale(1.05)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                              >
                                {isProcessing === payment._id ? <div className="admin-loader" /> : <FiCheck size={15} />}
                                تفعيل
                              </button>

                              <button
                               onClick={(e) => { e.stopPropagation(); setDeactivateModal({ open: true, paymentId: payment._id, userName: payment.userName, isPending: true }); }}
                                disabled={!!processing}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px',
                                  border: '1px solid rgba(239, 68, 68, 0.3)', cursor: !!processing ? 'wait' : 'pointer', background: 'rgba(239, 68, 68, 0.08)',
                                  color: '#f87171', fontSize: '12px', fontWeight: 700, transition: 'all 0.2s', opacity: !!processing ? 0.5 : 1, fontFamily: 'inherit',
                                }}
                                onMouseEnter={(e) => { if(!processing) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
                                onMouseLeave={(e) => { if(!processing) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                              >
                                {processing === payment._id ? <FiRefreshCw size={15} className="admin-spin" /> : <FiX size={15} />}
                                رفض
                              </button>
                            </>
                          )}

                          {/* ——— APPROVED ACTIONS ——— */}
                          {payment.status === 'approved' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); console.log('[EXPERT DEBUG] Clicked Table Deactivate for ID:', payment._id); setDeactivateModal({ open: true, paymentId: payment._id, userName: payment.userName, isPending: false }); }}
                              disabled={!!processing}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px',
                                border: 'none', cursor: !!processing ? 'wait' : 'pointer', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                color: '#fff', fontSize: '11px', fontWeight: 700, transition: 'all 0.2s', opacity: !!processing ? 0.5 : 1,
                                fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                              }}
                              onMouseEnter={(e) => { if(!processing) e.currentTarget.style.transform = 'scale(1.05)'; }}
                              onMouseLeave={(e) => { if(!processing) e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                              {processing === payment._id ? <FiRefreshCw size={14} className="admin-spin" /> : <FiX size={14} />} 
                              إلغاء التفعيل 🚫
                            </button>
                          )}

                          {/* ——— REJECTED ACTIONS ——— */}
                          {payment.status === 'rejected' && (
                            <button
                              onClick={() => handleUnblock(payment._id)} // Maps to 'unblock' / 'review' action
                              disabled={isProcessing}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px',
                                border: '1px solid rgba(249, 115, 22, 0.25)', cursor: isProcessing ? 'wait' : 'pointer', background: 'rgba(249, 115, 22, 0.08)',
                                color: '#fb923c', fontSize: '11px', fontWeight: 700, transition: 'all 0.2s', opacity: isProcessing ? 0.5 : 1, fontFamily: 'inherit',
                              }}
                              onMouseEnter={(e) => { if(!isProcessing) e.currentTarget.style.transform = 'scale(1.03)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                              {isProcessing === payment._id ? <FiRefreshCw size={12} className="spin" /> : <FiRefreshCw size={12} />} إعادة مراجعة 🔄
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer Summary ───────────────────────────────── */}
        <div style={{
          padding: '14px 28px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#475569',
          fontWeight: 500,
        }}>
          <span>عرض {filteredPayments.length} من {payments.length} طلب</span>
          <span>إجمالي المبالغ: ${payments.reduce((s, p) => s + (p.amount || 25), 0).toLocaleString()}</span>
        </div>
      </div>

      {/* ——— MODALS (PORTALS) ——— */}
      {createPortal(
        <ConfirmModal
          isOpen={deactivateModal.open}
          onClose={() => setDeactivateModal({ open: false, paymentId: null, userName: '', isPending: false })}
          onConfirm={handleDeactivate}
          userName={deactivateModal.userName}
          isLoading={processing === deactivateModal.paymentId}
          isPending={deactivateModal.isPending}
        />,
        document.body
      )}

      {/* ── Image Modal (Premium Lightbox) ──────────────── */}
      {createPortal(
        imageModal && (
          <div
            onClick={() => setImageModal(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              cursor: 'pointer',
              animation: 'statsCardEntry 0.2s ease-out',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(180deg, #1e293b, #0f172a)',
                borderRadius: '20px',
                padding: '32px',
                maxWidth: '600px',
                width: '90%',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
                cursor: 'default',
              }}
            >
              {/* Modal Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                    صورة الحوالة
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {imageModal.userName} · {imageModal.userEmail} · ${imageModal.amount || 25}
                  </div>
                </div>
                <button
                  onClick={() => setImageModal(null)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
                    color: '#94a3b8', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <FiX size={14} />
                </button>
              </div>

              {/* Image Area */}
              <div style={{
                width: '100%',
                borderRadius: '14px',
                overflow: 'hidden',
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px',
                position: 'relative'
              }}>
                {imageLoading && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, backdropFilter: 'blur(2px)' }}>
                    <FiRefreshCw size={28} style={{ color: '#818cf8', animation: 'paymentSpinner 1s linear infinite' }} />
                  </div>
                )}
                {imageModal.proofImage ? (
                  <img
                    src={imageModal.proofImage}
                    alt="صورة الحوالة"
                    style={{
                      display: 'block',
                      width: '100%',
                      maxHeight: '500px',
                      objectFit: 'contain',
                      animation: 'confirmFadeIn 0.3s ease-out'
                    }}
                  />
                ) : !imageLoading && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '40px',
                    color: '#475569',
                  }}>
                    <FiImage size={48} style={{ opacity: 0.3 }} />
                    <span style={{ fontSize: '13px' }}>لا توجد صورة أو فشل التحميل</span>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              {imageModal.status === 'pending' && (
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '20px',
                }}>
                  <button
                    onClick={() => { handleApprove(imageModal._id); setImageModal(null); }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                      fontFamily: 'inherit',
                    }}
                  >
                    <FiCheck size={16} />
                    تفعيل الحساب → Pro
                  </button>
                  <button
                  onClick={() => { setDeactivateModal({ open: true, paymentId: imageModal._id, userName: imageModal.userName, isPending: imageModal.status === 'pending' }); setImageModal(null); }}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: '1px solid rgba(239,68,68,0.2)',
                      background: 'rgba(239,68,68,0.06)',
                      color: '#f87171',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontFamily: 'inherit',
                    }}
                  >
                    <FiX size={16} />
                    رفض
                  </button>
                </div>
              )}
            </div>
          </div>
        ),
        document.body
      )}
    </>
  );
}
