// ============================================================
// SkySplitTemplate — Reinforced Dynamic Architecture
// Inspired by "Nadia Omran" Design, with full-width header
// ============================================================
import React, { useEffect } from 'react';
import { renderSection, ContactInfo } from '../Sections';
import { CATEGORIES } from '../../../utils/constants';
import useResumeStore from '../../../store/useResumeStore';
import useStyleStore from '../../../store/useStyleStore';
import SectionDraggable from '../SectionDraggable';

export default function SkySplitTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor: propAccentColor = '#a5b4bc', 
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
  pageId = 'preview'
}) {
  const isRtl = language === 'ar';
  
  // ── 1. TEST DATA INJECTION ──────
  console.log("DYNAMICS_CHECK:", data?.settings);

  const styles = useStyleStore(); // Re-render hook for live slider
  const { layoutColumns, alignments = {} } = useResumeStore();
  const IsDnd = pageId === 'main-canvas' || pageId === 'preview-canvas';
  
  // ── DYNAMIC CONFIG (Priority: Backend data.settings > StyleStore Slider fallback) ──
  const s = data?.settings || {};
  const accentColor = propAccentColor || styles.accentColor || '#a5b4bc';

  const config = {
    nameSize: s.name_size ? `${s.name_size}pt` : (styles.nameFontSize ? `${styles.nameFontSize}pt` : '26pt'),
    headerSize: s.header_size ? `${s.header_size}pt` : (styles.headingFontSize ? `${styles.headingFontSize}pt` : '11pt'),
    textSize: s.text_size ? `${s.text_size}pt` : (styles.bodyFontSize ? `${styles.bodyFontSize}pt` : '9.5pt'),
    lineHeight: data?.settings?.line_height || styles.lineHeight || 1.4,
    marginTop: s.margin_top ? `${s.margin_top}mm` : (styles.marginTop ? `${styles.marginTop}mm` : '20mm'),
    marginBottom: s.margin_bottom ? `${s.margin_bottom}mm` : (styles.marginBottom ? `${styles.marginBottom}mm` : '20mm'),
    marginSide: s.margin_side || styles.marginSides || 15, // Numerical for style tag
    sectionSpacing: s.section_spacing !== undefined ? s.section_spacing : (styles.sectionGap || 24),
    headerAlign: alignments['header'] || s.header_align || 'start'
  };

  const getFlexJustify = (align) => {
    if (align === 'center') return 'center';
    if (align === 'right') return isRtl ? 'flex-start' : 'flex-end';
    if (align === 'left') return isRtl ? 'flex-end' : 'flex-start';
    return 'flex-start';
  };

  // Let CSS handle the override per user request.

  const sideSectionsRaw = ['skills', 'languages', 'awards', 'certificates', 'references'];
  const mainSectionsRaw = ['summary', 'experience', 'education', 'volunteering', 'projects'];

  const isPopulated = (key) => {
    if (key === 'contact' || key === 'summary' || key === 'personal_info') return true; 
    const val = data[key];
    if (!val && key === 'personal_info') return true; // Always show if key exists
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'string') return val.trim().length > 0;
    return true;
  };

  const sideSections = Array.from(new Set(sideSectionsRaw)).filter(isPopulated);
  let mainSections = Array.from(new Set(mainSectionsRaw)).filter(isPopulated);

  Object.keys(data).forEach(key => {
    if (key !== 'personalInfo' && key !== 'header' && key !== 'personal_info' && key !== 'summary' && key !== 'contact' && key !== 'settings' && isPopulated(key)) {
      if (!sideSections.includes(key) && !mainSections.includes(key)) {
        sideSections.push(key);
      }
    }
  });

  const filterVis = (keys) => visibleSections ? keys.filter(k => visibleSections.includes(k)) : keys;
  const showHeader = visibleSections === null || isFirstPage;

  const headingStyle = {
    color: accentColor, 
    fontSize: config.headerSize, 
    fontWeight: 800,
    marginBottom: '8px', 
    display: 'block', 
    borderBottom: `2px solid ${accentColor}40`, 
    paddingBottom: '2px',
    textTransform: 'uppercase',
    textAlign: config.headerAlign
  };

  const bodyStyle = {
    fontSize: config.textSize,
    color: '#333',
    whiteSpace: 'pre-line'
  };

  return (
    <div data-cv-root className="main-cv-wrapper" style={{ 
      direction: language === 'ar' ? 'rtl' : 'ltr', width: '100%',
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#FFFFFF', 
      fontFamily: 'var(--global-font)', 
      color: '#1F2937',
      // Dynamic Root Variables
      '--body-font-size': config.textSize,
      '--global-line-height': config.lineHeight
    }}>
      <style>{`
        [data-cv-root] {
           --dynamic-header-size: ${data.settings?.header_size || 13.5}pt;
           --line-height: ${data.settings?.line_height || 1.5};
           --section-spacing: ${data.settings?.section_spacing || 32}px;
           --header-align: ${data.settings?.header_align || 'start'};
        }

        .section-title, .resume-heading, .section-header, [data-section] > h2, [data-section] > h3 {
           font-size: var(--dynamic-header-size) !important;
           text-align: var(--header-align) !important;
           width: 100% !important;
           display: block !important;
        }

        [data-cv-root] * {
           line-height: var(--line-height) !important;
        }

        /* منع توريث المحاذاة للنصوص الداخلية المحددة */
        .section-content, .section-body, .section-item-title, .section-description, [data-section-key], .project-item *, .experience-item *, .education-item * {
           text-align: ${'start'} !important; 
        }
      `}</style>
      
      {/* 🚀 Header */}
      {showHeader && !mainSections.includes('personal_info') && !sideSections.includes('personal_info') && (
        <header data-section data-section-key="header" style={{ 
          backgroundColor: accentColor, 
          paddingTop: `calc(${config.marginTop} + 12px)`,
          paddingBottom: '24px',
          color: '#1e293b',
          margin: `calc(-1 * ${config.marginTop}) calc(-1 * ${config.marginSide}mm) 0 calc(-1 * ${config.marginSide}mm)`,
          marginBottom: 'var(--section-spacing)'
        }}>
          <h1 style={{ fontSize: config.nameSize, fontWeight: 900, marginBottom: '2px', letterSpacing: '0.05em', margin: 0, textAlign: alignments['full_name'] || config.headerAlign || 'center', color: '#FFFFFF' }}>
            {data?.personalInfo?.fullName}
          </h1>
          {data?.personalInfo?.jobTitle && (
            <div style={{ fontSize: `calc(${config.headerSize} * 1.1)`, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.9, marginTop: '4px', textAlign: alignments['personal_info'] || config.headerAlign || 'center', color: '#FFFFFF' }}>
              {data?.personalInfo?.jobTitle}
            </div>
          )}
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: getFlexJustify(alignments['personal_info']) }}>
            <ContactInfo data={data?.personalInfo} layout="row" accentColor="#FFFFFF" textColor="#FFFFFF" alignment={alignments['personal_info'] || config.headerAlign || 'center'} />
          </div>
        </header>
      )}

      {/* 📄 Sequential Full-Width Body */}
      <div className="sky-split-body" style={{ 
        paddingLeft: `${config.marginSide}mm`,
        paddingRight: `${config.marginSide}mm`,
        paddingTop: showHeader ? '0' : config.marginTop,
        paddingBottom: config.marginBottom,
        width: '100%',
        boxSizing: 'border-box'
      }}>
         {filterVis([...mainSections, ...sideSections])
           .filter(k => k!=='header' && k!=='personalInfo' && k!=='settings' && k!=='custom_sections')
           .map((key, index) => {
           const content = (
             <div key={key} data-section data-section-key={key} style={{ 
               display: 'block',
               marginBottom: 'var(--section-spacing)',
               ...bodyStyle
             }}>
               {renderSection(key, data, { headingStyle, accentColor, language, visibleSections, textColor: '#333', bodyStyle })}
             </div>
           );
           return IsDnd ? <SectionDraggable key={key} id={`${key}-sky-${pageId}`} index={index}>{content}</SectionDraggable> : content;
         })}
         
         {/* Custom Array Discovery with Forced Spacing attributes */}
         {[...(data?.custom_sections || []), ...(data?.customSections || [])].map((section, idx) => (
            <div key={`sky-custom-${idx}`} data-section data-section-key={`custom_${idx}`} style={{ breakInside: 'avoid', marginBottom: 'var(--section-spacing)' }}>
               <h3 className="section-title" style={headingStyle}>{section.title}</h3>
               <div style={bodyStyle}>
                  {section.content || section.description}
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
