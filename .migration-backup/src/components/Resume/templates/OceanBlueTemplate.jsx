// ============================================================
// OceanBlueTemplate — 100% Dynamic-First Architecture
// High-Fidelity "Lars Peeters" Recreation, fully adaptive
// ============================================================
import React from 'react';
import { renderSection, ContactInfo } from '../Sections';
import { CATEGORIES } from '../../../utils/constants';
import useResumeStore from '../../../store/useResumeStore';
import useStyleStore from '../../../store/useStyleStore';
import SectionDraggable from '../SectionDraggable';

export default function OceanBlueTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor: propAccentColor = '#1d4ed8', 
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
  pageId = 'preview'
}) {
  const isRtl = language === 'ar';
  
  // ── DIAGNOSTIC: Dynamic Settings Audit ──────
  console.log("OCEAN_BLUE_SETTINGS:", data?.settings);

  const styles = useStyleStore(); // Re-render on any style change
  const { layoutColumns } = useResumeStore();
  const IsDnd = pageId === 'main-canvas' || pageId === 'preview-canvas';
  
  // ── DYNAMIC CONFIG (Priority: data.settings > useStyleStore) ──
  const s = data?.settings || {};
  const accentColor = propAccentColor || styles.accentColor || '#1d4ed8';

  const config = {
    nameSize: s.name_size ? `${s.name_size}pt` : (styles.nameFontSize ? `${styles.nameFontSize}pt` : '24pt'),
    headerSize: s.header_size ? `${s.header_size}pt` : (styles.headingFontSize ? `${styles.headingFontSize}pt` : '12pt'),
    textSize: s.text_size ? `${s.text_size}pt` : (styles.bodyFontSize ? `${styles.bodyFontSize}pt` : '9pt'),
    lineHeight: parseFloat(s.line_height || styles.lineHeight || 1.4),
    marginTop: s.margin_top ? `${s.margin_top}mm` : (styles.marginTop ? `${styles.marginTop}mm` : '20mm'),
    marginBottom: s.margin_bottom ? `${s.margin_bottom}mm` : (styles.marginBottom ? `${styles.marginBottom}mm` : '20mm'),
    marginSide: `${s.margin_side || styles.marginSides || 15}mm`,
    sectionSpacing: `${s.section_spacing || styles.sectionGap || 20}px`
  };

  const sideSectionsRaw = ['skills', 'languages', 'education', 'courses', 'certificates', 'awards', 'references'];
  const mainSectionsRaw = ['summary', 'experience', 'volunteering', 'activities', 'projects'];

  const isPopulated = (key) => {
    if (key === 'contact') return true; 
    const val = data[key];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'string') return val.trim().length > 0;
    return true;
  };

  const sideSections = sideSectionsRaw.filter(isPopulated);
  const mainSections = mainSectionsRaw.filter(isPopulated);

  // Dynamic Discovery Engine (Ensures Custom Sections are caught and assigned automatically)
  Object.keys(data).forEach(key => {
    if (!sideSections.includes(key) && !mainSections.includes(key) && key !== 'personalInfo' && key !== 'header' && key !== 'settings' && isPopulated(key)) {
      sideSections.push(key);
    }
  });

  const filterVis = (keys) => visibleSections ? keys.filter(k => visibleSections.includes(k)) : keys;
  const showHeader = visibleSections === null || isFirstPage;

  const bodyStyle = {
    fontSize: config.textSize,
    lineHeight: config.lineHeight,
    color: '#333',
    whiteSpace: 'pre-line'
  };

  const DotPattern = ({ style }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 4px)', gap: '6px', ...style }}>
      {[...Array(12)].map((_, i) => <div key={i} style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#CBD5E1' }} />)}
    </div>
  );

  return (
    <div data-cv-root className="ocean-blue-page" style={{ 
      direction: language === 'ar' ? 'rtl' : 'ltr', width: '100%',
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#FFFFFF', 
      fontFamily: 'var(--global-font)', 
      color: '#1F2937',
      // Bridging root styles for sub-components
      '--body-font-size': config.textSize,
      '--line-height-global': config.lineHeight
    }}>
      <style>{`
        [data-cv-root] {
           --dynamic-header-size: ${data.settings?.header_size || 13.5}pt;
           --line-height: ${data.settings?.line_height || 1.7};
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

      {/* 🚀 Dynamic Header */}
      {showHeader && (
        <header data-section data-section-key="header" style={{ 
          paddingTop: config.marginTop,
          paddingLeft: config.marginSide,
          paddingRight: config.marginSide,
          paddingBottom: '10px',
          textAlign: data.settings?.header_align || 'center', 
          position: 'relative'
        }}>
          <DotPattern style={{ position: 'absolute', top: config.marginTop, left: '20px', opacity: 0.5 }} />
          <h1 style={{ fontSize: config.nameSize, fontWeight: 900, color: accentColor, margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            {data.personalInfo?.fullName}
          </h1>
          <div style={{ fontSize: `calc(${config.headerSize} * 1.1)`, fontWeight: 600, color: accentColor, marginTop: '2px', opacity: 0.8 }}>
            {data.personalInfo?.jobTitle}
          </div>
        </header>
      )}

      {/* 🟦 Optimized Power Bar (Dynamic) */}
      {showHeader && (
        <div data-section style={{ 
          backgroundColor: accentColor, 
          padding: `16px ${config.marginSide}`, 
          display: 'flex', 
          flexDirection: isRtl ? 'row-reverse' : 'row', 
          color: '#FFFFFF',
          gap: '40px', 
          alignItems: 'stretch',
          marginBottom: 'var(--section-spacing)'
        }}>
          <div data-section-key="contact" style={{ width: '33%', flexShrink: 0, paddingInlineEnd: '20px' }}>
            <ContactInfo data={data.personalInfo} layout="stacked" accentColor="#FFFFFF" textColor="#FFFFFF" alignment={'start'} />
          </div>
          <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <div data-section-key="summary" style={{ flex: 1, paddingInlineStart: '20px', textAlign: 'start' }}>
            <h3 className="section-title" style={{ fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase' }}>
              {isRtl ? 'الملخص المهني' : (language === 'ar' ? 'الملخص المهني' : 'Professional Summary')}
            </h3>
            <div style={{ fontSize: config.textSize, lineHeight: config.lineHeight, opacity: 0.95 }}>
              {data.summary}
            </div>
          </div>
        </div>
      )}

      {/* 📄 Sequential CSS-Columns Body */}
      <div 
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{ 
          display: 'block', 
          columnCount: 2,
          columnGap: '32px', 
          columnRule: '1px solid #E5E7EB',
          columnFill: 'balance', 
          paddingLeft: config.marginSide,
          paddingRight: config.marginSide,
          paddingBottom: config.marginBottom,
          paddingTop: showHeader ? '0px' : config.marginTop,
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {filterVis([...mainSections, ...sideSections])
          .filter(k => k !== 'header' && k !== 'personalInfo' && k !== 'summary' && k !== 'settings')
          .map((key, index) => {
            const content = (
              <div 
                key={key} 
                data-section
                style={{ 
                  marginBottom: 'var(--section-spacing)', 
                  breakInside: 'avoid-column', 
                  pageBreakInside: 'avoid',
                  width: '100%',
                  display: 'block' 
                }}
              >
                <h3 className="section-title" style={{ 
                  color: accentColor, 
                  fontSize: config.headerSize, 
                  fontWeight: 800, 
                  marginBottom: '8px', 
                  textTransform: 'uppercase', 
                  borderBottom: `1px solid ${accentColor}20`, 
                  paddingBottom: '2px',
                  textAlign: 'start'
                }}>
                  {renderSection(key, data, { headingOnly: true, language })}
                </h3>
                <div style={{ ...bodyStyle }}>
                  {renderSection(key, data, { noHeading: true, accentColor, language, visibleSections, textColor: '#333', bodyStyle })}
                </div>
              </div>
            );

            return IsDnd ? (
              <SectionDraggable key={key} id={`${key}-ocean-${pageId}`} index={index}>
                {content}
              </SectionDraggable>
            ) : content;
          })}
      </div>
    </div>
  );
}
