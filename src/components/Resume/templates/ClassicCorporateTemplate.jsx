// ============================================================
// ClassicCorporateTemplate — Inspired by "Laya Abdelrahman"
// Clean, authoritative, single column with strong dividers
// ============================================================
import React from 'react';
import { renderSection } from '../Sections';
import { CATEGORIES } from '../../../utils/constants';
import useResumeStore from '../../../store/useResumeStore';
import SectionDraggable from '../SectionDraggable';

export default function ClassicCorporateTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor = '#1F2937',
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
  pageId = 'preview'
}) {
  const IsDnd = pageId === 'main-canvas' || pageId === 'preview-canvas';
  const { alignments = {} } = useResumeStore();
  const isRtl = language === 'ar';
  const nameAlign = alignments['full_name'] || 'start';
  const infoAlign = alignments['personal_info'] || 'start';
  
  // ── AUDIT: Clean De-duplicated Logic ────────────────
  const isPopulated = (key) => {
    const val = data[key];
    if (!val) return false;
    if (Array.isArray(val)) {
      if (val.length === 0) return false;
      return val.some(item => {
        if (!item) return false;
        if (typeof item === 'string') return item.trim().length > 0;
        const textFields = Object.values(item).filter(v => typeof v === 'string');
        return textFields.some(tf => tf.trim().length > 0);
      });
    }
    if (typeof val === 'string') return val.trim().length > 0;
    return true;
  };

  const standardKeys = [
    'summary', 'experience', 'education', 'skills', 'projects', 
    'languages', 'certificates', 'awards', 'volunteering', 'references'
  ];
  
  const populatedKeys = Object.keys(data).filter(isPopulated);
  
  // Create a UNIQUE list of sections to prevent any double-rendering
  const sectionList = Array.from(new Set([
    ...standardKeys.filter(k => populatedKeys.includes(k)),
    ...populatedKeys.filter(k => !standardKeys.includes(k) && !['personalInfo', 'header', 'personal_info', 'settings', 'customSections', 'custom_sections', 'sections'].includes(k))
  ]));

  const filteredSections = visibleSections ? sectionList.filter(k => visibleSections.includes(k)) : sectionList;
  const showHeader = visibleSections === null || isFirstPage;

  const headingStyle = {
    fontSize: '11pt',
    fontWeight: 800,
    color: accentColor,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    borderBottom: `1px solid ${accentColor}`,
    paddingBottom: '2px',
    marginBottom: '12px',
    width: '100%',
    display: 'block'
  };

  return (
    <div data-cv-root className="classic-corporate-template" style={{ direction: language === 'ar' ? 'rtl' : 'ltr', padding: '50px 60px', fontFamily: 'var(--global-font)', minHeight: '100%', flex: 1, backgroundColor: '#FFFFFF' }}>
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
      
      {/* 1. Header (Once Only) */}
      {showHeader && (
        <header data-section data-section-key="header" style={{ marginBottom: 'var(--section-spacing)' }}>
          <h1 style={{ fontSize: data.settings?.name_size ? `${data.settings.name_size}pt` : '26pt', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', textAlign: nameAlign }}>
            {data.personalInfo?.fullName}
          </h1>
          {data.personalInfo?.jobTitle && (
            <div style={{ fontSize: '11pt', color: accentColor, fontWeight: 600, marginTop: '2px', textAlign: infoAlign }}>
              {data.personalInfo.jobTitle}
            </div>
          )}
          <div style={{ width: '100%', height: '1.5pt', background: '#000', marginTop: '12px', marginBottom: '16px' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '20px', rowGap: '8px', fontSize: '10pt', color: '#444', justifyContent: infoAlign === 'center' ? 'center' : infoAlign === 'right' ? 'flex-end' : 'flex-start' }}>
            {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo?.phone && <><span style={{ color: '#ccc' }}>|</span> <span>{data.personalInfo.phone}</span></>}
            {data.personalInfo?.location && <><span style={{ color: '#ccc' }}>|</span> <span>{data.personalInfo.location}</span></>}
            {data.personalInfo?.website && <><span style={{ color: '#ccc' }}>|</span> <span>{data.personalInfo.website}</span></>}
            {data.personalInfo?.linkedin && <><span style={{ color: '#ccc' }}>|</span> <span>{data.personalInfo.linkedin}</span></>}
            {data.personalInfo?.github && <><span style={{ color: '#ccc' }}>|</span> <span>{data.personalInfo.github}</span></>}
          </div>
        </header>
      )}

      {/* 2. Unified Content Loop (No Redundancy) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--section-spacing)' }}>
        {filteredSections.map((key, index) => {
          const content = renderSection(key, data, { 
            headingStyle, 
            accentColor, 
            language, 
            visibleSections, 
            textColor: '#111' 
          });

          if (!content) return null;

          const wrappedContent = (
            <div key={key} data-section style={{ marginBottom: 'var(--section-spacing)', breakInside: 'avoid' }}>
              {content}
            </div>
          );
          
          return IsDnd ? <SectionDraggable key={key} id={`${key}-${pageId}`} index={index}>{wrappedContent}</SectionDraggable> : wrappedContent;
        })}
      </div>
    </div>
  );
}
