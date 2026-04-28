// ============================================================
// CV-Mister — Dashboard
// Sidebar-based layout with Documents, Pricing, and Settings
// ============================================================

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useSocket from '../hooks/useSocket';
import { API_ROUTES } from '../api/config';
import { 
  FileText, 
  Trash2, 
  Edit3, 
  Search,
  LayoutGrid,
  List as ListIcon,
  CreditCard,
  Settings as SettingsIcon,
  Plus,
  ArrowRight,
  ShieldCheck,
  User,
  LogOut,
  Mail,
  Zap,
  CheckCircle2,
  Sparkles,
  Crown,
  Building2,
  Check,
  X,
  Star,
  Layout,
  ScanSearch,
  Clock,
  Calendar,
  Lock as LockIcon
} from 'lucide-react';
import useStyleStore from '../store/useStyleStore';
import useAuthStore from '../store/useAuthStore';
import useResumeStore from '../store/useResumeStore';
import useCoverLetterStore from '../store/useCoverLetterStore';
import toast from 'react-hot-toast';
import { TEMPLATE_LIST } from '../utils/constants';
import useCMSStore from '../store/useCMSStore';
import PaymentModal from '../components/Builder/PaymentModal';
import CVScanPanel from '../components/Builder/CVScanPanel';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token, logout, updateProfile, syncLocalUser } = useAuthStore();

  const language = useStyleStore((s) => s.language);
  const resetResume = useResumeStore((s) => s.resetData);
  const resetStyles = useStyleStore((s) => s.resetStyles);
  const resetLetter = useCoverLetterStore((s) => s.resetContent);
  const cmsSettings = useCMSStore((s) => s.settings);
  
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'documents';
  });
  const [resumes, setResumes] = useState([]);
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFreeAllowed, setIsFreeAllowed] = useState(true); 
  const [templateSettings, setTemplateSettings] = useState({});
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(3);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── Mobile Detection ─────────────────────────────────────
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Real-time updates via Socket
  useSocket({
    events: {
      settingsUpdate: (data) => {
        if (data.type === 'global' && data.settings) {
          setIsFreeAllowed(data.settings.isFreeAllowed !== false);
        }
        if (data.type === 'templates') {
          setTemplateSettings(data.templates);
        }
      },
      'my-plan-updated': (event) => {
        console.log('[Socket] Plan updated received:', event.data);
        if (event.data) {
          syncLocalUser(event.data);
          toast.success(language === 'ar' ? 'تم تحديث خطة اشتراكك!' : 'Your subscription plan has been updated!');
        }
      }
    }
  });

  // Settings state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });
  
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search, activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [resumesRes, lettersRes, settingsRes] = await Promise.all([
          fetch(API_ROUTES.RESUMES, { headers }),
          fetch(API_ROUTES.COVER_LETTERS, { headers }),
          fetch(API_ROUTES.CONTENT) // Public settings
        ]);
        const resData = await resumesRes.json();
        const letData = await lettersRes.json();
        const settData = await settingsRes.json();

        setResumes(Array.isArray(resData) ? resData : []);
        setLetters(Array.isArray(letData) ? letData : []);
        
        if (settData.success && settData.settings) {
          setIsFreeAllowed(settData.settings.isFreeAllowed !== false);
          setTemplateSettings(prev => ({ ...prev, ...settData.settings }));
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleDelete = async (type, id) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return;
    try {
      await fetch(`${type === 'resume' ? API_ROUTES.RESUMES : API_ROUTES.COVER_LETTERS}/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (type === 'resume') setResumes(resumes.filter(r => r._id !== id));
      else setLetters(letters.filter(l => l._id !== id));
      toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const success = await updateProfile(profileForm);
    if (success) {
      toast.success(language === 'ar' ? 'تم تحديث البيانات' : 'Profile updated');
    } else {
      toast.error(language === 'ar' ? 'فشل التحديث' : 'Update failed');
    }
  };

  const handleCreateResume = () => {
    const userPlan = user?.plan || 'free';
    const isPremium = userPlan !== 'free';

    // Check subscription expiry for Premium users
    if (isPremium && user?.subscriptionEndDate) {
      const now = new Date();
      if (new Date(user.subscriptionEndDate) < now) {
        toast.error(language === 'ar' 
          ? 'انتهت صلاحية اشتراكك. يرجى تجديد الاشتراك.' 
          : 'Your subscription has expired. Please renew.'
        );
        setActiveTab('pricing');
        return;
      }
    }

    const credits = user?.resumeCredits || 0;

    if (credits <= 0) {
      toast.error(language === 'ar' 
        ? 'رصيدك من السير الذاتية قد نفد. يرجى الدفع للحصول على رصيد إضافي.' 
        : 'Your resume credits have been exhausted. Please pay to add more.'
      );
      setPaymentModalOpen(true);
      return;
    }

    // Check Global Access (Admin Toggle)
    if (!isPremium && !isFreeAllowed) {
      toast.error(language === 'ar' ? 'إنشاء السير الذاتية متاح للمشتركين فقط حالياً.' : 'Resume creation is currently for Pro users only.');
      setActiveTab('pricing');
      return;
    }

    resetResume();
    resetStyles();
    navigate('/builder/resume');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    const success = await updateProfile({ password: passwordForm.newPassword });
    if (success) {
      toast.success(language === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
      setPasswordOpen(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } else {
      toast.error(language === 'ar' ? 'فشل تغيير كلمة المرور' : 'Failed to change password');
    }
  };

  const filteredDocs = [
    ...resumes.map(r => ({ ...r, type: 'resume' })),
    ...letters.map(l => ({ ...l, type: 'letter' }))
  ].filter(doc => 
    (doc.title || doc.content?.personalInfo?.fullName || 'Untitled')
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
  );

  const sidebarLinks = [
    { id: 'documents', label: language === 'ar' ? 'مستنداتي' : 'My Documents', icon: <FileText size={20} /> },
    { id: 'templates', label: language === 'ar' ? 'القوالب' : 'Templates', icon: <Layout size={20} /> },
    { id: 'cv-scan', label: language === 'ar' ? 'فحص السيرة الذاتية' : 'CV Scanner', icon: <ScanSearch size={20} /> },
    { id: 'pricing', label: language === 'ar' ? 'الباقات' : 'Pricing', icon: <CreditCard size={20} /> },
    { id: 'settings', label: language === 'ar' ? 'الإعدادات' : 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: 'calc(100vh - 56px)', background: 'var(--bg-app)', position: 'relative' }}>
      
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside 
        className={`dashboard-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}
        style={{ 
          width: '280px', 
          background: 'var(--bg-surface)', 
          borderInlineEnd: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 72px)',
          position: 'sticky',
          top: '72px',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          overflow: 'hidden'
        }}
      >
        {isMobile && (
          <button 
            className="dashboard-sidebar-close"
            onClick={() => setMobileSidebarOpen(false)}
            style={{ position: 'absolute', top: '15px', [language === 'ar' ? 'left' : 'right']: '15px', zIndex: 1100 }}
          >
            <X size={20} />
          </button>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 16px' }}>
          <div style={{ padding: '0 0 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 800, flexShrink: 0 }}>
              {user?.fullName?.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.fullName}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {user?.plan === 'business' 
                  ? (language === 'ar' ? 'باقة: أعمال شهري' : 'Plan: Business Monthly')
                  : user?.plan === 'pro' 
                    ? (language === 'ar' ? 'باقة: شهري احترافي' : 'Plan: Pro Monthly') 
                    : (language === 'ar' ? 'الخطة المجانية' : 'Free Plan')
                }
              </div>
            </div>
          </div>
 
          {/* ── Subscription Status Widget ────────────────── */}
          <div style={{ padding: '0 0 16px' }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.04)',
              borderRadius: '20px',
              padding: '16px',
              border: '1px solid rgba(59, 130, 246, 0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Zap size={16} color="#3B82F6" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {language === 'ar' ? 'عداد السير الذاتية' : 'Resume Counter'}
                </span>
                <span style={{ 
                  fontSize: '9px', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  background: user?.plan === 'business' 
                    ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
                    : user?.plan === 'pro' 
                      ? 'linear-gradient(135deg, #fbbf24, #d97706)' 
                      : 'rgba(100,116,139,0.1)',
                  color: user?.plan !== 'free' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 900,
                  marginLeft: language === 'ar' ? '0' : 'auto',
                  marginRight: language === 'ar' ? 'auto' : '0'
                }}>
                  {user?.plan === 'business' 
                    ? (language === 'ar' ? 'أعمال' : 'BIZ') 
                    : user?.plan === 'pro' 
                      ? (language === 'ar' ? 'احترافي' : 'PRO') 
                      : (language === 'ar' ? 'مجاني' : 'FREE')
                  }
                </span>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>
                    {language === 'ar' 
                      ? `المتبقي: ${user?.resumeCredits || 0}` 
                      : `Remaining: ${user?.resumeCredits || 0}`
                    }
                  </span>
                </div>
                <div style={{ height: '5px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: user?.resumeCredits > 0 ? '100%' : '0%', 
                    height: '100%', 
                    background: user?.resumeCredits > 0 ? 'linear-gradient(90deg, #10B981, #059669)' : 'var(--text-muted)',
                    borderRadius: '10px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {user?.subscriptionEndDate && (
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={12} color="#64748b" />
                  <span>
                    {language === 'ar' ? 'ينتهي:' : 'Ends:'} {new Date(user.subscriptionEndDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Quick Actions ────────────────────────────────── */}
          <div style={{ padding: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleCreateResume}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '16px',
                border: '1px solid var(--border-default)',
                background: 'linear-gradient(135deg, var(--bg-card), var(--bg-app))',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: language === 'ar' ? 'right' : 'left',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Plus size={18} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{language === 'ar' ? 'سيرة جديدة' : 'New Resume'}</div>
              </div>
            </button>

            <button
              onClick={() => { resetLetter(); navigate('/builder/cover-letter'); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '16px',
                border: '1px solid var(--border-default)',
                background: 'linear-gradient(135deg, var(--bg-card), var(--bg-app))',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: language === 'ar' ? 'right' : 'left',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={18} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{language === 'ar' ? 'رسالة تغطية' : 'Cover Letter'}</div>
              </div>
            </button>
          </div>

          <div style={{ height: '1px', background: 'var(--border-default)', margin: '0 0 16px', opacity: 0.4 }} />

          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              className="sidebar-link"
              onClick={() => { setActiveTab(link.id); if(isMobile) setMobileSidebarOpen(false); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === link.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                color: activeTab === link.id ? '#3B82F6' : 'var(--text-secondary)',
                cursor: 'pointer',
                marginBottom: '4px',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                textAlign: language === 'ar' ? 'right' : 'left'
              }}
            >
              <span style={{ opacity: activeTab === link.id ? 1 : 0.6 }}>{link.icon}</span>
              {link.label}
            </button>
          ))}

          <div style={{ height: '1px', background: 'var(--border-default)', margin: '12px 0', opacity: 0.4 }} />

          <button 
            onClick={() => logout()}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              color: '#EF4444',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <LogOut size={20} />
            {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000
          }}
        />
      )}

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="dashboard-main" style={{ flex: 1, padding: '40px 32px', overflowY: 'auto', position: 'relative' }}>
        {isMobile && (
          <button 
            className="mobile-sidebar-toggle"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <LayoutGrid size={24} />
          </button>
        )}
        <AnimatePresence mode="wait">
          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header / Top Bar */}
              <div className="dashboard-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                  <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    {language === 'ar' ? `مرحباً بك، ${user?.fullName?.split(' ')[0] || 'مستخدم'}` : `Welcome back, ${user?.fullName?.split(' ')[0] || 'User'}`} 👋
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                    {language === 'ar' 
                      ? 'إليك نظرة عامة على سيرتك الذاتية ومستنداتك الأخيرة.' 
                      : 'Here is an overview of your recent resumes and cover letters.'}
                  </p>
                </div>
                
                <div className="search-wrapper" style={{ position: 'relative', width: '300px' }}>
                  <Search size={18} style={{ position: 'absolute', left: language === 'ar' ? 'auto' : '16px', right: language === 'ar' ? '16px' : 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder={language === 'ar' ? 'ابحث في مستنداتك...' : 'Search documents...'}
                    className="form-input"
                    style={{ 
                      paddingLeft: language === 'ar' ? '16px' : '44px',
                      paddingRight: language === 'ar' ? '44px' : '16px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      height: '44px',
                      width: '100%'
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Stats & Quick Overview */}
              <div className="stats-row" style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
                <div className="stat-item" style={{ padding: '20px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '16px', flex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>{language === 'ar' ? 'إجمالي السير' : 'Total Resumes'}</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{resumes.length}</div>
                  </div>
                </div>
                <div className="stat-item" style={{ padding: '20px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '16px', flex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>{language === 'ar' ? 'رسائل التغطية' : 'Cover Letters'}</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{letters.length}</div>
                  </div>
                </div>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
                {language === 'ar' ? 'المستندات الأخيرة' : 'Recent Documents'}
              </h2>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                  <div className="animate-pulse">{language === 'ar' ? 'جاري التحميل...' : 'Syncing with cloud...'}</div>
                </div>
              ) : (
                <div className="doc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                  
                  {/* Existing Documents */}
                  {filteredDocs.map(doc => (
                    <motion.div 
                      key={doc._id} 
                      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}
                      onClick={() => navigate(`/builder/${doc.type === 'resume' ? 'resume' : 'cover-letter'}?id=${doc._id}`)}
                      style={{ 
                        height: '180px',
                        padding: '24px', 
                        background: 'var(--bg-card)', 
                        border: '1px solid var(--border-default)', 
                        borderRadius: '16px', 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'auto' }}>
                        <div style={{ 
                          width: '44px', 
                          height: '44px', 
                          borderRadius: '12px', 
                          background: doc.type === 'resume' ? 'rgba(59,130,246,0.08)' : 'rgba(139,92,246,0.08)', 
                          color: doc.type === 'resume' ? '#3B82F6' : '#8B5CF6', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          {doc.type === 'resume' ? <FileText size={20} /> : <Zap size={20} />}
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(doc.type, doc._id); }} 
                          style={{ background: 'var(--bg-elevated)', padding: '6px', borderRadius: '6px', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 1, transition: 'all 0.2s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                          className="delete-hover-btn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.title || doc.content?.personalInfo?.fullName || 'Untitled'}
                        </h3>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} color="#10B981" /> {language === 'ar' ? 'تم الحفظ سحابياً' : 'Saved to Cloud'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'cv-scan' && (
            <motion.div
              key="cv-scan"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <CVScanPanel language={language} />
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
                    {language === 'ar' ? 'تصفح القوالب' : 'Browse Templates'}
                  </h1>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {language === 'ar' ? 'اختر القالب المثالي لمسيرتك المهنية' : 'Choose the perfect layout for your career path'}
                  </p>
                </div>
              </div>

              <div className="doc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {TEMPLATE_LIST.filter(t => (templateSettings[t.id]?.enabled !== false)).map((tpl) => {
                  const isPremium = templateSettings[tpl.id]?.isPremium ?? tpl.isPremium;
                  return (
                    <div 
                      key={tpl.id}
                      style={{
                        background: 'var(--bg-surface)',
                        borderRadius: '20px',
                        border: '1px solid var(--border-default)',
                        padding: '16px',
                        position: 'relative',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isPremium && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '4px 8px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          zIndex: 5
                        }}>
                          <Crown size={12} /> PRO
                        </div>
                      )}
                      
                      <div style={{
                        height: '180px',
                        background: 'var(--bg-app)',
                        borderRadius: '12px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px',
                        color: tpl.color,
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {tpl.icon}
                        {/* Lock overlay for free users on premium templates */}
                        {isPremium && user?.plan !== 'pro' && (
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            pointerEvents: 'none',
                            transition: 'all 0.5s ease',
                            zIndex: 5
                          }}>
                            <div style={{
                              background: 'var(--bg-elevated)',
                              padding: '6px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-default)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <LockIcon size={16} color="var(--text-secondary)" />
                            </div>
                          </div>
                        )}
                      </div>

                      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                        {language === 'ar' ? tpl.labelAr || tpl.label : tpl.label}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        {tpl.type === 'ats' ? 'ATS Optimized' : 'Modern Design'}
                      </p>

                      <button 
                        onClick={() => {
                          if (isPremium && user?.plan !== 'pro') {
                            setActiveTab('pricing');
                            toast.error(language === 'ar' ? 'هذا القالب مخصص لمشتركي Pro' : 'This template is for Pro users');
                          } else {
                            handleCreateResume();
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          border: 'none',
                          background: (isPremium && user?.plan !== 'pro') 
                            ? 'rgba(100,116,139,0.15)' 
                            : isPremium 
                              ? 'linear-gradient(135deg, #fbbf24, #d97706)' 
                              : 'var(--bg-elevated)',
                          color: (isPremium && user?.plan !== 'pro') 
                            ? 'var(--text-secondary)' 
                            : isPremium ? '#fff' : 'var(--text-primary)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {(isPremium && user?.plan !== 'pro') && <LockIcon size={14} />}
                        {(isPremium && user?.plan !== 'pro') 
                          ? (language === 'ar' ? 'يتطلب اشتراك Pro' : 'Requires Pro')
                          : (language === 'ar' ? 'استخدام هذا القالب' : 'Use Template')
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'pricing' && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>{language === 'ar' ? 'باقات الاشتراك' : 'Upgrade your Plan'}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {language === 'ar' ? 'افتح جميع الميزات والقوالب الاحترافية' : 'Unlock all premium templates and AI features.'}
                </p>
              </div>

              <div className="pricing-grid-dynamic" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
                {(cmsSettings?.pricingPlans || []).map((plan, i) => (
                  <div key={i} className="feature-card" style={{ 
                    padding: '40px', 
                    background: plan.popular ? 'var(--bg-elevated)' : 'var(--bg-surface)', 
                    border: plan.popular ? '2px solid #3B82F6' : '1px solid var(--border-default)', 
                    borderRadius: '24px',
                    position: 'relative'
                  }}>
                    {plan.popular && (
                      <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#3B82F6', color: '#fff', padding: '6px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Star size={14} fill="currentColor" /> {language === 'ar' ? 'الأكثر شيوعاً' : 'Most Popular'}
                      </div>
                    )}
                    <div style={{ 
                      width: '60px', height: '60px', borderRadius: '16px', 
                      background: plan.popular ? '#3B82F6' : 'rgba(59,130,246,0.1)', 
                      color: plan.popular ? '#fff' : '#3B82F6', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
                    }}>
                      {plan.iconKey === 'Zap' && <Zap size={24} />}
                      {plan.iconKey === 'Crown' && <Crown size={24} />}
                      {plan.iconKey === 'Building2' && <Building2 size={24} />}
                    </div>
                    <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px', textAlign: 'center', color: 'var(--text-primary)' }}>{language === 'ar' ? plan.nameAr : plan.nameEn}</h3>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>{language === 'ar' ? plan.descriptionAr : plan.descriptionEn}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '4px', marginBottom: '32px' }}>
                       <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-secondary)' }}>{language === 'ar' ? plan.currencyAr : plan.currencyEn}</span>
                       <span style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)' }}>{plan.price}</span>
                       <span style={{ color: 'var(--text-muted)' }}>{language === 'ar' ? plan.periodAr : plan.periodEn}</span>
                    </div>

                    <button 
                      className={plan.popular ? 'btn-premium' : 'btn-secondary'} 
                      style={{ width: '100%', marginBottom: '32px' }}
                      onClick={() => {
                        if (plan.id === 'free') return; // Do nothing for free or navigate to builder
                        setPaymentAmount(plan.price);
                        setPaymentModalOpen(true);
                      }}
                    >
                      {language === 'ar' ? plan.ctaAr : plan.ctaEn}
                    </button>

                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {plan.features.map((f, fi) => (
                        <li key={fi} style={{ 
                          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', 
                          fontSize: '15px', color: f.included ? 'var(--text-secondary)' : 'var(--text-muted)',
                          textDecoration: f.included ? 'none' : 'line-through'
                        }}>
                          {f.included 
                            ? <Check size={18} color="#10B981" /> 
                            : <X size={18} color="var(--text-muted)" opacity={0.5} />
                          } 
                          {language === 'ar' ? f.textAr : f.textEn}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '32px' }}>{language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}</h1>
              
              <div style={{ display: 'grid', gap: '32px', maxWidth: '800px' }}>
                <form onSubmit={handleUpdateProfile} style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-default)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={20} color="#3B82F6" /> {language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
                  </h3>
                  <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                      <label className="form-label">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={profileForm.fullName} 
                        onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={profileForm.email} 
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>
                  <button className="btn-premium" type="submit">
                    {language === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
                  </button>
                </form>

                <div style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-default)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={20} color="#10B981" /> {language === 'ar' ? 'الأمان والخصوصية' : 'Security & Privacy'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                    {language === 'ar' ? 'يمكنك تغيير كلمة المرور الخاصة بك أو تفعيل المصادقة الثنائية.' : 'Manage your password and two-factor authentication.'}
                  </p>
                  <button className="btn-secondary" onClick={() => setPasswordOpen(true)}>
                    {language === 'ar' ? 'تغيير كلمة المرور' : 'Update Password'}
                  </button>
                </div>
              </div>

              {/* ── Change Password Modal ── */}
              <AnimatePresence>
                {passwordOpen && (
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '24px', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                    >
                      <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>
                         {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                      </h3>
                      <form onSubmit={handlePasswordChange}>
                        <div style={{ marginBottom: '20px' }}>
                          <label className="form-label">{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                          <input 
                            type="password" 
                            className="form-input" 
                            placeholder="••••••••"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            required
                            autoFocus
                          />
                        </div>
                        <div style={{ marginBottom: '32px' }}>
                          <label className="form-label">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                          <input 
                            type="password" 
                            className="form-input" 
                            placeholder="••••••••"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            required
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button type="button" className="btn-secondary" onClick={() => setPasswordOpen(false)}>
                                {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button type="submit" className="btn-premium">
                                {language === 'ar' ? 'حفظ' : 'Save'}
                            </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <PaymentModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => setPaymentModalOpen(false)} 
          amount={paymentAmount}
        />
      </main>
    </div>
  );
}
