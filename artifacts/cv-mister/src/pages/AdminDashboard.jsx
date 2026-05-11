// ============================================================
// CV-Mister — Admin Dashboard Page (V2 Premium)
// Premium Dark Mode SaaS Admin Panel
// Full glassmorphism redesign with micro-animations,
// responsive layout, charts, and polished Settings panel
// ============================================================
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/Admin/AdminSidebar';
import StatsCards from '../components/Admin/StatsCards';
import PaymentTable from '../components/Admin/PaymentTable';
import TemplateControl from '../components/Admin/TemplateControl';
import UsersTable from '../components/Admin/UsersTable';
import CMSControl from '../components/Admin/CMSControl';
import MessagesTable from '../components/Admin/MessagesTable';
import toast from 'react-hot-toast';
import {
  FiActivity, FiCalendar, FiBell, FiUser, FiSave,
  FiGlobe, FiDatabase, FiServer, FiSearch, FiMaximize2,
  FiMoon, FiSun, FiZap, FiRefreshCw, FiMail, FiMenu
} from 'react-icons/fi';
import { API_BASE_URL } from '../api/config';

// ── Settings Panel ──────────────────────────────────────────
function SettingsPanel() {
  const [settings, setSettings] = useState({
    siteName: 'CV-Mister',
    siteDescription: 'أنشئ سيرتك الذاتية الاحترافية في دقائق',
    defaultLanguage: 'ar',
    maintenanceMode: false,
    maxFreeResumes: 1,
    premiumPrice: 25,
    supportEmail: 'support@cv-mister.com',
    smtpEnabled: true,
    autoApprove: false,
    isFreeAllowed: true, // New setting
  });
  const [isSaving, setIsSaving] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('تم حفظ الإعدادات بنجاح');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('فشل حفظ الإعدادات');
    }
    setIsSaving(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    color: '#f1f5f9',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  };

  const SETTINGS_TABS = [
    { key: 'general', label: 'عام', icon: FiGlobe },
    { key: 'billing', label: 'الاشتراكات', icon: FiDatabase },
    { key: 'system',  label: 'النظام', icon: FiServer },
  ];

  // Toggle switch component inline
  const ToggleSwitch = ({ value, onChange, color = 'indigo' }) => {
    const colors = {
      indigo: { on: 'linear-gradient(135deg, #6366f1, #8b5cf6)', shadow: 'rgba(99,102,241,0.3)' },
      red:    { on: 'linear-gradient(135deg, #ef4444, #dc2626)', shadow: 'rgba(239,68,68,0.3)' },
      green:  { on: 'linear-gradient(135deg, #10b981, #059669)', shadow: 'rgba(16,185,129,0.3)' },
    };
    const c = colors[color];
    return (
      <button
        onClick={onChange}
        style={{
          width: '46px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer',
          background: value ? c.on : 'rgba(255,255,255,0.06)',
          position: 'relative', transition: 'all 0.3s',
          boxShadow: value ? `0 2px 8px ${c.shadow}` : 'none',
        }}
      >
        <div style={{
          width: '22px', height: '22px', borderRadius: '50%', background: '#fff',
          position: 'absolute', top: '2px',
          left: value ? '22px' : '2px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </button>
    );
  };

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(24px)',
      borderRadius: '18px',
      border: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
    }}>
      {/* Settings Header + Tabs */}
      <div style={{
        padding: '22px 28px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
            الإعدادات العامة
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
            تعديل إعدادات الموقع والنظام
          </p>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = settingsTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSettingsTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '10px 10px 0 0',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: 'inherit',
                  background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                  color: isActive ? '#c7d2fe' : '#64748b',
                  borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Content */}
      <div style={{ padding: '28px' }}>
        {settingsTab === 'general' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>
                <FiGlobe size={12} />
                اسم الموقع
              </label>
              <input
                style={inputStyle}
                value={settings.siteName}
                onChange={(e) => updateSetting('siteName', e.target.value)}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>
                <FiMail size={12} />
                البريد الداعم
              </label>
              <input
                style={inputStyle}
                value={settings.supportEmail}
                onChange={(e) => updateSetting('supportEmail', e.target.value)}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>وصف الموقع</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                value={settings.siteDescription}
                onChange={(e) => updateSetting('siteDescription', e.target.value)}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>اللغة الافتراضية</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                value={settings.defaultLanguage}
                onChange={(e) => updateSetting('defaultLanguage', e.target.value)}
              >
                <option value="ar" style={{ background: '#1e293b' }}>العربية</option>
                <option value="en" style={{ background: '#1e293b' }}>English</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>
                <FiMail size={12} />
                إرسال البريد (SMTP)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <ToggleSwitch
                  value={settings.smtpEnabled}
                  onChange={() => updateSetting('smtpEnabled', !settings.smtpEnabled)}
                  color="green"
                />
                <span style={{ fontSize: '13px', fontWeight: 500, color: settings.smtpEnabled ? '#34d399' : '#64748b' }}>
                  {settings.smtpEnabled ? 'مُفعَّل' : 'معطَّل'}
                </span>
              </div>
            </div>
          </div>
        )}

        {settingsTab === 'billing' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>سعر الباقة الاحترافية ($)</label>
              <input
                type="number"
                style={inputStyle}
                value={settings.premiumPrice}
                onChange={(e) => updateSetting('premiumPrice', parseInt(e.target.value))}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>
                <FiDatabase size={12} />
                الحد الأقصى للمجانيين
              </label>
              <input
                type="number"
                style={inputStyle}
                value={settings.maxFreeResumes}
                onChange={(e) => updateSetting('maxFreeResumes', parseInt(e.target.value))}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>الموافقة التلقائية</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <ToggleSwitch
                  value={settings.autoApprove}
                  onChange={() => updateSetting('autoApprove', !settings.autoApprove)}
                  color="indigo"
                />
                <span style={{ fontSize: '13px', fontWeight: 500, color: settings.autoApprove ? '#a5b4fc' : '#64748b' }}>
                  {settings.autoApprove ? 'تفعيل تلقائي بعد الدفع' : 'مراجعة يدوية'}
                </span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>السيرة الأولى مجانية</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <ToggleSwitch
                  value={settings.isFreeAllowed}
                  onChange={() => updateSetting('isFreeAllowed', !settings.isFreeAllowed)}
                  color="green"
                />
                <span style={{ fontSize: '13px', fontWeight: 600, color: settings.isFreeAllowed ? '#34d399' : '#f87171' }}>
                  {settings.isFreeAllowed ? 'مسموح بسيرة واحدة مجاناً' : 'لا يوجد سيرة مجانية (الدفع أولاً)'}
                </span>
              </div>
            </div>
          </div>
        )}

        {settingsTab === 'system' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>
                <FiServer size={12} />
                وضع الصيانة
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <ToggleSwitch
                  value={settings.maintenanceMode}
                  onChange={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
                  color="red"
                />
                <span style={{
                  fontSize: '13px', fontWeight: 600,
                  color: settings.maintenanceMode ? '#f87171' : '#64748b',
                }}>
                  {settings.maintenanceMode ? '⚠️ وضع الصيانة مُفعَّل' : 'معطَّل'}
                </span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>إصدار النظام</label>
              <div style={{
                ...inputStyle,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#64748b',
                cursor: 'default',
              }}>
                <FiZap size={13} color="#6366f1" />
                <span style={{ color: '#94a3b8' }}>CV-Mister v2.1.0</span>
                <span style={{
                  marginRight: 'auto',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  background: 'rgba(52,211,153,0.1)',
                  color: '#34d399',
                }}>
                  STABLE
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div style={{
        padding: '16px 28px 22px',
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 28px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            cursor: isSaving ? 'wait' : 'pointer',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
            opacity: isSaving ? 0.7 : 1,
          }}
          onMouseEnter={(e) => { if(!isSaving) e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {isSaving ? <FiRefreshCw size={16} style={{ animation: 'paymentSpinner 1s linear infinite' }} /> : <FiSave size={16} />}
          {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>
    </div>
  );
}

// ── Recent Activity Widget (Enhanced) ───────────────────────
function RecentActivity() {
  const activities = [
    { id: 1, text: 'أحمد محمد قام بإنشاء سيرة ذاتية جديدة',     time: 'منذ 5 دقائق',  type: 'create' },
    { id: 2, text: 'تم تفعيل حساب سارة حسين (Premium)',           time: 'منذ 15 دقائق', type: 'approve' },
    { id: 3, text: 'نور الدين رفع حوالة جديدة بانتظار المراجعة',  time: 'منذ ساعة',     type: 'payment' },
    { id: 4, text: 'تسجيل مستخدم جديد: محمد عبدالله',             time: 'منذ ساعتين',   type: 'register' },
    { id: 5, text: 'أحمد قام بتنزيل سيرته كـ PDF',                time: 'منذ 3 ساعات',  type: 'download' },
    { id: 6, text: 'ريم عبدالله ترقت إلى خطة Premium',             time: 'منذ 4 ساعات',  type: 'upgrade' },
  ];

  const typeConfig = {
    create:   { color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  label: 'إنشاء' },
    approve:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  label: 'تفعيل' },
    payment:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'دفع' },
    register: { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   label: 'تسجيل' },
    download: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  label: 'تنزيل' },
    upgrade:  { color: '#ec4899', bg: 'rgba(236,72,153,0.12)',  label: 'ترقية' },
  };

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(24px)',
      borderRadius: '18px',
      border: '1px solid rgba(255,255,255,0.06)',
      padding: '22px 24px',
      height: 'fit-content',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '18px',
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#f8fafc',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FiActivity size={14} color="#818cf8" />
          </div>
          آخر النشاط
        </h3>
        <span style={{
          fontSize: '11px',
          color: '#475569',
          fontWeight: 500,
          padding: '4px 10px',
          borderRadius: '6px',
          background: 'rgba(255,255,255,0.03)',
        }}>
          مباشر
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {activities.map((activity, index) => {
          const config = typeConfig[activity.type];
          return (
            <div
              key={activity.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 0',
                borderBottom: index < activities.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {/* Type Badge */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: config.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: config.color,
                  boxShadow: `0 0 8px ${config.color}50`,
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '13px',
                  color: '#e2e8f0',
                  lineHeight: '1.5',
                  fontWeight: 500,
                }}>
                  {activity.text}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '4px',
                }}>
                  <span style={{ fontSize: '11px', color: '#475569' }}>{activity.time}</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: config.color,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: config.bg,
                  }}>
                    {config.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Quick Stats Bar (Mini Overview) ─────────────────────────
function QuickOverview() {
  const items = [
    { label: 'اليوم', value: '14', sub: 'مستخدم جديد', color: '#6366f1' },
    { label: 'هذا الأسبوع', value: '87', sub: 'سيرة ذاتية', color: '#06b6d4' },
    { label: 'معدل التحويل', value: '24%', sub: 'من مجاني لبريميوم', color: '#10b981' },
  ];

  return (
    <div className="admin-grid-3">
      {items.map((item, i) => (
        <div key={i} style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(24px)',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '18px 20px',
          transition: 'all 0.2s',
        }}>
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.05em' }}>
            {item.label}
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: item.color, letterSpacing: '-0.03em' }}>
            {item.value}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
            {item.sub}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Admin Dashboard ────────────────────────────────────
export default function AdminDashboard({ stats, payments, users, templates }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Shared refresh key — incremented when any child modifies user/payment state
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(k => k + 1);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ── Auto-clean ahmedyes limits ────────────────────────────
  useEffect(() => {
    const cleanAhmedyes = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          window.location.href = '/admin/login';
          return;
        }
        
        // Fetch users to find ahmedyes ID
        const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 403) {
           window.location.href = '/admin/login';
           return;
        }

        const data = await res.json();
        if (data.success && data.data) {
          const adminObj = data.data.find(u => u.username === 'ahmedyes' || u.email?.includes('ahmedyes'));
          if (adminObj) {
            await fetch(`${API_BASE_URL}/api/admin/unblock-user/${adminObj._id}`, {
              method: 'PUT',
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Admin ahmedyes reset triggered.');
          }
        }
      } catch (err) {
        console.error('Ahmedyes auto-reset failed:', err);
      }
    };
    cleanAhmedyes();
  }, []);

  // ── Fetch Dashboard Stats ────────────────────────────────
  const [liveStats, setLiveStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    pendingRequests: 0,
    totalTemplates: 23
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setLiveStats(data.data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, [refreshKey]);

  const contentMargin = sidebarCollapsed ? '76px' : '272px';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <StatsCards stats={liveStats} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', marginBottom: '24px' }}>
              <PaymentTable refreshKey={refreshKey} onDataChange={triggerRefresh} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <RecentActivity />
                <QuickOverview />
              </div>
            </div>
          </>
        );
      case 'users':
        return <UsersTable users={users} refreshKey={refreshKey} onDataChange={triggerRefresh} />;
      case 'cms':
        return <CMSControl />;
      case 'payments':
        return <PaymentTable refreshKey={refreshKey} onDataChange={triggerRefresh} />;
      case 'templates':
        return <TemplateControl templates={templates} />;
      case 'messages':
        return <MessagesTable />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  const TAB_TITLES = {
    dashboard: 'لوحة التحكم',
    cms:       'إدارة محتوى الموقع',
    users:     'إدارة المستخدمين',
    payments:  'طلبات التفعيل',
    templates: 'التحكم في القوالب',
    messages:  'رسائل المستخدمين',
    settings:  'الإعدادات العامة',
  };

  const TAB_DESCRIPTIONS = {
    dashboard: 'نظرة عامة على أداء المنصة',
    cms:       'إدارة صفحات الموقع وتعديل النصوص والصور',
    users:     'إدارة وتتبع المستخدمين المسجلين',
    payments:  'مراجعة طلبات الدفع والتفعيل',
    templates: 'تفعيل وتعطيل قوالب السيرة الذاتية',
    messages:  'إدارة الرسائل الواردة من صفحة اتصل بنا',
    settings:  'تعديل إعدادات الموقع والنظام',
  };

  return (
    <>
      <style>{`
        @keyframes adminPageEntry {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-page-content {
          animation: adminPageEntry 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes paymentSpinner {
          to { transform: rotate(360deg); }
        }
        /* Scrollbar */
        .admin-main::-webkit-scrollbar {
          width: 6px;
        }
        .admin-main::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-main::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 3px;
        }
        .admin-main::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.12);
        }
        /* Prevent Navbar overlap */
        .admin-dashboard-root {
          margin-top: -72px;
          padding-top: 0;
        }
      `}</style>

      <div
        className="admin-dashboard-root"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: "'IBM Plex Sans Arabic', 'Inter', sans-serif",
          direction: 'rtl',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `radial-gradient(rgba(99,102,241,0.03) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={isMobileSidebarOpen}
        />

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="admin-mobile-overlay"
            onClick={() => setMobileSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
            }}
          />
        )}

        {/* Main Content Area */}
        <main
          className={`admin-main ${isMobileSidebarOpen ? 'mobile-sidebar-open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
          style={{
            padding: '32px 36px',
            transition: 'margin-right 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            minHeight: '100vh',
            position: 'relative',
            zIndex: 1,
          }}
        >

          <button 
            className="admin-mobile-toggle"
            onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            {isMobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* ── Top Bar ────────────────────────────────────── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
          }}>
            <div>
              <h1 style={{
                fontSize: '26px',
                fontWeight: 800,
                color: '#f8fafc',
                margin: 0,
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
              }}>
                {TAB_TITLES[activeTab]}
              </h1>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: '6px 0 0',
                fontWeight: 500,
              }}>
                {TAB_DESCRIPTIONS[activeTab]}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Search Button */}
              <button style={{
                width: '40px', height: '40px', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.03)',
                color: '#94a3b8', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = '#818cf8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <FiSearch size={17} />
              </button>

              {/* Date */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '9px 16px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#94a3b8', fontSize: '13px', fontWeight: 500,
              }}>
                <FiCalendar size={14} />
                {currentTime.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              {/* Notification Bell */}
              <button style={{
                width: '40px', height: '40px', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.03)',
                color: '#94a3b8', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', transition: 'all 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = '#818cf8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <FiBell size={17} />
                <div style={{
                  position: 'absolute', top: '7px', left: '7px',
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#ef4444',
                  boxShadow: '0 0 8px rgba(239,68,68,0.5)',
                }} />
              </button>

              {/* Admin Avatar */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(99,102,241,0.35)',
                position: 'relative',
              }}>
                <FiUser size={17} color="#fff" />
                <div style={{
                  position: 'absolute', bottom: '-1px', left: '-1px',
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: '#22c55e', border: '2px solid #0f172a',
                }} />
              </div>
            </div>
          </div>

          {/* ── Tab Content ────────────────────────────────── */}
          <div className="admin-page-content" key={activeTab}>
            {renderContent()}
          </div>
        </main>
      </div>
    </>
  );
}
