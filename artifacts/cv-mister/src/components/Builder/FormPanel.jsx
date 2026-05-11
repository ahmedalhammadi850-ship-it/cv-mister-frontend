// ============================================================
// CV-Mister — FormPanel
// Resume data editing form with live preview sync
// ============================================================

import React, { useState } from 'react';
import { FaUser, FaBriefcase, FaGraduationCap, FaCogs, FaProjectDiagram, FaLanguage, FaCertificate, FaTrophy, FaHandsHelping, FaUserFriends } from 'react-icons/fa';
import useResumeStore from '../../store/useResumeStore';
import { v4 as uuidv4 } from 'uuid';
import useStyleStore from '../../store/useStyleStore';
import { t } from '../../utils/locales';
import SectionMenu from './SectionMenu';
import { generateAISummary, generateAIExperience } from '../../utils/aiHelper';
import { Sparkles, Bold, Italic, List, Bot, Wand2, CheckCircle, Scissors, ChevronDown, PlusCircle } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useCMSStore from '../../store/useCMSStore';
import PaymentModal from './PaymentModal';

/* ── Rich Text & AI Textarea Component ───────────────────── */
function AITextarea({ value, onChange, placeholder, language, onSuggest, alignValue, onAlignChange, onRequirePro }) {
  const isAr = language === 'ar';
  const currentAlign = alignValue || (isAr ? 'right' : 'left');
  const [loadingAction, setLoadingAction] = useState(null);

  const handleAIAction = async (actionType) => {
    if (!value?.trim() && actionType !== 'Suggest') return;
    
    // Check Pro logic
    const requirePro = onRequirePro && !onRequirePro();
    if (requirePro) return;

    setLoadingAction(actionType);
    try {
      // Using FormData bypasses the Strict CORS OPTIONS preflight that blocks JSON
      const formData = new FormData();
      formData.append('action', actionType);
      formData.append('text', value || '');
      formData.append('language', language || 'en');
      formData.append('rule', 'لا تخرج عن سياق النص، ولا تضف أي جمل اعتراضية خارج حدود المهمة اللغوية.');

      const response = await fetch('https://ahmeddd111.app.n8n.cloud/webhook/94834e1e-04b3-451b-9b48-26d58ae28623', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      // Get raw text first to avoid JSON parse errors
      const resultText = await response.text();
      let newText = value;

      try {
        // Try to parse as JSON
        const data = JSON.parse(resultText);
        if (data) {
          if (typeof data.result === 'string') newText = data.result;
          else if (typeof data.text === 'string') newText = data.text;
          else if (typeof data.output === 'string') newText = data.output;
          else if (typeof data.message === 'string') newText = data.message;
          else if (Array.isArray(data) && data[0]?.output) newText = data[0].output;
          else if (typeof data === 'string') newText = data;
          else newText = JSON.stringify(data);
        }
      } catch (e) {
        // If it's not JSON, use the raw text directly (handling cases like "تم اختصار...")
        if (resultText && resultText.trim().length > 0) {
          newText = resultText.trim();
        }
      }
      
      onChange(newText);
    } catch (error) {
      console.error('Webhook error:', error);
      alert(isAr ? 'حدث خطأ أثناء الاتصال بالمساعد الذكي.' : 'Error connecting to AI assistant.');
    } finally {
      setLoadingAction(null);
    }
  };
  
  const pillStyle = (color) => ({
    background: 'transparent',
    border: `1px solid ${color}`,
    color: color,
    borderRadius: '9999px',
    padding: '4px 10px',
    fontSize: '10.5px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: loadingAction ? 'wait' : 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    opacity: loadingAction ? 0.6 : 1,
    pointerEvents: loadingAction ? 'none' : 'auto'
  });

  const alignBtnStyle = (val) => ({
    padding: '4px 6px',
    fontSize: '11px',
    fontWeight: 600,
    background: currentAlign === val ? 'var(--text-primary)' : 'transparent',
    color: currentAlign === val ? 'var(--bg-app)' : 'var(--text-secondary)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  return (
    <div style={{
      background: '#FFFFFF', // Force white for consistency in item cards
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      marginTop: '8px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px 0 16px'
      }}>
        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
          <Bold size={16} style={{ cursor: 'pointer' }} />
          <Italic size={16} style={{ cursor: 'pointer' }} />
          <List size={16} style={{ cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <button onClick={() => onAlignChange?.(isAr ? 'right' : 'left')} style={alignBtnStyle(isAr ? 'right' : 'left')}>{isAr ? 'يمين' : 'Left'}</button>
            <button onClick={() => onAlignChange?.('center')} style={{ ...alignBtnStyle('center'), borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>{isAr ? 'وسط' : 'Center'}</button>
            <button onClick={() => onAlignChange?.(isAr ? 'left' : 'right')} style={alignBtnStyle(isAr ? 'left' : 'right')}>{isAr ? 'يسار' : 'Right'}</button>
          </div>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        className="form-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ 
          minHeight: '120px', 
          border: 'none', 
          borderRadius: 0, 
          boxShadow: 'none', 
          background: 'transparent',
          padding: '16px',
          fontSize: '14px',
          resize: 'vertical',
          color: 'var(--text-primary)',
          outline: 'none',
          fontFamily: 'inherit',
          width: '100%',
          textAlign: currentAlign
        }}
      />

      {/* Bottom Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '0 16px 16px 16px',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
          <button style={pillStyle('#3B82F6')} onClick={(e) => { e.preventDefault(); handleAIAction('Improve'); }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <Wand2 size={12} /> {loadingAction === 'Improve' ? (isAr ? 'جاري التحسين...' : 'Improving...') : (isAr ? 'تحسين النص' : 'Improve Text')}
          </button>
          <button style={pillStyle('#8B5CF6')} onClick={(e) => { e.preventDefault(); handleAIAction('Suggest'); }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <PlusCircle size={12} /> {loadingAction === 'Suggest' ? (isAr ? 'جاري الاقتراح...' : 'Suggesting...') : (isAr ? 'اقتراح' : 'Suggest')}
          </button>
          <button style={pillStyle('#10B981')} onClick={(e) => { e.preventDefault(); handleAIAction('Grammar Check'); }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <CheckCircle size={12} /> {loadingAction === 'Grammar Check' ? (isAr ? 'جاري التدقيق...' : 'Checking...') : (isAr ? 'تدقيق لغوي' : 'Grammar Check')}
          </button>
          <button style={pillStyle('#F59E0B')} onClick={(e) => { e.preventDefault(); handleAIAction('Shorten'); }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <Scissors size={12} /> {loadingAction === 'Shorten' ? (isAr ? 'جاري الاختصار...' : 'Shortening...') : (isAr ? 'اختصار' : 'Shorten')} <ChevronDown size={12} style={{ marginInlineStart: '2px' }} />
          </button>
        </div>
        <button style={{
          width: '36px', height: '36px', borderRadius: '8px', 
          background: 'var(--bg-card)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          color: loadingAction ? '#3B82F6' : '#8B5CF6',
          cursor: loadingAction ? 'wait' : 'pointer', 
          boxShadow: loadingAction ? '0 4px 12px rgba(59,130,246,0.4)' : '0 2px 8px rgba(0,0,0,0.06)',
          flexShrink: 0,
          transition: 'all 0.3s ease',
          transform: loadingAction ? 'scale(1.05)' : 'scale(1)',
        }}>
          <Bot size={20} className={loadingAction ? 'animate-bounce' : ''} />
        </button>
      </div>
    </div>
  );
}

/* ── Generic array item editor ───────────────────────────── */
function ArraySection({ title, icon, sectionKey, fields, data, onAdd, onUpdate, onRemove, language, isActive, onActivate, onRequirePro }) {
  const items = data[sectionKey] || [];
  const [collapsed, setCollapsed] = useState(false);
  const { customTitles, setCustomTitle, renamingSection, setRenamingSection, alignments = {}, setAlignment } = useResumeStore();
  const [tempTitle, setTempTitle] = useState('');

  const isRenaming = renamingSection === sectionKey;
  const displayTitle = customTitles[sectionKey] || title;

  const handleRenameSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      const newTitle = tempTitle.trim() || displayTitle;
      setCustomTitle(sectionKey, newTitle);
      setRenamingSection(null);
    }
  };

  return (
    <div 
      onClick={() => onActivate(sectionKey)}
      onFocusCapture={() => onActivate(sectionKey)}
      className={`transition-all duration-300 group ${isActive ? 'ring-4 ring-blue-500/10' : 'hover:bg-white hover:border-slate-200 hover:shadow-md cursor-pointer'}`}
      style={{
        background: isActive 
          ? 'linear-gradient(to left, #F0F7FF, #FFFFFF)' 
          : '#FFFFFF', 
        border: isActive ? '1.5px solid #3B82F6' : '1px solid #E2E8F0', // border-slate-200/60
        borderRadius: '24px', 
        padding: '24px',
        marginBottom: '20px',
        boxShadow: isActive 
          ? '0 10px 25px rgba(59,130,246,0.12)' 
          : '0 2px 8px rgba(0,0,0,0.04)',
        position: 'relative',
        zIndex: isActive ? 5 : 1,
      }}
    >
      <div
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer', 
          userSelect: 'none',
          marginBottom: (collapsed && items.length === 0) ? '0px' : '16px'
        }}
        onClick={() => !isRenaming && setCollapsed(!collapsed)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
          <div style={{ 
            width: '38px', height: '38px', borderRadius: '10px', 
            background: isActive ? 'rgba(59,130,246,0.1)' : 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            color: isActive ? '#3B82F6' : '#64748B', // slate-500
            transition: 'all 0.3s'
          }}>
            {icon}
          </div>
          {isRenaming ? (
            <input
              autoFocus
              className="form-input"
              defaultValue={displayTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={handleRenameSubmit}
              onBlur={handleRenameSubmit}
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: '16px', fontWeight: 800, padding: '4px 8px', height: 'auto', outline: 'none', background: 'white', color: 'var(--text-primary)', border: '1.5px solid #3B82F6', borderRadius: '8px' }}
            />
          ) : (
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: isActive ? '#1E40AF' : '#1E293B', margin: 0, transition: 'color 0.2s', letterSpacing: '-0.01em' }}>{displayTitle}</h3>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {items.length} <span>{collapsed ? '▾' : '▴'}</span>
          </span>
          <div onClick={(e) => e.stopPropagation()}>
            <SectionMenu sectionKey={sectionKey} />
          </div>
        </div>
      </div>

      {!collapsed && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="transition-all duration-200 hover:shadow-md hover:border-slate-300"
              style={{
                background: '#F8FAFC', // bg-slate-50
                borderRadius: '16px', // rounded-xl
                padding: '18px',
                border: '1px solid #E2E8F0', // border-slate-200
                marginBottom: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {title} #{idx + 1}
                </span>
                <button className="btn-danger" style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }} onClick={() => onRemove(sectionKey, item.id)}>
                  {t('remove', language)}
                </button>
              </div>
              <div style={{ 
                background: '#F1F5F9', // slightly darker slate-100 or blue-50/40
                padding: '20px', 
                borderRadius: '12px',
                borderTop: '1px solid #E2E8F0',
                borderBottom: '1px solid #E2E8F0',
                margin: '0 -18px 0 -18px', // bleeding into the item card padding
              }}>
                {fields.map((field) => (
                  <div key={field.key} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '12px', color: '#475569' }}>{t(field.labelKey, language)}</label>
                    </div>
                    {field.type === 'textarea' ? (
                      <AITextarea
                        value={item[field.key] || ''}
                        onChange={(val) => onUpdate(sectionKey, item.id, { [field.key]: val })}
                        placeholder={field.placeholder || ''}
                        language={language}
                        alignValue={alignments[`${sectionKey}-${item.id}`]}
                        onAlignChange={(val) => setAlignment(`${sectionKey}-${item.id}`, val)}
                        onRequirePro={onRequirePro}
                        onSuggest={field.key === 'description' ? () => {
                          if (onRequirePro && !onRequirePro()) return;
                          const suggestion = generateAIExperience(item.position, language);
                          onUpdate(sectionKey, item.id, { [field.key]: suggestion });
                        } : undefined}
                      />
                    ) : (
                      <input
                        className="form-input"
                        type={field.type || 'text'}
                        value={item[field.key] || ''}
                        onChange={(e) => onUpdate(sectionKey, item.id, { [field.key]: e.target.value })}
                        placeholder={field.placeholder || ''}
                        style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Button ALWAYS at the bottom of the card */}
      <button
        onClick={() => {
          const newItem = { id: uuidv4() };
          fields.forEach((f) => { newItem[f.key] = ''; });
          onAdd(sectionKey, newItem);
          setCollapsed(false);
        }}
        style={{ 
          width: '100%', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          background: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          color: '#3B82F6',
          padding: '12px',
          borderRadius: '9999px',
          fontWeight: 700,
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          marginTop: (!collapsed && items.length > 0) ? '8px' : '4px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#EFF6FF'; // light blue tint
          e.currentTarget.style.borderColor = '#3B82F6';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
          e.currentTarget.style.borderColor = '#E2E8F0';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
        }}
      >
        <span style={{ fontSize: '16px' }}>+</span> {language === 'ar' ? 'إضافة عنصر' : 'Add Item'}
      </button>
    </div>
  );
}

/* ── Main FormPanel ──────────────────────────────────────── */
export default function FormPanel() {
  const { 
    data, setPersonalInfo, setSummary, addItem, updateItem, removeItem, 
    alignments = {}, setAlignment, addCustomSection, layoutColumns 
  } = useResumeStore();
  const language = useStyleStore((s) => s.language);
  const [activeSectionId, setActiveSectionId] = useState(null);

  // Identify custom sections ( those not in the standard list )
  const standardSections = [
    'header', 'summary', 'experience', 'education', 'skills', 
    'projects', 'languages', 'certificates', 'awards', 'volunteering', 'references'
  ];
  const customSectionKeys = [
    ...(layoutColumns?.columnMain || []),
    ...(layoutColumns?.columnSide || [])
  ].filter(key => !standardSections.includes(key));

  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAIFreeGlobally = useCMSStore((s) => s.settings?.isAIFreeGlobally);

  const checkProStatus = () => {
    if (isAIFreeGlobally || user?.plan === 'pro') return true;
    setPaymentModalOpen(true);
    return false;
  };

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
        templateName="ميزات الذكاء الاصطناعي (AI Tools)" 
      />
      {/* Personal Info */}
      <div 
        onClick={() => setActiveSectionId('header')}
        onFocusCapture={() => setActiveSectionId('header')}
        className={`transition-all duration-300 group ${activeSectionId === 'header' ? 'ring-4 ring-blue-500/10' : 'hover:bg-white hover:border-slate-200 hover:shadow-md cursor-pointer'}`}
        style={{
          background: activeSectionId === 'header' 
            ? 'linear-gradient(to left, #F0F7FF, #FFFFFF)' 
            : '#FFFFFF',
          border: activeSectionId === 'header' ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
          borderRadius: '24px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: activeSectionId === 'header' 
            ? '0 10px 25px rgba(59,130,246,0.12)' 
            : '0 2px 8px rgba(0,0,0,0.04)',
          position: 'relative',
          zIndex: activeSectionId === 'header' ? 5 : 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
            <div style={{ 
              width: '38px', height: '38px', borderRadius: '10px', 
              background: activeSectionId === 'header' ? 'rgba(59,130,246,0.1)' : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              color: activeSectionId === 'header' ? '#3B82F6' : '#64748B',
              transition: 'all 0.3s'
            }}>
              <FaUser size={18} /> 
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: activeSectionId === 'header' ? '#1E40AF' : '#1E293B', transition: 'color 0.2s', letterSpacing: '-0.01em' }}>{t('personal_info', language)}</h3>
          </div>
          <SectionMenu sectionKey="header" />
        </div>

        {[
          { key: 'fullName', labelKey: 'full_name', placeholder: 'Alexander Mitchell' },
          { key: 'jobTitle', labelKey: 'job_title', placeholder: 'Senior Full-Stack Engineer' },
          { key: 'email', labelKey: 'email', placeholder: 'alex@email.com' },
          { key: 'phone', labelKey: 'phone', placeholder: '+1 (555) 234-5678' },
          { key: 'location', labelKey: 'location', placeholder: 'San Francisco, CA' },
          { key: 'website', labelKey: 'website', placeholder: 'https://alexmitchell.dev' },
          { key: 'linkedin', labelKey: 'linkedin', placeholder: 'linkedin.com/in/alexmitchell' },
          { key: 'github', labelKey: 'github', placeholder: 'github.com/alexmitchell' },
        ].map((field) => (
          <div key={field.key} style={{ marginBottom: '12px' }}>
            <label className="form-label" style={{ margin: '0 0 4px 0' }}>{t(field.labelKey, language)}</label>
            <input
              className="form-input"
              value={data.personalInfo?.[field.key] || ''}
              onChange={(e) => setPersonalInfo(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>

      {/* Summary */}
      <div 
        onClick={() => setActiveSectionId('summary')}
        onFocusCapture={() => setActiveSectionId('summary')}
        className={`transition-all duration-300 group ${activeSectionId === 'summary' ? 'ring-4 ring-blue-500/10' : 'hover:bg-white hover:border-slate-200 hover:shadow-md cursor-pointer'}`}
        style={{
          background: activeSectionId === 'summary' 
            ? 'linear-gradient(to left, #F0F7FF, #FFFFFF)' 
            : '#FFFFFF',
          border: activeSectionId === 'summary' ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
          borderRadius: '24px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: activeSectionId === 'summary' 
            ? '0 10px 25px rgba(59,130,246,0.12)' 
            : '0 2px 8px rgba(0,0,0,0.04)',
          position: 'relative',
          zIndex: activeSectionId === 'summary' ? 5 : 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
            <div style={{ 
              width: '38px', height: '38px', borderRadius: '10px', 
              background: activeSectionId === 'summary' ? 'rgba(59,130,246,0.1)' : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              color: activeSectionId === 'summary' ? '#3B82F6' : '#64748B',
              transition: 'all 0.3s'
            }}>
              <span style={{ fontSize: '18px' }}>📝</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: activeSectionId === 'summary' ? '#1E40AF' : '#1E293B', margin: 0, transition: 'color 0.2s', letterSpacing: '-0.01em' }}>{t('professional_summary', language)}</h3>
           </div>
           <SectionMenu sectionKey="summary" />
        </div>
        <AITextarea
          value={data.summary || ''}
          onChange={(val) => setSummary(val)}
          placeholder={t('summary_placeholder', language)}
          language={language}
          alignValue={alignments['summary']}
          onAlignChange={(val) => setAlignment('summary', val)}
          onRequirePro={checkProStatus}
          onSuggest={() => {
            if (!checkProStatus()) return;
            const suggestion = generateAISummary(data.personalInfo?.jobTitle, language);
            setSummary(suggestion);
          }}
        />
      </div>

      {/* Experience */}
      <ArraySection
        title={t('experience', language)}
        icon={<FaBriefcase />}
        sectionKey="experience"
        data={data}
        onAdd={addItem}
        onUpdate={updateItem}
        onRemove={removeItem}
        language={language}
        isActive={activeSectionId === 'experience'}
        onActivate={setActiveSectionId}
        onRequirePro={checkProStatus}
        fields={[
          { key: 'position', labelKey: 'position', placeholder: 'Software Engineer' },
          { key: 'company', labelKey: 'company', placeholder: 'Google' },
          { key: 'location', labelKey: 'location', placeholder: 'Mountain View, CA' },
          { key: 'startDate', labelKey: 'start_date', placeholder: '2021-01' },
          { key: 'endDate', labelKey: 'end_date', placeholder: 'Present' },
          { key: 'description', labelKey: 'description', type: 'textarea', placeholder: 'What did you accomplish?' },
        ]}
      />

      {/* Education */}
      <ArraySection
        title={t('education', language)}
        icon={<FaGraduationCap />}
        sectionKey="education"
        data={data}
        onAdd={addItem}
        onUpdate={updateItem}
        onRemove={removeItem}
        language={language}
        isActive={activeSectionId === 'education'}
        onActivate={setActiveSectionId}
        onRequirePro={checkProStatus}
        fields={[
          { key: 'degree', labelKey: 'degree', placeholder: 'BS Computer Science' },
          { key: 'institution', labelKey: 'institution', placeholder: 'MIT' },
          { key: 'location', labelKey: 'location', placeholder: 'Cambridge, MA' },
          { key: 'startDate', labelKey: 'start_date', placeholder: '2016-09' },
          { key: 'endDate', labelKey: 'end_date', placeholder: '2020-06' },
          { key: 'description', labelKey: 'description', type: 'textarea', placeholder: 'GPA, honors...' },
        ]}
      />

      {/* Skills */}
      <ArraySection
        title={t('skills', language)}
        icon={<FaCogs />}
        sectionKey="skills"
        data={data}
        onAdd={addItem}
        onUpdate={updateItem}
        onRemove={removeItem}
        language={language}
        isActive={activeSectionId === 'skills'}
        onActivate={setActiveSectionId}
        onRequirePro={checkProStatus}
        fields={[
          { key: 'name', labelKey: 'skill_name', placeholder: 'React / Next.js' },
          { key: 'level', labelKey: 'proficiency', type: 'number', placeholder: '90' },
        ]}
      />

      {/* Projects */}
      <ArraySection
        title={t('projects', language)}
        icon={<FaProjectDiagram />}
        sectionKey="projects"
        data={data}
        onAdd={addItem}
        onUpdate={updateItem}
        onRemove={removeItem}
        language={language}
        isActive={activeSectionId === 'projects'}
        onActivate={setActiveSectionId}
        onRequirePro={checkProStatus}
        fields={[
          { key: 'name', labelKey: 'project_name', placeholder: 'OpenDeploy' },
          { key: 'description', labelKey: 'description', type: 'textarea', placeholder: 'What does it do?' },
          { key: 'technologies', labelKey: 'technologies', placeholder: 'React, Node.js, Docker' },
          { key: 'link', labelKey: 'link', placeholder: 'github.com/...' },
        ]}
      />

      {/* Languages */}
      <ArraySection
        title={t('languages', language)}
        icon={<FaLanguage />}
        sectionKey="languages"
        data={data}
        onAdd={addItem}
        onUpdate={updateItem}
        onRemove={removeItem}
        language={language}
        isActive={activeSectionId === 'languages'}
        onActivate={setActiveSectionId}
        onRequirePro={checkProStatus}
        fields={[
          { key: 'name', labelKey: 'language_name', placeholder: 'English' },
          { key: 'level', labelKey: 'language_level', placeholder: 'Native / Professional / Intermediate' },
        ]}
      />

      {/* Certificates */}
      <ArraySection
        title={t('certifications', language)}
        icon={<FaCertificate />}
        sectionKey="certificates"
        data={data}
        onAdd={addItem}
        onUpdate={updateItem}
        onRemove={removeItem}
        language={language}
        isActive={activeSectionId === 'certificates'}
        onActivate={setActiveSectionId}
        onRequirePro={checkProStatus}
        fields={[
          { key: 'name', labelKey: 'cert_name', placeholder: 'AWS Solutions Architect' },
          { key: 'issuer', labelKey: 'issuer', placeholder: 'Amazon Web Services' },
          { key: 'date', labelKey: 'date', placeholder: '2023-05' },
        ]}
      />

      {/* Awards */}
      <ArraySection
        title={t('awards', language)}
        icon={<FaTrophy />}
        sectionKey="awards"
        data={data}
        onAdd={addItem}
        onUpdate={updateItem}
        onRemove={removeItem}
        language={language}
        isActive={activeSectionId === 'awards'}
        onActivate={setActiveSectionId}
        onRequirePro={checkProStatus}
        fields={[
          { key: 'name', labelKey: 'award_name', placeholder: 'Engineering Excellence Award' },
          { key: 'issuer', labelKey: 'issuer', placeholder: 'Company Name' },
          { key: 'date', labelKey: 'date', placeholder: '2023' },
          { key: 'description', labelKey: 'description', type: 'textarea', placeholder: '' },
        ]}
      />

      {/* Volunteering */}
      <ArraySection
        title={t('volunteering', language)}
        icon={<FaHandsHelping />}
        sectionKey="volunteering"
        data={data}
        onAdd={addItem}
        onUpdate={updateItem}
        onRemove={removeItem}
        language={language}
        isActive={activeSectionId === 'volunteering'}
        onActivate={setActiveSectionId}
        onRequirePro={checkProStatus}
        fields={[
          { key: 'role', labelKey: 'role', placeholder: 'Volunteer Developer' },
          { key: 'organization', labelKey: 'organization', placeholder: 'Code for America' },
          { key: 'startDate', labelKey: 'start_date', placeholder: '2020-01' },
          { key: 'endDate', labelKey: 'end_date', placeholder: 'Present' },
          { key: 'description', labelKey: 'description', type: 'textarea', placeholder: '' },
        ]}
      />

      {/* References */}
      <ArraySection
        title={t('references', language)}
        icon={<FaUserFriends />}
        sectionKey="references"
        data={data}
        onAdd={addItem}
        onUpdate={updateItem}
        onRemove={removeItem}
        language={language}
        isActive={activeSectionId === 'references'}
        onActivate={setActiveSectionId}
        onRequirePro={checkProStatus}
        fields={[
          { key: 'name', labelKey: 'ref_name', placeholder: 'Dr. Sarah Chen' },
          { key: 'position', labelKey: 'position', placeholder: 'VP of Engineering' },
          { key: 'email', labelKey: 'email', placeholder: 'sarah@company.com' },
          { key: 'phone', labelKey: 'phone', placeholder: '+1 (555) 345-6789' },
        ]}
      />
      {/* Custom Sections */}
      {customSectionKeys.map(key => (
        <ArraySection
          key={key}
          title={key} // Will be overridden by customTitles in ArraySection
          icon={<span>✨</span>}
          sectionKey={key}
          data={data}
          onAdd={addItem}
          onUpdate={updateItem}
          onRemove={removeItem}
          language={language}
          isActive={activeSectionId === key}
          onActivate={setActiveSectionId}
          onRequirePro={checkProStatus}
          fields={[
            { key: 'title', labelKey: 'title', placeholder: 'Title' },
            { key: 'subtitle', labelKey: 'subtitle', placeholder: 'Subtitle' },
            { key: 'description', labelKey: 'description', type: 'textarea', placeholder: 'Description' },
          ]}
        />
      ))}

      {/* Add Custom Section Button */}
      <button
        onClick={() => addCustomSection(language === 'ar' ? 'قسم جديد' : 'New Section')}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed var(--border-default)',
          color: 'var(--text-muted)',
          padding: '16px',
          borderRadius: '9999px',
          fontWeight: 600,
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginTop: '24px',
          marginBottom: '64px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-elevated)';
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.border = '1px solid var(--text-muted)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.border = '1px dashed var(--border-default)';
        }}
      >
        <span>+</span> {language === 'ar' ? 'إضافة قسم مخصص' : 'Add Custom Section'}
      </button>
    </div>
  );
}
