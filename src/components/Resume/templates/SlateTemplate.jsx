// ============================================================
// SlateTemplate — Contemporary Gray Sidebar
// High contrast, bold headings, modern corporate look
// ============================================================
import React from 'react';
import { renderSection, ContactInfo } from '../Sections';
import { CATEGORIES } from '../../../utils/constants';
import useResumeStore from '../../../store/useResumeStore';
import SectionDraggable from '../SectionDraggable';

const SIDEBAR_SECTIONS = ['skills', 'languages', 'certificates'];

export default function SlateTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor = '#334155',
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
  pageId = 'preview'
}) {
  const { layoutColumns } = useResumeStore();
  const IsDnd = pageId === 'main-canvas' || pageId === 'preview-canvas';
  
  const sidebarSections = layoutColumns?.columnSide || SIDEBAR_SECTIONS;
  const mainSections = layoutColumns?.columnMain || ['summary', 'experience', 'education', 'projects', 'volunteering', 'references', 'awards'];

  // ── AUDIT: Dynamic Section Discovery ────────────────
  const isPopulated = (key) => {
    const val = data[key];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'string') return val.trim().length > 0;
    return true;
  };

  const populatedKeys = Object.keys(data).filter(isPopulated);
  const sidebarList = sidebarSections.filter(k => populatedKeys.includes(k));
  const mainList    = mainSections.filter(k => populatedKeys.includes(k));

  // Catch orphans (Custom sections or missing standards) into Main
  populatedKeys.forEach(k => {
    if (!sidebarSections.includes(k) && !mainSections.includes(k) && k !== 'personalInfo' && k !== 'header' && k !== 'settings' && k !== 'customSections' && k !== 'custom_sections' && k !== 'sections') {
      mainList.push(k);
    }
  });

  const filteredSidebarSections = visibleSections 
    ? sidebarList.filter(key => visibleSections.includes(key))
    : sidebarList;
  
  const filteredMainSections = visibleSections
    ? mainList.filter(key => visibleSections.includes(key))
    : mainList;

  const showHeader = visibleSections === null || isFirstPage;
  const isRtl = language === 'ar';
  const s = data?.settings || {};
  const config = {
    nameSize: s.name_size ? `${s.name_size}pt` : '26pt',
    headerSize: s.header_size ? `${s.header_size}pt` : '12pt',
    textSize: s.text_size ? `${s.text_size}pt` : '10pt',
    lineHeight: parseFloat(s.line_height || 1.6),
    sectionSpacing: `${s.section_spacing || 24}px`,
    headerAlign: s.header_align || 'start'
  };

  const bodyStyle = { 
    fontSize: config.textSize, 
    lineHeight: config.lineHeight, 
    color: '#1e293b', 
    textAlign: 'justify', 
    fontFamily: isRtl ? 'var(--global-font)' : '"Inter", sans-serif' 
  };

  const headingStyle = {
    color: '#0F172A', fontSize: config.headerSize, fontWeight: 800,
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: `3px solid ${accentColor}`,
    paddingBottom: '4px', marginBottom: '16px',
    display: 'inline-block'
  };

  const sidebarHeadingStyle = {
    color: '#F8FAFC', fontSize: '10pt', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    marginBottom: '12px',
    opacity: 0.9
  };

  return (
    <div data-cv-root style={{ direction: language === 'ar' ? 'rtl' : 'ltr', display: 'flex', minHeight: '100%', flex: 1, fontFamily: 'var(--global-font)' }}>
      <style>{`
        [data-cv-root] {
           --dynamic-header-size: ${data.settings?.header_size || 13.5}pt;
           --line-height: ${data.settings?.line_height || 1.6};
           --section-spacing: ${data.settings?.section_spacing || 28}px;
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

      {/* Sidebar */}
      <div style={{ 
        width: '26%', 
        backgroundColor: '#1E293B', 
        color: '#F8FAFC', 
        padding: '40px 20px',
        flexShrink: 0
      }}>
        {showHeader && data.personalInfo?.photo && (
          <div data-section data-section-key="photo" style={{ marginBottom: 'var(--section-spacing)' }}>
             <img src={data.personalInfo.photo} alt="" style={{ width: '100%', aspectRatio: '1/1', borderRadius: '12px', objectFit: 'cover' }} />
          </div>
        )}
        
        {showHeader && (
          <div data-section data-section-key="contact" style={{ marginBottom: 'var(--section-spacing)' }}>
            <h3 className="section-title" style={sidebarHeadingStyle}>{t('contact', language)}</h3>
            <ContactInfo data={data.personalInfo} layout="stacked" accentColor="#38BDF8" textColor="#F8FAFC" />
          </div>
        )}

        {filteredSidebarSections.map((key, index) => (
          <div key={key} data-section data-section-key={key} style={{ marginBottom: 'var(--section-spacing)' }}>
            {renderSection(key, data, { 
              headingStyle: sidebarHeadingStyle, 
              accentColor: '#38BDF8', 
              language, 
              visibleSections,
              textColor: '#F8FAFC' 
            })}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px 32px 60px 32px', backgroundColor: '#FFFFFF' }}>
        {showHeader && (
          <header data-section data-section-key="header" style={{ marginBottom: 'var(--section-spacing)', textAlign: data.settings?.header_align || 'start' }}>
            <h1 style={{ fontSize: config.nameSize, fontWeight: 900, color: '#0F172A', margin: 0 }}>{data.personalInfo?.fullName}</h1>
            {data.personalInfo?.jobTitle && (
              <p style={{ fontSize: '13pt', color: accentColor, fontWeight: 600, marginTop: '4px' }}>{data.personalInfo.jobTitle}</p>
            )}
          </header>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--section-spacing)' }}>
          {filteredMainSections.map((key, index) => {
            const content = renderSection(key, data, { 
              headingStyle, 
              accentColor, 
              language, 
              visibleSections,
              bodyStyle,
              textColor: '#1E293B' 
            });

            if (!content) return null;

            const wrapped = (
              <div key={key} data-section data-section-key={key} style={{ marginBottom: 'var(--section-spacing)', breakInside: 'avoid' }}>
                {content}
              </div>
            );
            
            return IsDnd ? <SectionDraggable key={key} id={`${key}-${pageId}`} index={index}>{wrapped}</SectionDraggable> : wrapped;
          })}
        </div>
      </div>
    </div>
  );
}

function t(key, lang) {
  const trans = {
    en: { contact: "Contact" },
    ar: { contact: "تواصل" }
  };
  return trans[lang]?.[key] || trans.en[key];
}
