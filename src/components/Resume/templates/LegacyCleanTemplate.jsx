// ============================================================
// LegacyCleanTemplate — Quiet Luxury / Refined Premium Design
// Clean, sophisticated, and professional with minimal accents.
// ============================================================
import React from 'react';
import { renderSection, ContactInfo } from '../Sections';
import { CATEGORIES } from '../../../utils/constants';
import useResumeStore from '../../../store/useResumeStore';
import useStyleStore from '../../../store/useStyleStore';
import SectionDraggable from '../SectionDraggable';

export default function LegacyCleanTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor = '#111827',
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
  pageId = 'preview'
}) {
  const { layoutColumns } = useResumeStore();
  const IsDnd = pageId === 'main-canvas' || pageId === 'preview-canvas';
  const isRtl = language === 'ar';
  
  // Refined splitting
  const sideSections = layoutColumns?.columnSide?.filter(k => k !== 'contact') || ['education', 'skills', 'languages'];
  const mainSections = layoutColumns?.columnMain?.filter(k => k !== 'personal_info' && k !== 'header') || ['summary', 'experience', 'projects', 'awards', 'references'];

  const allKnownKeys = [...mainSections, ...sideSections];
  const dataKeys = Object.keys(data).filter(k => k.startsWith('custom_') || [
    'summary', 'experience', 'education', 'skills', 'projects', 'languages', 'certificates', 'awards', 'volunteering', 'references'
  ].includes(k));
  
  const finalMain = [...mainSections];
  dataKeys.forEach(k => {
    if (!allKnownKeys.includes(k) && k !== 'personalInfo' && k !== 'header' && k !== 'personal_info') {
      finalMain.push(k);
    }
  });

  const filteredMain = (visibleSections ? finalMain.filter(k => visibleSections.includes(k)) : finalMain).filter(k => k !== 'personal_info' && k !== 'header');
  const filteredSide = (visibleSections ? sideSections.filter(k => visibleSections.includes(k)) : sideSections).filter(k => k !== 'personal_info' && k !== 'header');

  const showHeader = visibleSections === null || isFirstPage;

  const headingStyle = {
    color: '#111827', 
    fontSize: '12pt', 
    fontWeight: 800,
    textTransform: 'uppercase', 
    letterSpacing: '0.1em',
    marginBottom: '12px', 
    borderInlineStart: `4px solid ${accentColor}`,
    paddingInlineStart: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  return (
    <div data-cv-root style={{ 
      direction: language === 'ar' ? 'rtl' : 'ltr', padding: '50px 60px',
      fontFamily: 'var(--global-font)', 
      minHeight: '100%', 
      flex: 1, 
      backgroundColor: '#FFFFFF',
      color: '#334155'
    }}>
      <style>{`
        [data-cv-root] {
           --dynamic-header-size: ${data.settings?.header_size || 13}pt;
           --line-height: ${data.settings?.line_height || 1.6};
           --section-spacing: ${data.settings?.section_spacing || 32}px;
        }

        .section-title, [data-section] > h2, [data-section] > h3 {
           font-size: var(--dynamic-header-size) !important;
           width: 100% !important;
           display: block !important;
           text-align: start !important;
        }

        [data-cv-root] * {
           line-height: var(--line-height) !important;
        }
      `}</style>

      {showHeader && (
        <header data-section data-section-key="header" style={{ 
          marginBottom: '40px',
          textAlign: 'start',
          borderBottom: `1px solid #E2E8F0`,
          paddingBottom: '30px'
        }}>
          <h1 style={{ fontSize: '30pt', fontWeight: 900, marginBottom: '6px', color: '#111827', textTransform: 'uppercase' }}>
            {data.personalInfo?.fullName}
          </h1>
          <div style={{ fontSize: '14pt', color: accentColor, fontWeight: 700, letterSpacing: '0.05em', marginBottom: '16px' }}>
            {data.personalInfo?.jobTitle}
          </div>
          <ContactInfo data={data.personalInfo} layout="row" accentColor={accentColor} alignment="start" />
        </header>
      )}

      <div style={{ display: 'flex', gap: '50px' }}>
        {/* Main Column */}
        <div style={{ flex: 1 }}>
           {filteredMain.map((key, index) => {
             const content = (
               <div key={key} data-section data-section-key={key} style={{ marginBottom: 'var(--section-spacing)' }}>
                 {renderSection(key, data, { 
                   headingStyle, 
                   accentColor, 
                   language, 
                   visibleSections, 
                   textColor: '#334155' 
                 })}
               </div>
             );
             return IsDnd ? <SectionDraggable key={key} id={`${key}-main-${pageId}`} index={index}>{content}</SectionDraggable> : content;
           })}
        </div>

        {/* Sidebar Column */}
        <div style={{ flex: '0 0 30%', borderInlineStart: `1px solid #F1F5F9`, paddingInlineStart: '30px' }}>
           {filteredSide.map((key, index) => {
             const content = (
               <div key={key} data-section data-section-key={key} style={{ marginBottom: 'var(--section-spacing)' }}>
                 {renderSection(key, data, { 
                   headingStyle: { ...headingStyle, fontSize: '11pt' }, 
                   accentColor, 
                   language, 
                   visibleSections, 
                   textColor: '#475569',
                   showSkillBars: true 
                 })}
               </div>
             );
             return IsDnd ? <SectionDraggable key={key} id={`${key}-side-${pageId}`} index={index}>{content}</SectionDraggable> : content;
           })}
        </div>
      </div>
    </div>
  );
}
