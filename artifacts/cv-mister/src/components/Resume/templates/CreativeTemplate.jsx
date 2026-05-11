// ============================================================
// CreativeTemplate — Dynamic-First Vibrant Template
// Full-width gradient header, adaptive control via data.settings
// ============================================================
import React from 'react';
import { ContactInfo, renderSection } from '../Sections';
import { CATEGORY_SECTION_ORDER, CATEGORIES } from '../../../utils/constants';
import useStyleStore from '../../../store/useStyleStore';
import useResumeStore from '../../../store/useResumeStore';

export default function CreativeTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor: propAccentColor = '#E74C8B',
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
}) {
  const isRtl = language === 'ar';
  const { alignments = {} } = useResumeStore();
  const nameAlign = alignments['full_name'] || 'start';
  const infoAlign = alignments['personal_info'] || 'start';
  
  // ── AUDIT: Settings Verification ───────────
  console.log("CreativeTemplate Settings Audit:", data?.settings);

  const styles = useStyleStore.getState();
  const order = CATEGORY_SECTION_ORDER[category] || CATEGORY_SECTION_ORDER[CATEGORIES.CHRONOLOGICAL];
  
  // ── DYNAMIC CONFIG (Priority: data.settings > useStyleStore) ──
  const s = data?.settings || {};
  const accentColor = propAccentColor || styles.accentColor || '#E74C8B';

  const config = {
    nameSize: s.name_size ? `${s.name_size}pt` : (styles.nameFontSize ? `${styles.nameFontSize}pt` : '32pt'),
    headerSize: s.header_size ? `${s.header_size}pt` : (styles.headingFontSize ? `${styles.headingFontSize}pt` : '13pt'),
    textSize: s.text_size ? `${s.text_size}pt` : (styles.bodyFontSize ? `${styles.bodyFontSize}pt` : '10.5pt'),
    lineHeight: parseFloat(s.line_height || styles.lineHeight || 1.5),
    marginTop: s.margin_top ? `${s.margin_top}mm` : (styles.marginTop ? `${styles.marginTop}mm` : '20mm'),
    marginBottom: s.margin_bottom ? `${s.margin_bottom}mm` : (styles.marginBottom ? `${styles.marginBottom}mm` : '20mm'),
    marginSide: s.margin_side ? `${s.margin_side}mm` : (styles.marginSides ? `${styles.marginSides}mm` : '15mm'),
    sectionSpacing: `${s.section_spacing || styles.sectionGap || 24}px`
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
  const gradient = `linear-gradient(to right, ${accentColor}, #0f172a)`;

  const headingStyle = {
    color: accentColor,
    fontSize: config.headerSize,
    fontWeight: 700,
    position: 'relative',
    paddingInlineStart: '16px',
    marginBottom: '12px',
    textAlign: 'start'
  };

  return (
    <div 
      data-cv-root
      style={{ 
        fontFamily: "var(--global-font)",
        direction: isRtl ? 'rtl' : 'ltr',
        margin: `calc(-1 * var(--margin-top)) calc(-1 * var(--margin-sides)) calc(-1 * var(--margin-bottom))`,
        paddingTop: config.marginTop,
        paddingBottom: config.marginBottom,
        paddingLeft: config.marginSide,
        paddingRight: config.marginSide,
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        // Force internal components to respect user settings
        '--body-font-size': config.textSize,
        '--line-height-global': config.lineHeight
      }}
    >
      <style>{`
        [data-cv-root] {
           --dynamic-header-size: ${data.settings?.header_size || 13.5}pt;
           --line-height: ${data.settings?.line_height || 1.4};
           --section-spacing: ${data.settings?.section_spacing || 32}px;
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

      {/* Gradient Header Banner */}
      {showHeader && (
        <div data-section data-section-key="header" style={{
          background: gradient, 
          color: '#fff',
          padding: '36px 28px 28px',
          margin: `calc(-1 * ${config.marginTop}) calc(-1 * ${config.marginSide}) var(--section-spacing)`,
          position: 'relative',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: nameAlign === 'center' ? 'center' : (nameAlign === 'end' ? 'flex-end' : 'flex-start'),
            flexDirection: nameAlign === 'center' ? 'column' : 'row',
            textAlign: nameAlign,
            gap: '20px' 
          }}>
            {data.personalInfo?.photo && (
              <img src={data.personalInfo.photo} alt=""
                style={{ width: '90px', height: '90px', borderRadius: '16px', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
              />
            )}
            <div>
              <h1 style={{ fontSize: config.nameSize, fontWeight: 800, letterSpacing: '-0.01em', margin: 0, color: '#fff', textAlign: nameAlign }}>
                {data.personalInfo?.fullName}
              </h1>
              {data.personalInfo?.jobTitle && (
                <div style={{ fontSize: `calc(${config.headerSize} * 1.05)`, fontWeight: 400, opacity: 0.95, marginTop: '4px', color: '#fff', textAlign: infoAlign }}>
                  {data.personalInfo.jobTitle}
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: '16px', opacity: 0.95, textShadow: 'none', display: 'flex', justifyContent: infoAlign === 'center' ? 'center' : (infoAlign === 'end' ? 'flex-end' : 'flex-start') }}>
            <ContactInfo data={data.personalInfo || {}} accentColor="#FFFFFF" textColor="#ffffff" bodyStyle={{ ...bodyStyle, color: '#fff' }} alignment={infoAlign} />
          </div>
          {/* Decorative curve */}
          <div style={{
            position: 'absolute', bottom: '-1px', left: 0, right: 0,
            height: '20px', background: '#fff', borderRadius: '20px 20px 0 0',
          }} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {sectionsToRender.map((key) => {
          const section = renderSection(key, data, { 
            headingStyle, 
            accentColor, 
            visibleSections, 
            language,
            bodyStyle
          });
          return section ? (
            <div key={key} data-section style={{ marginBottom: 'var(--section-spacing)' }}>
              {section}
            </div>
          ) : null;
        })}

        {/* Dynamic Custom Sections Discovery */}
        {[...(data?.custom_sections || []), ...(data?.customSections || []), ...(data?.sections || [])].map((section, index) => (
          <div key={`creative-custom-${index}`} data-section style={{ marginBottom: 'var(--section-spacing)', breakInside: 'avoid' }}>
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
