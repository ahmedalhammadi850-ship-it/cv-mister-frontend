// ============================================================
// BorderGridTemplate — Structured Minimalist
// Clean lines, grid-like separation, architectural feel
// ============================================================
import React from 'react';
import { renderSection, ContactInfo } from '../Sections';
import { CATEGORIES } from '../../../utils/constants';
import useResumeStore from '../../../store/useResumeStore';
import SectionDraggable from '../SectionDraggable';

export default function BorderGridTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor = '#1E293B',
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
  pageId = 'preview'
}) {
  const { layoutColumns, alignments = {} } = useResumeStore();
  const IsDnd = pageId === 'main-canvas' || pageId === 'preview-canvas';
  
  // ── AUDIT: Dynamic Section Discovery ────────────────
  const isPopulated = (key) => {
    const val = data[key];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'string') return val.trim().length > 0;
    return true;
  };
  const populatedKeys = Object.keys(data).filter(isPopulated);
  const allSections = Array.from(new Set([
    'personal_info',
    ...(layoutColumns?.columnMain || []),
    ...(layoutColumns?.columnSide || []),
    ...populatedKeys.filter(k => k.startsWith('custom_'))
  ])).filter(k => k !== 'header' && k !== 'personalInfo' && (k === 'personal_info' || populatedKeys.includes(k)));
  
  const filteredSections = visibleSections 
    ? allSections.filter(key => visibleSections.includes(key))
    : allSections;

  const showHeader = visibleSections === null || isFirstPage;
  const isRtl = language === 'ar';
  const headerAlign = alignments['header'] || data.settings?.header_align || 'start';
  const nameAlign = alignments['full_name'] || headerAlign;
  const infoAlign = alignments['personal_info'] || headerAlign;

  return (
    <div data-cv-root style={{ direction: language === 'ar' ? 'rtl' : 'ltr', padding: '40px 48px 60px 48px', fontFamily: 'var(--global-font)', minHeight: '100%', flex: 1, backgroundColor: '#FFFFFF' }}>
      <style>{`
        [data-cv-root] {
           --dynamic-header-size: ${data.settings?.header_size || 13.5}pt;
           --line-height: ${data.settings?.line_height || 1.7};
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

      {showHeader && !filteredSections.includes('personal_info') && (
        <header data-section data-section-key="header" style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: (headerAlign === 'center' ? 'center' : (headerAlign === 'right' ? 'flex-end' : (headerAlign === 'left' ? 'flex-start' : (isRtl ? 'flex-start' : 'flex-start')))),
          paddingBottom: '24px',
          borderBottom: `2px solid ${accentColor}`,
          marginBottom: 'var(--section-spacing)',
          textAlign: headerAlign
        }}>
          <h1 style={{ fontSize: data.settings?.name_size ? `${data.settings.name_size}pt` : '26pt', fontWeight: 900, color: '#000000', margin: 0, textTransform: 'uppercase', textAlign: nameAlign }}>
            {data.personalInfo?.fullName}
          </h1>
          {data.personalInfo?.jobTitle && (
            <div style={{ fontSize: '13pt', color: accentColor, fontWeight: 700, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: infoAlign }}>
              {data.personalInfo.jobTitle}
            </div>
          )}
          <div style={{ marginTop: '14px', width: '100%' }}>
            <ContactInfo data={data.personalInfo} layout="row" accentColor={accentColor} alignment={headerAlign} />
          </div>
        </header>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--section-spacing)' }}>
        {filteredSections.map((key, index) => {
          const sideTitle = renderSection(key, data, { headingOnly: true, language });
          const mainBody  = renderSection(key, data, { noHeading: true, accentColor, language, visibleSections });
          
          if (!mainBody) return null;

          const content = (
            <div key={key} data-section data-section-key={key} style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '12px',
              borderBottom: `1px solid #E2E8F0`,
              paddingBottom: '20px'
            }}>
              <div style={{ width: '100%', textAlign: 'start' }}>
                <h3 className="section-title" style={{ 
                   fontSize: '12pt', 
                   fontWeight: 800, 
                   color: accentColor, 
                   textTransform: 'uppercase', 
                   letterSpacing: '0.05em',
                   borderInlineStart: `4px solid ${accentColor}`,
                   paddingInlineStart: '12px'
                }}>
                  {sideTitle}
                </h3>
              </div>
              <div style={{ width: '100%' }}>
                 {mainBody}
              </div>
            </div>
          );
          return IsDnd ? <SectionDraggable key={key} id={`${key}-${pageId}`} index={index}>{content}</SectionDraggable> : content;
        })}
      </div>
    </div>
  );
}
