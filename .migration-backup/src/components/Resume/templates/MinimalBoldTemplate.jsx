// ============================================================
// MinimalBoldTemplate — Bold Centered Header & Sidebar Split
// High-impact typography, clean icons, organized flow
// ============================================================
import React from 'react';
import { renderSection, ContactInfo } from '../Sections';
import { CATEGORIES } from '../../../utils/constants';
import useResumeStore from '../../../store/useResumeStore';
import SectionDraggable from '../SectionDraggable';

export default function MinimalBoldTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor = '#0F172A',
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
  
  // ── AUDIT: Data Key Synchronization & Exhaustive Mapping ────────────────
  const sideSectionsRaw = layoutColumns?.columnSide || ['skills', 'education', 'languages', 'certificates', 'awards'];
  const mainSectionsRaw = layoutColumns?.columnMain || ['summary', 'experience', 'projects', 'volunteering', 'activities', 'references'];

  // Exhaustive list of known keys to distinguish from custom/new modules
  const standardKeys = [
    'personalInfo', 'summary', 'experience', 'education', 'skills', 
    'projects', 'languages', 'certificates', 'awards', 'volunteering', 
    'activities', 'references', 'header'
  ];

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

  // Dynamic Catch-all: Ensure NO DATA is left behind
  const allPopulatedKeys = Object.keys(data).filter(isPopulated);
  
  const sideSections = sideSectionsRaw.filter(k => allPopulatedKeys.includes(k));
  const mainSections = [...mainSectionsRaw].filter(k => allPopulatedKeys.includes(k));

  // Append any "orphaned" keys that are populated but not in either column
  allPopulatedKeys.forEach(key => {
    if (!sideSections.includes(key) && !mainSections.includes(key) && !['personalInfo', 'header'].includes(key)) {
      mainSections.push(key);
    }
  });

  // Diagnostic Logging for Developer Review
  if (pageId === 'measure') {
    console.log(`[Audit: MinimalBold] Populated: ${allPopulatedKeys.join(', ')}`);
  }

  const filterVis = (keys) => visibleSections ? keys.filter(k => visibleSections.includes(k)) : keys;
  const showHeader = visibleSections === null || isFirstPage;

  const headingStyle = {
    color: '#111827', fontSize: '11pt', fontWeight: 800,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    marginBottom: '10px', borderBottom: `2px solid ${accentColor}`,
    display: 'inline-block', paddingBottom: '2px'
  };

  return (
    <div data-cv-root style={{ 
      direction: language === 'ar' ? 'rtl' : 'ltr', padding: '32px 48px 60px 48px', 
      fontFamily: 'var(--global-font)', 
      minHeight: '100%', 
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      color: '#1F2937'
    }}>
      <style>{`
        [data-cv-root] {
           --dynamic-header-size: ${data.settings?.header_size || 13.5}pt;
           --line-height: ${data.settings?.line_height || 1.6};
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

      {showHeader && (
        <header data-section data-section-key="header" style={{ marginBottom: 'var(--section-spacing)', textAlign: nameAlign }}>
          <h1 style={{ fontSize: data.settings?.name_size ? `${data.settings.name_size}pt` : '26pt', fontWeight: 900, marginBottom: '4px', letterSpacing: '0.02em', color: '#111827', textTransform: 'uppercase', textAlign: nameAlign }}>
            {data.personalInfo?.fullName}
          </h1>
          {data.personalInfo?.jobTitle && (
            <div style={{ fontSize: '13pt', fontWeight: 600, color: accentColor, marginBottom: '12px', opacity: 0.9, textAlign: infoAlign }}>
              {data.personalInfo.jobTitle}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: infoAlign === 'center' ? 'center' : infoAlign === 'right' ? 'flex-end' : 'flex-start', gap: '8px 16px', fontSize: '10pt', color: '#4B5563', flexWrap: 'wrap', alignItems: 'center' }}>
             {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
             {data.personalInfo?.phone && <><span style={{ color: '#CBD5E1' }}>|</span> <span>{data.personalInfo.phone}</span></>}
             {data.personalInfo?.location && <><span style={{ color: '#CBD5E1' }}>|</span> <span>{data.personalInfo.location}</span></>}
             {data.personalInfo?.website && <><span style={{ color: '#CBD5E1' }}>|</span> <span>{data.personalInfo.website}</span></>}
          </div>
          <div style={{ marginTop: '16px', width: '40px', height: '1.5px', background: accentColor, marginInline: 'auto', opacity: 0.3 }} />
        </header>
      )}

      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        flexWrap: 'nowrap',
        alignItems: 'flex-start',
        gap: '40px',
        flex: 1
      }}>
        {/* Main Column (Flex-1) */}
        <div style={{ flex: 1 }}>
           {filterVis(mainSections).filter(k => k !== 'header' && k !== 'personalInfo').map((key, index) => {
             const content = renderSection(key, data, { 
               accentColor, 
               language, 
               visibleSections, 
               textColor: '#333', 
               headingStyle 
             });
             
             if (!content) return null;
             
             const wrappedContent = (
               <div key={key} data-section style={{ marginBottom: 'var(--section-spacing)' }}>
                 {content}
               </div>
             );
             
             return IsDnd ? (
               <SectionDraggable key={key} id={`${key}-main-${pageId}`} index={index}>
                 {wrappedContent}
               </SectionDraggable>
             ) : wrappedContent;
           })}
        </div>

        {/* Sidebar Column (Fixed width for stability) */}
        <div style={{ 
          width: '30%', 
          flexShrink: 0,
          borderInlineStart: '1px solid #F3F4F6', 
          paddingInlineStart: '24px' 
        }}>
           {filterVis(sideSections).filter(k => k !== 'header' && k !== 'personalInfo').map((key, index) => {
             const content = renderSection(key, data, { 
               accentColor, 
               language, 
               visibleSections, 
               textColor: '#333', 
               headingStyle 
             });
             
             if (!content) return null;

             const wrappedContent = (
               <div key={key} data-section style={{ marginBottom: 'var(--section-spacing)' }}>
                 {content}
               </div>
             );
             
             return IsDnd ? (
               <SectionDraggable key={key} id={`${key}-side-${pageId}`} index={index}>
                 {wrappedContent}
               </SectionDraggable>
             ) : wrappedContent;
           })}
        </div>
      </div>
    </div>
  );
}

