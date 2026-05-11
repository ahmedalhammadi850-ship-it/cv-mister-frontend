// ============================================================
// ExecutiveLineTemplate — Inspired by "Sebastian Bennett"
// Elegant centered header, horizontal section separators
// ============================================================
import React from 'react';
import { renderSection } from '../Sections';
import { CATEGORIES } from '../../../utils/constants';
import useResumeStore from '../../../store/useResumeStore';
import SectionDraggable from '../SectionDraggable';

export default function ExecutiveLineTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor = '#000',
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
  pageId = 'preview'
}) {
  const { layoutColumns, alignments = {} } = useResumeStore();
  const IsDnd = pageId === 'main-canvas' || pageId === 'preview-canvas';
  const isRtl = language === 'ar';
  const nameAlign = alignments['full_name'] || 'center';
  const infoAlign = alignments['personal_info'] || 'center';
  
  // ── AUDIT: Unified Section Strategy ────────────────
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

  const populatedKeys = Object.keys(data).filter(isPopulated);
  
  // Combine layout columns and add any orphans
  const orderedKeys = Array.from(new Set([
    ...(layoutColumns?.columnMain || []),
    ...(layoutColumns?.columnSide || []),
    ...populatedKeys
  ])).filter(k => 
    k !== 'header' && k !== 'personalInfo' && k !== 'settings' && k !== 'customSections' && k !== 'custom_sections' && k !== 'sections' && populatedKeys.includes(k)
  );

  const filterVis = (keys) => visibleSections ? keys.filter(k => visibleSections.includes(k)) : keys;
  const filteredSections = filterVis(orderedKeys);

  const showHeader = visibleSections === null || isFirstPage;

  const headingStyle = {
    fontSize: '12pt',
    fontWeight: 800,
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    padding: '8px 0',
    borderTop: '1px solid #000',
    borderBottom: '1px solid #000',
    marginBottom: '16px',
    textAlign: 'center',
    width: '100%'
  };

  if (pageId === 'measure' && filteredSections.length > 0) {
    console.log(`[Audit: ExecutiveLine] Populated: ${filteredSections.join(', ')}`);
  }
  return (
    <div data-cv-root style={{ direction: language === 'ar' ? 'rtl' : 'ltr', padding: '48px 48px 108px 48px', fontFamily: 'var(--global-font)', color: '#111', minHeight: '100%', flex: 1, backgroundColor: '#fff' }}>
      <style>{`
        [data-cv-root] {
           --dynamic-header-size: ${data.settings?.header_size || 13.5}pt;
           --line-height: ${data.settings?.line_height || 1.7};
           --section-spacing: ${data.settings?.section_spacing || 32}px;
           --header-align: ${data.settings?.header_align || 'center'};
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

      {showHeader && (
        <header data-section data-section-key="header" style={{ textAlign: 'center', marginBottom: 'var(--section-spacing)' }}>
          <h1 style={{ fontSize: data.settings?.name_size ? `${data.settings.name_size}pt` : '26pt', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: nameAlign }}>
            {data.personalInfo?.fullName}
          </h1>
          {data.personalInfo?.jobTitle && (
            <div style={{ fontSize: '11pt', color: '#555', marginTop: '6px', fontStyle: 'italic', fontWeight: 500, textAlign: infoAlign }}>
              {data.personalInfo.jobTitle}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: infoAlign === 'center' ? 'center' : infoAlign === 'right' ? 'flex-end' : 'flex-start', flexWrap: 'wrap', gap: '8px 16px', marginTop: '16px', fontSize: '10pt', color: '#444' }}>
            {[
              data.personalInfo?.phone,
              data.personalInfo?.email,
              data.personalInfo?.location,
              data.personalInfo?.website,
              data.personalInfo?.linkedin,
              data.personalInfo?.github
            ].filter(Boolean).map((text, idx, arr) => (
              <React.Fragment key={idx}>
                <span style={{ whiteSpace: 'nowrap' }}>{text}</span>
                {idx < arr.length - 1 && <span style={{ color: '#ccc', fontWeight: 300 }}>|</span>}
              </React.Fragment>
            ))}
          </div>
        </header>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--section-spacing)' }}>
        {filteredSections.map((key, index) => {
          const content = renderSection(key, data, { 
            accentColor, 
            language, 
            visibleSections, 
            textColor: '#111',
            headingStyle 
          });

          if (!content) return null;

          const wrappedSection = (
            <div key={key} data-section style={{ width: '100%', marginBottom: 'var(--section-spacing)' }}>
              <div style={{ padding: '0 8px' }}>
                {content}
              </div>
            </div>
          );

          return IsDnd ? (
            <SectionDraggable key={key} id={`${key}-${pageId}`} index={index}>
              {wrappedSection}
            </SectionDraggable>
          ) : wrappedSection;
        })}
      </div>
    </div>
  );
}
