// ============================================================
// ElegantTemplate — Dynamic-First Luxe Template
// Circular photo, Modern Luxe, gold accents, adaptive control
// ============================================================
import React from 'react';
import { ContactInfo, renderSection } from '../Sections';
import { CATEGORY_SECTION_ORDER, CATEGORIES } from '../../../utils/constants';
import useStyleStore from '../../../store/useStyleStore';
import useResumeStore from '../../../store/useResumeStore';

export default function ElegantTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor: propAccentColor = '#C9A84C',
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
}) {
  const isRtl = language === 'ar';
  const { alignments = {} } = useResumeStore();
  const nameAlign = alignments['full_name'] || 'center';
  const infoAlign = alignments['personal_info'] || 'center';
  
  // ── AUDIT: Settings Verification ───────────
  console.log("ElegantTemplate Settings Audit:", data?.settings);

  const styles = useStyleStore.getState();
  const order = CATEGORY_SECTION_ORDER[category] || CATEGORY_SECTION_ORDER[CATEGORIES.CHRONOLOGICAL];
  
  // ── DYNAMIC CONFIG (Priority: data.settings > useStyleStore) ──
  const s = data?.settings || {};
  const accentColor = propAccentColor || styles.accentColor || '#C9A84C';

  const config = {
    nameSize: s.name_size ? `${s.name_size}pt` : (styles.nameFontSize ? `${styles.nameFontSize}pt` : '32pt'),
    headerSize: s.header_size ? `${s.header_size}pt` : (styles.headingFontSize ? `${styles.headingFontSize}pt` : '13pt'),
    textSize: s.text_size ? `${s.text_size}pt` : (styles.bodyFontSize ? `${styles.bodyFontSize}pt` : '10.5pt'),
    lineHeight: parseFloat(s.line_height || styles.lineHeight || 1.5),
    marginTop: s.margin_top ? `${s.margin_top}mm` : (styles.marginTop ? `${styles.marginTop}mm` : '20mm'),
    marginBottom: s.margin_bottom ? `${s.margin_bottom}mm` : (styles.marginBottom ? `${styles.marginBottom}mm` : '20mm'),
    marginSide: s.margin_side ? `${s.margin_side}mm` : (styles.marginSides ? `${styles.marginSides}mm` : '15mm'),
    sectionSpacing: `${s.section_spacing || styles.sectionGap || 20}px`
  };

  const bodyStyle = {
    fontSize: config.textSize,
    lineHeight: config.lineHeight,
    color: '#374151',
    whiteSpace: 'pre-line',
    textAlign: 'start'
  };

  const isPopulated = (key) => {
    const val = data[key];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'string') return val.trim().length > 0;
    return true;
  };
  
  const populatedKeys = Object.keys(data).filter(isPopulated);
  const allSections = Array.from(new Set([
    ...order.filter(k => populatedKeys.includes(k)),
    ...populatedKeys.filter(k => k.startsWith('custom_') || (!order.includes(k) && k !== 'header' && k !== 'personalInfo' && k !== 'settings'))
  ]));

  const sectionsToRender = visibleSections
    ? allSections.filter((key) => visibleSections.includes(key))
    : allSections;
  const showHeader = visibleSections === null || isFirstPage;

  const headingStyle = {
    color: accentColor,
    fontSize: config.headerSize,
    fontFamily: isRtl ? 'var(--global-font)' : "'Playfair Display', serif",
    fontWeight: 600,
    borderBottom: `1px solid ${accentColor}40`,
    paddingBottom: '6px',
    marginBottom: '12px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    textAlign: 'start'
  };

  return (
    <div
      data-cv-root
      style={{ 
        fontFamily: "var(--global-font)",
        direction: isRtl ? 'rtl' : 'ltr',
        paddingTop: config.marginTop,
        paddingBottom: config.marginBottom,
        paddingLeft: config.marginSide,
        paddingRight: config.marginSide,
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        // Force sub-components to respect settings
        '--body-font-size': config.textSize,
        '--line-height-global': config.lineHeight
      }}
    >
      <style>{`
        [data-cv-root] {
           --dynamic-header-size: ${data.settings?.header_size || 13.5}pt;
           --line-height: ${data.settings?.line_height || 1.6};
           --section-spacing: ${data.settings?.section_spacing || 24}px;
           --header-align: ${data.settings?.header_align || 'start'};
        }

        .section-title, [data-section] > h2, [data-section] > h3 {
           font-size: var(--dynamic-header-size) !important;
           text-align: var(--header-align) !important;
           width: 100% !important;
           display: block !important;
        }

        [data-cv-root] * {
           line-height: var(--line-height) !important;
        }
      `}</style>

      {/* Header */}
      {showHeader && (
        <div data-section data-section-key="header" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: nameAlign === 'center' ? 'center' : (nameAlign === 'end' ? 'flex-end' : 'flex-start'),
          textAlign: nameAlign,
          paddingBottom: '24px',
          marginBottom: 'var(--section-spacing)',
          borderBottom: `2px solid ${accentColor}`,
          position: 'relative',
        }}>
          {data.personalInfo?.photo && (
            <div style={{ marginBottom: '16px' }}>
              <img
                src={data.personalInfo.photo}
                alt=""
                style={{
                  width: '120px', height: '120px',
                  borderRadius: '9999px', objectFit: 'cover',
                  border: `4px solid ${accentColor}`,
                  boxShadow: `0 4px 20px ${accentColor}30`,
                }}
              />
            </div>
          )}
          <h1 style={{
            fontSize: config.nameSize,
            fontFamily: isRtl ? 'var(--global-font)' : "'Playfair Display', serif",
            fontWeight: 700, color: '#111827', letterSpacing: '0.04em', margin: 0
          }}>
            {data.personalInfo?.fullName}
          </h1>
          {data.personalInfo?.jobTitle && (
            <div style={{
              fontSize: `calc(${config.headerSize} * 1.1)`, color: accentColor, marginTop: '6px',
              fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              {data.personalInfo.jobTitle}
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: '-8px', 
            left: nameAlign === 'center' ? '50%' : (nameAlign === 'start' ? (isRtl ? 'auto' : '20px') : (isRtl ? '20px' : 'auto')),
            right: nameAlign === 'start' ? (isRtl ? '20px' : 'auto') : (nameAlign === 'end' ? (isRtl ? 'auto' : '20px') : 'auto'),
            transform: nameAlign === 'center' ? 'translateX(-50%) rotate(45deg)' : 'rotate(45deg)',
            width: '14px', height: '14px', background: accentColor,
          }} />
          <div style={{ marginTop: '14px', width: '100%', display: 'flex', justifyContent: infoAlign === 'center' ? 'center' : (infoAlign === 'end' ? 'flex-end' : 'flex-start') }}>
            <ContactInfo data={data.personalInfo || {}} accentColor={accentColor} bodyStyle={bodyStyle} alignment={infoAlign} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {sectionsToRender.map((key) => (
          <div key={key} data-section style={{ marginBottom: 'var(--section-spacing)', breakInside: 'avoid' }}>
            {renderSection(key, data, { 
              headingStyle, 
              accentColor, 
              visibleSections, 
              language,
              bodyStyle
            })}
          </div>
        ))}
        
        {/* Array-based Custom Sections Injection (Discovery Engine) */}
        {[...(data?.custom_sections || []), ...(data?.customSections || []), ...(data?.sections || [])].map((section, index) => (
          <div key={`elegant-custom-${index}`} data-section style={{ marginBottom: 'var(--section-spacing)', breakInside: 'avoid' }}>
            <h2 className="section-title" style={headingStyle}>{section.title}</h2>
            <div style={bodyStyle}>
              {section.content || section.description || (Array.isArray(section.items) && section.items.map(i => i.name).join(', '))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
