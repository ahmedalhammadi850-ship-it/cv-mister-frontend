// ============================================================
// CV-Mister — StyleSidebar
// Category picker + style controls (colors, fonts, spacing)
// ============================================================

import React, { useState } from 'react';
import { CATEGORY_LIST } from '../../utils/constants';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import useStyleStore from '../../store/useStyleStore';
import useResumeStore from '../../store/useResumeStore'; // Linked to content store
import { t } from '../../utils/locales';

/* ── Alignment Switcher Component ────────────────────────── */
function AlignmentSwitcher({ value, onChange, label, language }) {
  const options = [
    { id: 'left', icon: <AlignLeft size={16} /> },
    { id: 'center', icon: <AlignCenter size={16} /> },
    { id: 'right', icon: <AlignRight size={16} /> },
  ];

  return (
    <div style={{ marginTop: '12px' }}>
      {label && <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>{label}</label>}
      <div style={{ display: 'flex', gap: '8px', direction: 'ltr' }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '6px',
              border: value === opt.id ? '2px solid var(--accent-color)' : '1px solid #E5E7EB',
              background: value === opt.id ? 'rgba(59,130,246,0.05)' : '#fff',
              color: value === opt.id ? 'var(--accent-color)' : '#9CA3AF',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            {opt.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function StyleSidebar() {
  const {
    category, setCategory,
    language, setLanguage,
    accentColor, setAccentColor,
    nameFontSize, setNameFontSize,
    headingFontSize, setHeadingFontSize,
    bodyFontSize, setBodyFontSize,
    lineHeight, setLineHeight,
    marginTop, setMarginTop,
    marginBottom, setMarginBottom,
    marginSides, setMarginSides,
    sectionGap, setSectionGap,
    headerAlign, setHeaderAlign,
    columnFlowEnabled, setColumnFlowEnabled,
  } = useStyleStore();

  const { 
    data, sectionsStyles, setSectionStyle, customTitles,
    alignments = {}, setAlignment 
  } = useResumeStore();

  const [selectedSection, setSelectedSection] = useState('');

  // Get list of all sections currently in the data
  const availableSections = Object.keys(data).filter(key => 
    key !== 'personalInfo' && key !== 'header' && key !== 'summary'
  );

  const colors = ['#1E3A5F', '#C9A84C', '#E74C8B', '#4A2C2A', '#00D4AA', '#7C3AED', '#3B82F6', '#EF4444', '#059669', '#6366F1'];

  return (
    <div>
      {/* ── Alignment Controls (At the Top) ──────────────────── */}
      <div className="form-section">
        <div className="form-section-title">📏 {language === 'ar' ? 'محاذاة العناصر' : 'Layout Alignment'}</div>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Full Name Alignment */}
          <div>
            <label className="form-label" style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px', display: 'block' }}>
              {language === 'ar' ? 'محاذاة الاسم' : 'Full Name Alignment'}
            </label>
            <AlignmentSwitcher 
              value={alignments['full_name'] || (language === 'ar' ? 'right' : 'left')}
              onChange={(val) => setAlignment('full_name', val)}
              language={language}
            />
          </div>

          {/* Section Data Alignment */}
          <div>
            <label className="form-label" style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px', display: 'block' }}>
              {language === 'ar' ? 'محاذاة المسمى والبيانات' : 'Data & Title Alignment'}
            </label>
            <AlignmentSwitcher 
              value={alignments['personal_info'] || (language === 'ar' ? 'right' : 'left')}
              onChange={(val) => setAlignment('personal_info', val)}
              language={language}
            />
          </div>

          {/* Section Headers Alignment */}
          <div>
            <label className="form-label" style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px', display: 'block' }}>
              {language === 'ar' ? 'محاذاة عناوين الأقسام' : 'Section Headers Alignment'}
            </label>
            <div style={{ display: 'flex', gap: '8px', direction: 'ltr' }}>
              <button 
                onClick={() => setHeaderAlign('left')}
                style={{ flex: 1, padding: '10px', border: headerAlign === 'left' ? '2px solid var(--accent-color)' : '1px solid #E5E7EB', borderRadius: '6px', background: headerAlign === 'left' ? 'rgba(59,130,246,0.05)' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: 'all 0.2s' }}>
                <AlignLeft size={16} color={headerAlign === 'left' ? 'currentColor' : '#9CA3AF'} style={{ color: headerAlign === 'left' ? 'var(--accent-color)' : '#9CA3AF' }} />
              </button>
              <button 
                onClick={() => setHeaderAlign('center')}
                style={{ flex: 1, padding: '10px', border: headerAlign === 'center' ? '2px solid var(--accent-color)' : '1px solid #E5E7EB', borderRadius: '6px', background: headerAlign === 'center' ? 'rgba(59,130,246,0.05)' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: 'all 0.2s' }}>
                <AlignCenter size={16} color={headerAlign === 'center' ? 'currentColor' : '#9CA3AF'} style={{ color: headerAlign === 'center' ? 'var(--accent-color)' : '#9CA3AF' }} />
              </button>
              <button 
                onClick={() => setHeaderAlign('right')}
                style={{ flex: 1, padding: '10px', border: headerAlign === 'right' ? '2px solid var(--accent-color)' : '1px solid #E5E7EB', borderRadius: '6px', background: headerAlign === 'right' ? 'rgba(59,130,246,0.05)' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: 'all 0.2s' }}>
                <AlignRight size={16} color={headerAlign === 'right' ? 'currentColor' : '#9CA3AF'} style={{ color: headerAlign === 'right' ? 'var(--accent-color)' : '#9CA3AF' }} />
              </button>
            </div>
          </div>

        </div>
      </div>
      {/* Category Picker */}
      <div className="form-section">
        <div className="form-section-title">📋 {t('layout_strategy', language) || 'Layout Strategy'}</div>
        <div className="category-grid">
          {CATEGORY_LIST.map((cat) => (
            <div
              key={cat.id}
              className={`category-chip ${category === cat.id ? 'active' : ''}`}
              onClick={() => setCategory(cat.id)}
              title={cat.desc}
            >
              {t(`cat_${cat.id}`, language)}
            </div>
          ))}
        </div>

        {/* Column Flow Toggle */}
        <div style={{ 
          margin: '12px 16px 0', 
          padding: '14px 16px',
          borderRadius: '12px',
          background: columnFlowEnabled 
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))' 
            : 'var(--bg-elevated)',
          border: columnFlowEnabled 
            ? '1px solid rgba(99, 102, 241, 0.3)' 
            : '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={() => setColumnFlowEnabled(!columnFlowEnabled)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>📰</span>
            <div>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                color: columnFlowEnabled ? 'var(--accent-color)' : 'var(--text-primary)',
              }}>
                {language === 'ar' ? 'تدفق عمودين' : 'Column Flow'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {language === 'ar' ? 'يملأ العمود الأيسر ثم الأيمن' : 'Fill left column, then right'}
              </div>
            </div>
          </div>
          <div style={{
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            background: columnFlowEnabled 
              ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' 
              : 'var(--border-default)',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0,
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: '2px',
              left: columnFlowEnabled ? '22px' : '2px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }} />
          </div>
        </div>
      </div>

      {/* Accent Color */}
      <div className="form-section">
        <div className="form-section-title">{t('accent_color', language)}</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '8px 16px' }}>
          {['#1E3A5F', '#C9A84C', '#E74C8B', '#4A2C2A', '#00D4AA', '#7C3AED', '#3B82F6', '#EF4444', '#059669', '#6366F1'].map((color) => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: color,
                border: accentColor === color ? '3px solid #fff' : '2px solid transparent',
                boxShadow: accentColor === color ? `0 0 0 2px ${color}` : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            />
          ))}
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        </div>
      </div>

      {/* Per-Section Colors */}
      <div className="form-section">
        <div className="form-section-title">🎨 {language === 'ar' ? 'ألوان الأقسام' : 'Per-Section Colors'}</div>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Section Selector (Glassmorphism Dropdown) */}
          <select 
            className="form-input"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            style={{ 
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              padding: '10px',
              width: '100%',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="">-- {language === 'ar' ? 'اختر القسم' : 'Select Section'} --</option>
            {availableSections.map(key => (
              <option key={key} value={key}>
                {customTitles[key] || t(key, language) || key}
              </option>
            ))}
          </select>

          {/* Color Palette for Selected Section */}
          {selectedSection && (
            <div className="animate-fade-in" style={{ 
              background: 'rgba(59,130,246,0.03)', 
              padding: '12px', 
              borderRadius: '16px',
              border: '1px dashed rgba(59,130,246,0.2)'
            }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSectionStyle(selectedSection, { color })}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: color,
                      border: sectionsStyles[selectedSection]?.color === color ? '3px solid #fff' : '1px solid rgba(0,0,0,0.1)',
                      boxShadow: sectionsStyles[selectedSection]?.color === color ? `0 0 0 2px ${color}` : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: sectionsStyles[selectedSection]?.color === color ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                ))}
                
                <input
                  type="color"
                  value={sectionsStyles[selectedSection]?.color || '#000000'}
                  onChange={(e) => setSectionStyle(selectedSection, { color: e.target.value })}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                />
              </div>
              <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                {language === 'ar' ? 'تعديل لون:' : 'Editing color for:'} <span style={{ color: sectionsStyles[selectedSection]?.color || '#3B82F6' }}>{customTitles[selectedSection] || t(selectedSection, language)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="form-section">
        <div className="form-section-title">{t('typography', language)}</div>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="form-label">{t('name_size', language)} ({nameFontSize}pt)</label>
            <input type="range" min="16" max="32" step="0.5" value={nameFontSize}
              onChange={(e) => setNameFontSize(parseFloat(e.target.value))}
              style={{ width: '100%' }} />
          </div>
          <div>
            <label className="form-label">{t('heading_size', language)} ({headingFontSize}pt)</label>
            <input type="range" min="10" max="20" step="0.5" value={headingFontSize}
              onChange={(e) => setHeadingFontSize(parseFloat(e.target.value))}
              style={{ width: '100%' }} />
          </div>
          <div>
            <label className="form-label">{t('body_size', language)} ({bodyFontSize}pt)</label>
            <input type="range" min="8" max="14" step="0.5" value={bodyFontSize}
              onChange={(e) => setBodyFontSize(parseFloat(e.target.value))}
              style={{ width: '100%' }} />
          </div>
          <div>
            <label className="form-label">{t('line_height', language)} ({lineHeight})</label>
            <input type="range" min="1.0" max="2.0" step="0.1" value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
              style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Spacing / Margins */}
      <div className="form-section">
        <div className="form-section-title">{t('spacing_mm', language)}</div>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="form-label">{t('top_margin', language)} ({marginTop}mm)</label>
            <input type="range" min="5" max="30" step="1" value={marginTop}
              onChange={(e) => setMarginTop(parseInt(e.target.value))}
              style={{ width: '100%' }} />
          </div>
          <div>
            <label className="form-label">{t('bottom_margin', language)} ({marginBottom}mm)</label>
            <input type="range" min="5" max="30" step="1" value={marginBottom}
              onChange={(e) => setMarginBottom(parseInt(e.target.value))}
              style={{ width: '100%' }} />
          </div>
          <div>
            <label className="form-label">{t('side_margins', language)} ({marginSides}mm)</label>
            <input type="range" min="5" max="30" step="1" value={marginSides}
              onChange={(e) => setMarginSides(parseInt(e.target.value))}
              style={{ width: '100%' }} />
          </div>
          <div>
            <label className="form-label">{t('section_gap', language)} ({sectionGap}px)</label>
            <input type="range" min="8" max="48" step="4" value={sectionGap}
              onChange={(e) => setSectionGap(parseInt(e.target.value))}
              style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
