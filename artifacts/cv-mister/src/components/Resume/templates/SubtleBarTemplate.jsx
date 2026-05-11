// ============================================================
// SubtleBarTemplate — Centered Single Column with Gray Footer
// Minimalist spacing, horizontal contact list, bottom gray bar
// ============================================================
import React from 'react';
import { renderSection, ContactInfo } from '../Sections';
import { CATEGORIES } from '../../../utils/constants';
import useResumeStore from '../../../store/useResumeStore';
import useStyleStore from '../../../store/useStyleStore';
import SectionDraggable from '../SectionDraggable';

export default function SubtleBarTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor = '#1e293b',
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
  pageId = 'preview'
}) {
  const { layoutColumns, alignments = {} } = useResumeStore();
  const { headerAlign: storeHeaderAlign } = useStyleStore();
  const IsDnd = pageId === 'main-canvas' || pageId === 'preview-canvas';
  const isRtl = language === 'ar';
  const globalAlign = storeHeaderAlign || data.settings?.header_align || 'center';
  const nameAlign = alignments['full_name'] || globalAlign;
  const infoAlign = alignments['personal_info'] || globalAlign;
  
  // Single Column: merge everything
  const allPossibleKeys = [
    ...(layoutColumns?.columnMain || []),
    ...(layoutColumns?.columnSide || []),
    ...Object.keys(data).filter(k => k.startsWith('custom_'))
  ];
  const sections = Array.from(new Set(allPossibleKeys)).filter(k => 
    k !== 'header' && k !== 'personalInfo' && (data[k]?.length > 0 || typeof data[k] === 'string')
  );

  const filteredSections = visibleSections ? sections.filter(k => visibleSections.includes(k)) : sections;

  const showHeader = visibleSections === null || isFirstPage;

  const s = data?.settings || {};
  const config = {
    nameSize: s.name_size ? `${s.name_size}pt` : '26pt',
    headerSize: s.header_size ? `${s.header_size}pt` : '11pt',
    textSize: s.text_size ? `${s.text_size}pt` : '9pt',
    lineHeight: parseFloat(s.line_height || 1.6),
    sectionSpacing: `${s.section_spacing || 32}px`,
    headerAlign: storeHeaderAlign || s.header_align || 'center'
  };

  const headingStyle = {
    color: '#000000', fontSize: config.headerSize, fontWeight: 800,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    marginBottom: '10px', textAlign: config.headerAlign
  };

  return (
    <div data-cv-root style={{ 
      direction: language === 'ar' ? 'rtl' : 'ltr', position: 'relative',
      minHeight: '100%', 
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      fontFamily: 'var(--global-font)', 
      color: '#1F2937'
    }}>
      <style>{`
        [data-cv-root] {
           --dynamic-header-size: ${data.settings?.header_size || 13.5}pt;
           --line-height: ${data.settings?.line_height || 1.6};
           --section-spacing: ${data.settings?.section_spacing || 32}px;
           --header-align: ${config.headerAlign};
        }

        .section-title, [data-section] > h2, [data-section] > h3 {
           font-size: var(--dynamic-header-size) !important;
           width: 100% !important;
           display: block !important;
        }

        [data-cv-root] * {
           line-height: var(--line-height) !important;
        }

        .subtle-heading-bar {
           text-align: var(--header-align) !important;
        }
      `}</style>

      <div style={{ padding: '60px 48px 100px 48px', flex: 1 }}>
        {showHeader && (
          <header data-section data-section-key="header" style={{ marginBottom: 'var(--section-spacing)', textAlign: nameAlign }}>
            <h1 style={{ fontSize: config.nameSize, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: nameAlign }}>
              {data.personalInfo?.fullName}
            </h1>
            {data.personalInfo?.jobTitle && (
              <div style={{ fontSize: '12pt', color: '#6B7280', fontWeight: 500, marginTop: '4px', marginBottom: '16px', textAlign: infoAlign }}>
                {data.personalInfo.jobTitle}
              </div>
            )}
            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '12px' }}>
               <ContactInfo data={data.personalInfo} alignment={data.settings?.header_align || 'center'} accentColor={accentColor} />
            </div>
          </header>
        )}

        <main style={{ display: 'flex', flexDirection: 'column', gap: 'var(--section-spacing)' }}>
          {filteredSections.map((key, index) => {
             const content = (
               <div key={key} data-section data-section-key={key} style={{ marginBottom: 'var(--section-spacing)' }}>
                 <div className="subtle-heading-bar" style={{
                   backgroundColor: '#F1F5F9',
                   color: '#1E293B',
                   padding: '10px 16px',
                   borderRadius: '2px',
                   fontSize: config.headerSize,
                   fontWeight: 800,
                   textTransform: 'uppercase',
                   letterSpacing: '0.05em',
                   display: 'block',
                   width: '100%',
                   marginBottom: '14px',
                   lineHeight: 1.2,
                   borderInlineStart: `4px solid ${accentColor}`
                 }}>
                   {renderSection(key, data, { headingOnly: true, language })}
                 </div>
                 {renderSection(key, data, { noHeading: true, accentColor, language, visibleSections, textColor: '#333' })}
               </div>
             );
             return IsDnd ? <SectionDraggable key={key} id={`${key}-main-${pageId}`} index={index}>{content}</SectionDraggable> : content;
          })}
        </main>
      </div>

      {/* The Bottom Bar (Safe Space) */}
      <div style={{ 
        height: '40px', 
        width: '100%', 
        backgroundColor: '#F3F4F6', 
        marginTop: 'auto' 
      }} />
    </div>
  );
}
