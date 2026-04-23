// ============================================================
// CV-Mister — Users Management Table (V2 Premium)
// Full CRUD table with search, filter chips, pagination,
// quick actions, premium avatars, and status indicators
// ============================================================
import React, { useState, useMemo, useCallback } from 'react';
import {
  FiSearch, FiMail, FiTrash2, FiUser, FiChevronLeft, FiChevronRight,
  FiUserCheck, FiUserX, FiStar, FiShield, FiMoreVertical, FiDownload, FiZap,
  FiAlertTriangle, FiX, FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';

const MOCK_USERS = [
  { id: 1, name: 'أحمد محمد علي',    email: 'ahmed@gmail.com',   plan: 'pro',  status: 'active',   joined: '2026-03-15', resumes: 5  },
  { id: 2, name: 'سارة حسين',        email: 'sara@gmail.com',    plan: 'free',    status: 'active',   joined: '2026-03-20', resumes: 2  },
  { id: 3, name: 'محمد خالد',         email: 'moh@gmail.com',     plan: 'pro',  status: 'active',   joined: '2026-02-10', resumes: 8  },
  { id: 4, name: 'نور الدين',         email: 'nour@gmail.com',    plan: 'free',    status: 'inactive', joined: '2026-01-28', resumes: 1  },
  { id: 5, name: 'فاطمة أحمد',        email: 'fatima@gmail.com',  plan: 'pro',  status: 'active',   joined: '2026-04-01', resumes: 3  },
  { id: 6, name: 'عمر يوسف',          email: 'omar@gmail.com',    plan: 'free',    status: 'active',   joined: '2026-04-05', resumes: 1  },
  { id: 7, name: 'ريم عبدالله',       email: 'reem@gmail.com',    plan: 'pro',  status: 'active',   joined: '2026-04-06', resumes: 4  },
  { id: 8, name: 'يزن الشامي',        email: 'yazan@gmail.com',   plan: 'free',    status: 'inactive', joined: '2026-03-22', resumes: 0  },
  { id: 9, name: 'ملك النجار',        email: 'malak@gmail.com',   plan: 'pro',  status: 'active',   joined: '2026-04-10', resumes: 6  },
  { id: 10, name: 'حسن البكري',       email: 'hassan@gmail.com',  plan: 'free',    status: 'active',   joined: '2026-04-08', resumes: 2  },
];

const PLAN_CONFIG = {
  premium: {
    label: 'Pro ✅',
    color: '#a78bfa',
    bg: 'rgba(167, 139, 250, 0.1)',
    border: 'rgba(167,139,250,0.2)',
    icon: FiStar,
  },
  pro: {
    label: 'Pro ✅',
    color: '#a78bfa',
    bg: 'rgba(167, 139, 250, 0.1)',
    border: 'rgba(167,139,250,0.2)',
    icon: FiStar,
  },
  free: {
    label: 'Free',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.08)',
    border: 'rgba(148,163,184,0.15)',
    icon: FiUser,
  },
};

const STATUS_CONFIG = {
  active:   { label: 'نشط',     color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)' },
  inactive: { label: 'غير نشط', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' },
};

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #06b6d4, #0891b2)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #ec4899, #be185d)',
  'linear-gradient(135deg, #8b5cf6, #6d28d9)',
];

const FILTER_CHIPS = [
  { key: 'all',      label: 'الكل' },
  { key: 'pro',      label: 'Pro' },
  { key: 'free',     label: 'مجاني' },
  { key: 'active',   label: 'نشط' },
  { key: 'inactive', label: 'غير نشط' },
];

const ITEMS_PER_PAGE = 6;

