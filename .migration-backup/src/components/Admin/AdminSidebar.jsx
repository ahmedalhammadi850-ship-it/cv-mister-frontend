// ============================================================
// CV-Mister — Admin Sidebar (V2 Premium)
// Glassmorphism dark sidebar with animated nav, RTL-first
// ============================================================
import React, { useState } from 'react';
import {
  FiHome, FiUsers, FiCreditCard, FiLayout, FiSettings,
  FiChevronLeft, FiChevronRight, FiLogOut, FiShield,
  FiZap, FiEdit3, FiMail
} from 'react-icons/fi';

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'الرئيسية',        icon: FiHome,       badge: null },
  { id: 'cms',        label: 'إدارة المحتوى',    icon: FiEdit3,      badge: null },
  { id: 'messages',   label: 'الرسائل',          icon: FiMail,       badge: null },
  { id: 'users',      label: 'المستخدمين',      icon: FiUsers,      badge: null },
  { id: 'payments',   label: 'طلبات التفعيل',    icon: FiCreditCard, badge: 4 },
  { id: 'templates',  label: 'القوالب',          icon: FiLayout,     badge: null },
  { id: 'settings',   label: 'الإعدادات العامة', icon: FiSettings,   badge: null },
];

export default function AdminSidebar({ activeTab, setActiveTab, collapsed, setCollapsed, mobileOpen }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  const sidebarWidth = collapsed ? '76px' : '272px';

  return (
    <>
      {/* Inject keyframes */}
      <style>{`
        @keyframes adminSidebarPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes adminSidebarGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.15); }
          50% { box-shadow: 0 0 40px rgba(99,102,241,0.25); }
        }
        @keyframes adminBadgePop {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .admin-sidebar-item:hover {
          background: rgba(255,255,255,0.04) !important;
        }
      `}</style>

      <aside
        className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'admin-sidebar-mobile-active' : ''}`}
        style={{
          width: sidebarWidth,
          height: '100vh',
          background: 'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.95) 100%)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(99, 102, 241, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 50,
          overflow: 'hidden',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.3)',
        }}
      >
        {/* ── Logo / Brand ─────────────────────────────────── */}
        <div style={{
          padding: collapsed ? '28px 18px' : '28px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          minHeight: '88px',
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
            animation: 'adminSidebarGlow 3s ease-in-out infinite',
          }}>
            <FiShield size={20} color="#fff" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{
                fontSize: '17px',
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
              }}>
                CV-Mister
              </div>
              <div style={{
                fontSize: '11px',
                color: '#818cf8',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: '2px',
              }}>
                <FiZap size={10} style={{ verticalAlign: 'middle', marginLeft: '3px' }} />
                Admin Panel
              </div>
            </div>
          )}
        </div>

        {/* ── Section Label ────────────────────────────────── */}
        {!collapsed && (
          <div style={{
            padding: '20px 24px 8px',
            fontSize: '10px',
            fontWeight: 700,
            color: '#475569',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            القائمة الرئيسية
          </div>
        )}

        {/* ── Navigation Items ─────────────────────────────── */}
        <nav style={{
          flex: 1,
          padding: collapsed ? '8px 10px' : '4px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const isHovered = hoveredItem === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className="admin-sidebar-item"
                onClick={() => setActiveTab(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '13px 18px' : '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'right',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))'
                    : 'transparent',
                  color: isActive ? '#c7d2fe' : '#94a3b8',
                  position: 'relative',
                  overflow: 'hidden',
                  fontFamily: 'inherit',
                  transform: isHovered && !isActive ? 'translateX(-2px)' : 'none',
                }}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '24px',
                    borderRadius: '4px 0 0 4px',
                    background: 'linear-gradient(180deg, #6366f1, #a78bfa)',
                    boxShadow: '0 0 12px rgba(99,102,241,0.5)',
                  }} />
                )}

                {/* Icon Container */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))'
                    : 'transparent',
                  transition: 'all 0.25s',
                }}>
                  <Icon
                    size={19}
                    style={{
                      transition: 'all 0.25s',
                      color: isActive ? '#a5b4fc' : (isHovered ? '#c7d2fe' : '#94a3b8'),
                    }}
                  />
                </div>

                {/* Label */}
                {!collapsed && (
                  <span style={{
                    fontSize: '13.5px',
                    fontWeight: isActive ? 700 : 500,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                    letterSpacing: '-0.01em',
                  }}>
                    {item.label}
                  </span>
                )}

                {/* Badge */}
                {item.badge && !collapsed && (
                  <div style={{
                    marginRight: 'auto',
                    minWidth: '22px',
                    height: '22px',
                    borderRadius: '7px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                    animation: 'adminBadgePop 0.4s ease-out',
                  }}>
                    {item.badge}
                  </div>
                )}

                {/* Badge dot (collapsed) */}
                {item.badge && collapsed && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    boxShadow: '0 0 8px rgba(239,68,68,0.6)',
                    animation: 'adminSidebarPulse 2s ease-in-out infinite',
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Bottom Section ───────────────────────────────── */}
        <div style={{
          padding: '12px 14px 20px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {/* Admin Info (when expanded) */}
          {!collapsed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 12px',
              marginBottom: '8px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                position: 'relative',
              }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>A</span>
                {/* Online Dot */}
                <div style={{
                  position: 'absolute',
                  bottom: '-1px',
                  left: '-1px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '2px solid #0f172a',
                }} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>الأدمن</div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>admin@cv-mister.com</div>
              </div>
            </div>
          )}

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '10px',
              padding: '11px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.04)',
              cursor: 'pointer',
              width: '100%',
              background: 'rgba(255,255,255,0.02)',
              color: '#64748b',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              fontSize: '12px',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
          >
            {collapsed ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
            {!collapsed && <span>طي القائمة</span>}
          </button>

          {/* Logout */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '10px',
              padding: '11px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              background: 'transparent',
              color: '#ef4444',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              fontSize: '12px',
              fontWeight: 500,
              opacity: 0.65,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.65'; e.currentTarget.style.background = 'transparent'; }}
          >
            <FiLogOut size={18} />
            {!collapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
