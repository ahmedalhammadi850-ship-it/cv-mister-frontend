// ============================================================
// CV-Mister — TemplateSwitcher (V2 with Premium Lock)
// Visual grid with lock overlay for premium templates
// Opens PaymentModal for free users on premium template click
// ============================================================

import React, { useState, useEffect } from 'react';
import { TEMPLATE_LIST } from '../../utils/constants';
import useStyleStore from '../../store/useStyleStore';
import { API_ROUTES } from '../../api/config';
import useAuthStore from '../../store/useAuthStore';
import { t } from '../../utils/locales';
import PaymentModal from './PaymentModal';
import useSocket from '../../hooks/useSocket';

export default function TemplateSwitcher() {
  const { template: currentTemplate, setTemplate, language } = useStyleStore();
  const user = useAuthStore((s) => s.user);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPremiumName, setSelectedPremiumName] = useState('');
  const [templateSettings, setTemplateSettings] = useState({});

  // Real-time updates via Socket
  useSocket({
    events: {
      settingsUpdate: (data) => {
        if (data.type === 'templates') {
          setTemplateSettings(data.templates);
        }
      }
    }
  });

  // Fetch dynamic template settings from admin
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(API_ROUTES.CONTENT);
        const data = await res.json();
        if (data.success && data.settings?.templates) {
          setTemplateSettings(data.settings.templates);
        }
      } catch (err) {
        console.error('Failed to fetch template settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const userPlan = user?.plan || 'free';
  const isProUser = userPlan === 'pro' && user?.isPremium !== false;

  const getTemplateStatus = (tplId) => {
    const settings = templateSettings[tplId];
    if (!settings) {
      // Fallback to defaults from TEMPLATE_LIST
      const tpl = TEMPLATE_LIST.find(t => t.id === tplId);
      return { 
        isPremium: tpl?.isPremium || false,
        enabled: true
      };
    }
    return settings;
  };

  const handleTemplateClick = (tpl) => {
    const { isPremium } = getTemplateStatus(tpl.id);
    if (isPremium && !isProUser) {
      // Show clear message that subscription is required
      import('react-hot-toast').then(m => m.default.error(
        language === 'ar' 
          ? 'اشتراكك انتهى أو تم إلغاؤه. يرجى الدفع مرة أخرى لفتح هذا القالب 🔒'
          : 'Your subscription has expired or was cancelled. Please subscribe again to unlock this template 🔒',
        { 
          duration: 5000, 
          id: 'template-locked',
          icon: '🔒',
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            fontFamily: "'Readex Pro', 'Cairo', sans-serif",
            fontSize: '13px',
            fontWeight: 600,
          }
        }
      ));
      setSelectedPremiumName(t(`tpl_${tpl.id}`, language) || tpl.label);
      setPaymentOpen(true);
      return;
    }
    setTemplate(tpl.id);
  };

  const atsTemplates = TEMPLATE_LIST.filter(t => t.type === 'ats' && getTemplateStatus(t.id).enabled !== false);
  const modernTemplates = TEMPLATE_LIST.filter(t => t.type === 'modern' && getTemplateStatus(t.id).enabled !== false);
  const activeTplObj = TEMPLATE_LIST.find(t => t.id === currentTemplate);
  const isSelectedModern = activeTplObj?.type === 'modern';

  const renderGroup = (title, templates, isModern = false) => (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ 
        fontSize: '11px', 
        fontWeight: 800, 
        color: isModern ? '#8b5cf6' : '#10b981', 
        marginBottom: '14px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        background: isModern ? 'rgba(139, 92, 246, 0.05)' : 'rgba(16, 185, 129, 0.05)',
        padding: '6px 12px',
        borderRadius: '8px',
        width: 'fit-content',
        border: isModern ? '1px solid rgba(139, 92, 246, 0.1)' : '1px solid rgba(16, 185, 129, 0.1)'
      }}>
        {isModern ? <span style={{ fontSize: '14px' }}>✨</span> : <span style={{ fontSize: '14px' }}>🛡️</span>}
        {title}
      </div>
      <div className="template-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }}>
        {templates.map((tpl) => {
          const { isPremium } = getTemplateStatus(tpl.id);
          const isLocked = isPremium && !isProUser;
          const isActive = currentTemplate === tpl.id;

          return (
            <div
              key={tpl.id}
              className={`template-card ${isActive ? 'active' : ''} ${isLocked ? 'tpl-card-locked' : ''}`}
              onClick={() => handleTemplateClick(tpl)}
              style={{
                position: 'relative',
                padding: '16px',
                borderRadius: '16px',
                border: isActive ? '2px solid #6366f1' : '2px solid transparent',
                background: isActive ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                boxShadow: isActive ? '0 8px 24px rgba(99, 102, 241, 0.15)' : 'none',
                opacity: isLocked ? 0.6 : 1,
                filter: isLocked ? 'grayscale(0.4)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {isLocked && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  zIndex: 10,
                  background: 'rgba(30, 41, 59, 0.8)',
                  backdropFilter: 'blur(4px)',
                  padding: '4px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <span style={{ fontSize: '14px' }}>🔒</span>
                </div>
              )}

              {isLocked && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  zIndex: 10,
                  background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                  color: '#fff',
                  fontSize: '8px',
                  fontWeight: 900,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  Pro
                </div>
              )}

              <div style={{
                fontSize: '28px',
                padding: '12px',
                borderRadius: '12px',
                background: isActive ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? '#fff' : tpl.color,
                transition: 'all 0.3s',
              }}>
                {tpl.icon}
              </div>
              
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: isActive ? '#6366f1' : '#94a3b8',
                textAlign: 'center',
                transition: 'all 0.3s',
              }}>
                {t(tpl.label, language) || tpl.label}
              </span>

              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#6366f1',
                  boxShadow: '0 0 8px #6366f1',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className="form-section" style={{ padding: '0 4px' }}>
        <div className="form-section-title" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '4px', height: '16px', background: '#3b82f6', borderRadius: '2px' }} />
          {t('layout_strategy', language) || 'Template Strategy'}
        </div>

        {/* ⚠️ MODERN WARNING MESSAGE */}
        {isSelectedModern && (
          <div style={{
            background: 'linear-gradient(to right, #fff7ed, #fff)',
            border: '1px solid #fed7aa',
            borderRadius: '16px',
            padding: '14px',
            marginBottom: '24px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(251, 146, 60, 0.05)'
          }}>
             <span style={{ fontSize: '24px' }}>💡</span>
             <div style={{ fontSize: '11px', color: '#9a3412', lineHeight: 1.5, fontWeight: 600 }}>
                {language === 'ar' 
                  ? "هذا القالب «بصري» ومثالي للمشاركة الشخصية. إذا كنت تتقدم لأنظمة فلترة آلية (ATS)، استخدم القوالب المعتمدة في القسم التالي."
                  : "This template is 'Visual' and best for direct sharing. For automated application systems (ATS), use the Verified templates in the section below."
                }
             </div>
          </div>
        )}

        {renderGroup(language === 'ar' ? 'قوالب ATS المعتمدة' : 'ATS Verified (Safe)', atsTemplates, false)}
        
        <div style={{ margin: '24px 0', borderTop: '1px dashed #E2E8F0' }} />
        
        {renderGroup(language === 'ar' ? 'قوالب عصرية للمشاركة' : 'Modern / High Impact', modernTemplates, true)}
      </div>

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        templateName={selectedPremiumName}
      />
    </>
  );
}