// ── Confirm Modal Component ─────────────────────────────────
function ConfirmModal({ isOpen, onClose, onConfirm, userName, isLoading }) {
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
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#f8fafc',
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  تأكيد إلغاء التفعيل
                </h3>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#64748b',
                    margin: '2px 0 0',
                    fontWeight: 500,
                  }}
                >
                  هذا الإجراء سيغيّر خطة المستخدم
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.03)',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 28px' }}>
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.08)',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  color: '#e2e8f0',
                  margin: 0,
                  lineHeight: 1.7,
                  fontWeight: 500,
                }}
              >
                هل أنت متأكد من إلغاء اشتراك{' '}
                <span style={{ color: '#f87171', fontWeight: 700 }}>
                  {userName}
                </span>
                ؟
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: '#64748b',
                  margin: '8px 0 0',
                  lineHeight: 1.6,
                }}
              >
                سيتم تحويل المستخدم من خطة Pro إلى الخطة المجانية فوراً.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '0 28px 24px',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-start',
            }}
          >
            <button
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isLoading ? 'wait' : 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isLoading && (
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'confirmSpinner 0.7s linear infinite',
                  }}
                />
              )}
              {isLoading ? 'جاري الإلغاء...' : 'نعم، إلغاء التفعيل ❌'}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '10px 22px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: '#94a3b8',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = '#c7d2fe';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              تراجع
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function UsersTable({ users: propUsers, refreshKey, onDataChange }) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenu, setActionMenu] = useState(null);
  const [freeUpgradeEmail, setFreeUpgradeEmail] = useState('');
  const [upgrading, setUpgrading] = useState(false);

  // Per-user loading state for plan toggle buttons
  const [loadingUserId, setLoadingUserId] = useState(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, userId: null, userName: '' });

  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const token = localStorage.getItem('admin_token');
        const res = await axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setUsersList(res.data.data);
        } else {
          setUsersList(propUsers || MOCK_USERS);
        }
      } catch (err) {
        console.error('Failed to fetch real users:', err);
        setUsersList(propUsers || MOCK_USERS);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [propUsers, refreshKey]);

  const handleUpdatePlan = useCallback(async (userId, newPlan) => {
    setLoadingUserId(userId);
    try {
      const token = localStorage.getItem('admin_token');
      let res;
      
      if (newPlan === 'free') {
        // Using PUT for deactivation as registered in the admin router
        res = await axios.put(`/api/admin/deactivate-pro/${userId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Using unified endpoint for activation: /api/admin/update-status/:id
        res = await axios.post(`/api/admin/update-status/${userId}`, 
          { action: 'activate', plan: newPlan }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      if (res.data.success) {
        toast.success(res.data.message || 'تم تحديث الخطة بنجاح', {
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontFamily: "'Cairo', 'IBM Plex Sans Arabic', sans-serif",
            fontSize: '13px',
            fontWeight: 600,
          },
          iconTheme: { primary: newPlan === 'pro' ? '#10b981' : '#ef4444', secondary: '#fff' },
        });
        setUsersList(prev => prev.map(u => {
          const uId = (u._id || u.id)?.toString();
          const targetId = userId?.toString();
          return uId === targetId ? { ...u, plan: newPlan, isPremium: newPlan !== 'free' } : u;
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'حدث خطأ أثناء تعديل الخطة', {
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: '12px',
          fontFamily: "'Cairo', 'IBM Plex Sans Arabic', sans-serif",
          fontSize: '13px',
          fontWeight: 600,
        },
      });
    }
    setLoadingUserId(null);
    setConfirmModal({ open: false, userId: null, userName: '' });
    // Notify parent for cross-component refresh (e.g. PaymentTable)
    if (onDataChange) onDataChange();
  }, [onDataChange]);

  const handleUpdateSubscription = useCallback(async (userId, updates) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.put(`/api/admin/users/${userId}/subscription`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message || 'تم التحديث بنجاح');
        setUsersList(prev => prev.map(u => (u._id || u.id) === userId ? { ...u, ...updates } : u));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل التحديث');
    }
  }, []);

  const handleFreeUpgrade = async () => {
    if (!freeUpgradeEmail) return toast.error('يرجى إدخال البريد الإلكتروني');
    setUpgrading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.post('/api/admin/free-upgrade', 
        { email: freeUpgradeEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setFreeUpgradeEmail('');
        // Refresh users list handled by parent optionally
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'حدث خطأ');
    }
    setUpgrading(false);
  };

  // Open deactivation confirm modal
  const openDeactivateModal = useCallback((userId, userName) => {
    setConfirmModal({ open: true, userId, userName });
  }, []);

  // Handle confirm from modal
  const handleConfirmDeactivate = useCallback(() => {
    if (confirmModal.userId) {
      handleUpdatePlan(confirmModal.userId, 'free');
    }
  }, [confirmModal.userId, handleUpdatePlan]);

  // Handle Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;
    setLoadingUserId(userId);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('تم حذف المستخدم بنجاح');
        setUsersList(prev => prev.filter(u => (u._id || u.id) !== userId));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'فشل الحذف');
    }
    setLoadingUserId(null);
  };

  // Handle Toggle Status (Block/Unblock)
  const handleToggleStatus = async (user) => {
    const userId = user._id || user.id;
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    setLoadingUserId(userId);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.put(`/api/admin/users/status/${userId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(newStatus === 'active' ? 'تم تنشيط الحساب' : 'تم تعطيل الحساب');
        setUsersList(prev => prev.map(u => (u._id || u.id) === userId ? { ...u, status: newStatus } : u));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشلت العملية');
    }
    setLoadingUserId(null);
    // Notify parent for cross-component refresh
    if (onDataChange) onDataChange();
  };

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      // Search
      const name = u.name || u.fullName || '';
      const email = u.email || '';
      const matchesSearch = !search ||
        name.includes(search) ||
        email.toLowerCase().includes(search.toLowerCase());
      // Filter
      let matchesFilter = true;
      if (activeFilter === 'pro') matchesFilter = u.plan === 'pro' || u.plan === 'premium';
      else if (activeFilter === 'free') matchesFilter = u.plan === 'free';
      else if (activeFilter === 'active') matchesFilter = u.status === 'active';
      else if (activeFilter === 'inactive') matchesFilter = u.status === 'inactive';
      return matchesSearch && matchesFilter;
    });
  }, [usersList, search, activeFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const premiumCount = usersList.filter(u => u.plan === 'premium' || u.plan === 'pro').length;
  const activeCount = usersList.filter(u => u.status === 'active').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper: check if user is on a pro/premium plan
  const isPro = (plan) => plan === 'pro' || plan === 'premium';

  return (
    <>
      <style>{`
        .user-row:hover {
          background: rgba(255,255,255,0.02) !important;
        }
        .user-filter-chip {
          transition: all 0.2s ease;
        }
        .user-filter-chip:hover {
          background: rgba(255,255,255,0.06) !important;
          color: #c7d2fe !important;
        }
        .user-action-btn:hover {
          background: rgba(99,102,241,0.1) !important;
          color: #818cf8 !important;
        }
        .user-page-btn:hover:not(:disabled) {
          background: rgba(99,102,241,0.1) !important;
          color: #a5b4fc !important;
        }
        .plan-toggle-btn {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .plan-toggle-btn:active:not(:disabled) {
          transform: scale(0.95);
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
        @keyframes planBtnSpinner {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── Confirm Modal (Glassmorphism) ──────────────────── */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, userId: null, userName: '' })}
        onConfirm={handleConfirmDeactivate}
        userName={confirmModal.userName}
        isLoading={loadingUserId === confirmModal.userId}
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
            marginBottom: '16px',
          }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                إدارة المستخدمين
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
                {usersList.length} مستخدم · {premiumCount} بريميوم · {activeCount} نشط
              </p>
            </div>

            {/* Export Button */}
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = '#a5b4fc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <FiDownload size={13} />
              تصدير CSV
            </button>
          </div>

          {/* Quick Upgrade & Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '320px' }}>
              <input
                type="email"
                placeholder="تفعيل باقة Pro عبر البريد الإلكتروني..."
                value={freeUpgradeEmail}
                onChange={(e) => setFreeUpgradeEmail(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#f1f5f9',
                  fontSize: '13px',
                  width: '100%',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <button 
                onClick={handleFreeUpgrade}
                disabled={upgrading || !freeUpgradeEmail}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 16px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff', border: 'none', cursor: upgrading ? 'wait' : 'pointer',
                  fontWeight: 600, fontSize: '13px', opacity: upgrading || !freeUpgradeEmail ? 0.7 : 1, transition: 'all 0.2s',
                  flexShrink: 0, fontFamily: 'inherit'
                }}>
                <FiZap size={14} /> تفعيل مجاني
              </button>
            </div>
          </div>

          {/* Search + Filters */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            {/* Search */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 14px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              minWidth: '220px',
              flex: 1,
              maxWidth: '320px',
            }}>
              <FiSearch size={14} color="#64748b" />
              <input
                type="text"
                placeholder="بحث بالاسم أو البريد..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f1f5f9',
                  fontSize: '13px',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Filter Chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {FILTER_CHIPS.map((chip) => (
                <button
                  key={chip.key}
                  className="user-filter-chip"
                  onClick={() => { setActiveFilter(chip.key); setCurrentPage(1); }}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '20px',
                    border: activeFilter === chip.key
                      ? '1px solid rgba(99,102,241,0.3)'
                      : '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    background: activeFilter === chip.key
                      ? 'rgba(99,102,241,0.12)'
                      : 'rgba(255,255,255,0.02)',
                    color: activeFilter === chip.key ? '#a5b4fc' : '#64748b',
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────── */}
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['المستخدم', 'الخطة', 'تاريخ الانتهاء', 'حد السير', 'تاريخ التسجيل', 'الإجراء'].map((col) => (
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
              {loadingUsers ? (
                <tr>
                  <td colSpan={6} style={{
                    padding: '48px 24px', textAlign: 'center', color: '#64748b', fontSize: '14px',
                  }}>
                    <FiRefreshCw size={28} style={{ display: 'block', margin: '0 auto 12px', animation: 'confirmSpinner 1s linear infinite', opacity: 0.5 }} />
                    جاري تحميل المستخدمين...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#475569',
                    fontSize: '14px',
                  }}>
                    <FiUser size={32} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                    لا توجد نتائج
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const planCfg = PLAN_CONFIG[user.plan] || PLAN_CONFIG.free;
                  const statusCfg = STATUS_CONFIG[user.status] || STATUS_CONFIG.inactive;
                  const PlanIcon = planCfg.icon;
                  const avatarGrad = AVATAR_GRADIENTS[(user.id || 0) % AVATAR_GRADIENTS.length];
                  const userId = user._id || user.id;
                  const userName = user.name || user.fullName || 'مستخدم';
                  const isThisLoading = loadingUserId === userId;
                  const userIsPro = isPro(user.plan);

                  return (
                    <tr
                      key={userId}
                      className="user-row"
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.2s',
                      }}
                    >
                      {/* User */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: avatarGrad,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#fff',
                            flexShrink: 0,
                            position: 'relative',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          }}>
                            {userName.charAt(0)}
                            {/* Online indicator */}
                            {user.status === 'active' && (
                              <div style={{
                                position: 'absolute',
                                bottom: '-1px',
                                left: '-1px',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: '#22c55e',
                                border: '2px solid #1e293b',
                              }} />
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{userName}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: planCfg.bg,
                          color: planCfg.color,
                          border: `1px solid ${planCfg.border}`,
                        }}>
                          <PlanIcon size={12} />
                          {planCfg.label}
                        </span>
                      </td>

                      {/* Subscription End Date */}
                      <td style={{ padding: '16px 24px' }}>
                        <input 
                          type="date"
                          defaultValue={user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toISOString().split('T')[0] : ''}
                          onBlur={(e) => {
                            const newDate = e.target.value;
                            if (newDate !== (user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toISOString().split('T')[0] : '')) {
                              handleUpdateSubscription(userId, { subscriptionEndDate: newDate });
                            }
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            color: '#94a3b8',
                            fontSize: '11px',
                            padding: '4px 8px',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        />
                      </td>

                      {/* Joined */}
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
                        {formatDate(user.joined || user.createdAt)}
                      </td>

                      {/* Resumes Limit */}
                      <td style={{ padding: '16px 24px' }}>
                        <input 
                          type="number"
                          defaultValue={user.resumesLimit || 2}
                          onBlur={(e) => {
                            const newLimit = parseInt(e.target.value);
                            if (newLimit !== user.resumesLimit) {
                              handleUpdateSubscription(userId, { resumesLimit: newLimit });
                            }
                          }}
                          style={{
                            width: '50px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            color: '#94a3b8',
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '4px 8px',
                            textAlign: 'center',
                            outline: 'none'
                          }}
                        />
                      </td>

                      {/* ── Actions Column ──────────────────── */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                           {/* ── Plan Management Buttons ──────────── */}
                           <div style={{ display: 'flex', gap: '6px' }}>
                             {/* Activate Pro */}
                             {user.plan !== 'pro' && (
                               <button
                                 className="plan-toggle-btn"
                                 disabled={isThisLoading}
                                 onClick={() => handleUpdatePlan(userId, 'pro')}
                                 style={{
                                   display: 'inline-flex', alignItems: 'center', gap: '6px',
                                   padding: '6px 12px', borderRadius: '9px', border: '1px solid rgba(16,185,129,0.15)',
                                   fontSize: '10px', fontWeight: 700, cursor: isThisLoading ? 'wait' : 'pointer',
                                   background: 'rgba(16,185,129,0.08)', color: '#34d399',
                                   fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: isThisLoading ? 0.65 : 1,
                                 }}
                               >
                                 Pro ✅
                               </button>
                             )}

                             {/* Activate Business */}
                             {user.plan !== 'business' && (
                               <button
                                 className="plan-toggle-btn"
                                 disabled={isThisLoading}
                                 onClick={() => handleUpdatePlan(userId, 'business')}
                                 style={{
                                   display: 'inline-flex', alignItems: 'center', gap: '6px',
                                   padding: '6px 12px', borderRadius: '9px', border: '1px solid rgba(59,130,246,0.15)',
                                   fontSize: '10px', fontWeight: 700, cursor: isThisLoading ? 'wait' : 'pointer',
                                   background: 'rgba(59,130,246,0.08)', color: '#60a5fa',
                                   fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: isThisLoading ? 0.65 : 1,
                                 }}
                               >
                                 Business 🏢
                               </button>
                             )}

                             {/* Deactivate */}
                             {user.plan !== 'free' && (
                               <button
                                 className="plan-toggle-btn"
                                 disabled={isThisLoading}
                                 onClick={() => openDeactivateModal(userId, userName)}
                                 style={{
                                   display: 'inline-flex', alignItems: 'center', gap: '6px',
                                   padding: '6px 12px', borderRadius: '9px', border: '1px solid rgba(239,68,68,0.15)',
                                   fontSize: '10px', fontWeight: 700, cursor: isThisLoading ? 'wait' : 'pointer',
                                   background: 'rgba(239,68,68,0.08)', color: '#f87171',
                                   fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: isThisLoading ? 0.65 : 1,
                                 }}
                               >
                                 إلغاء ❌
                               </button>
                             )}
                           </div>


                          {/* Existing Tools */}
                          <div style={{ display: 'flex', gap: '4px', borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: '6px', marginRight: '2px' }}>
                            <button
                              className="user-action-btn"
                              title="إرسال بريد"
                              onClick={() => window.open(`mailto:${user.email}`)}
                              style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.06)', background: 'transparent',
                                color: '#94a3b8', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s',
                              }}
                            >
                              <FiMail size={13} />
                            </button>
                            <button
                              className="user-action-btn"
                              title={user.status === 'active' ? 'تعطيل' : 'تفعيل'}
                              disabled={isThisLoading}
                              onClick={() => handleToggleStatus(user)}
                              style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.06)', background: 'transparent',
                                color: user.status === 'active' ? '#94a3b8' : '#fbbf24', 
                                cursor: isThisLoading ? 'wait' : 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s',
                                opacity: isThisLoading ? 0.5 : 1
                              }}
                            >
                              {user.status === 'active' ? <FiUserX size={13} /> : <FiUserCheck size={13} />}
                            </button>
                            <button
                              className="user-action-btn"
                              title="حذف"
                              disabled={isThisLoading}
                              onClick={() => handleDeleteUser(userId)}
                              style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.06)', background: 'transparent',
                                color: '#94a3b8', cursor: isThisLoading ? 'wait' : 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s',
                                opacity: isThisLoading ? 0.5 : 1
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ───────────────────────────────────── */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>
            عرض {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} من {filteredUsers.length}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Prev */}
            <button
              className="user-page-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                width: '32px', height: '32px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'transparent',
                color: currentPage <= 1 ? '#334155' : '#94a3b8',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <FiChevronRight size={16} />
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className="user-page-btn"
                onClick={() => setCurrentPage(page)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  border: 'none',
                  background: currentPage === page
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'transparent',
                  color: currentPage === page ? '#fff' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: currentPage === page ? 700 : 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: currentPage === page ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                }}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              className="user-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                width: '32px', height: '32px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'transparent',
                color: currentPage >= totalPages ? '#334155' : '#94a3b8',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <FiChevronLeft size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
