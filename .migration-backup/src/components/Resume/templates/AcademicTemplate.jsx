// ============================================================
// AcademicTemplate — The Scholarly Achievement (ATS Optimized)
// Single-column, minimalist, serif typography
// ============================================================
import React from 'react';
import { ContactInfo, renderSection } from '../Sections';
import { CATEGORY_SECTION_ORDER, CATEGORIES } from '../../../utils/constants';

export default function AcademicTemplate({
  data,
  category = CATEGORIES.ACADEMIC,
  accentColor = '#1e293b',
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
}) {
  const isAr = language === 'ar';
  const order = CATEGORY_SECTION_ORDER[category] || CATEGORY_SECTION_ORDER[CATEGORIES.ACADEMIC];
  
  const isPopulated = (key) => {
    const val = data[key];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'string') return val.trim().length > 0;
    return true;
  };
  
  const populatedKeys = Object.keys(data).filter(isPopulated);
  const customKeys = populatedKeys.filter(k => k.startsWith('custom_'));
  const sectionsToRender = [...order.filter(k => populatedKeys.includes(k)), ...customKeys];

  const filteredSections = visibleSections
    ? sectionsToRender.filter((k) => visibleSections.includes(k))
    : sectionsToRender;

  const showHeader = visibleSections === null || isFirstPage;
  const s = data?.settings || {};
  const config = {
    nameSize: s.name_size ? `${s.name_size}pt` : '20pt',
    headerSize: s.header_size ? `${s.header_size}pt` : '12pt',
    textSize: s.text_size ? `${s.text_size}pt` : '10pt',
    lineHeight: parseFloat(s.line_height || 1.6),
    sectionSpacing: `${s.section_spacing || 20}px`
  };

  const headingStyle = {
    color: accentColor, 
    fontSize: config.headerSize,
    fontFamily: isAr ? 'var(--global-font)' : "'Playfair Display', serif", 
    fontWeight: 800,
    borderBottom: `1px solid ${accentColor}40`,
    paddingBottom: '4px', 
    marginBottom: '12px',
    marginTop: '20px',
    textTransform: 'uppercase', 
    letterSpacing: '0.05em',
  };

  return (
    <div data-cv-root style={{ 
      direction: language === 'ar' ? 'rtl' : 'ltr', fontFamily: "var(--global-font)", 
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      color: '#1e293b'
    }}>
      <style>{`
        [data-cv-root] {
           --line-height: ${config.lineHeight};
           --section-spacing: ${config.sectionSpacing};
        }
        [data-cv-root] * { line-height: var(--line-height); }
      `}</style>

      {showHeader && (
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: config.nameSize,
            fontFamily: isAr ? 'var(--global-font)' : "'Playfair Display', serif", 
            fontWeight: 800, 
            color: '#111827',
            marginBottom: '8px'
          }}>
            {data.personalInfo?.fullName}
          </h1>
          <div style={{ fontSize: '11pt', color: '#475569', fontWeight: 600, marginBottom: '12px' }}>
            {data.personalInfo?.jobTitle}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 16px', fontSize: '10pt', color: '#64748b', alignItems: 'center' }}>
             {/* Text-based contact for ATS */}
             {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
             {data.personalInfo?.phone && <><span style={{ color: '#CBD5E1' }}>|</span> <span>{data.personalInfo.phone}</span></>}
             {data.personalInfo?.location && <><span style={{ color: '#CBD5E1' }}>|</span> <span>{data.personalInfo.location}</span></>}
             {data.personalInfo?.website && <><span style={{ color: '#CBD5E1' }}>|</span> <span>{data.personalInfo.website}</span></>}
             {data.personalInfo?.linkedin && <><span style={{ color: '#CBD5E1' }}>|</span> <span>{data.personalInfo.linkedin}</span></>}
             {data.personalInfo?.github && <><span style={{ color: '#CBD5E1' }}>|</span> <span>{data.personalInfo.github}</span></>}
          </div>
        </header>
      )}

      <main>
        {filteredSections.map((key) => (
          <div key={key} data-section style={{ marginBottom: 'var(--section-spacing)' }}>
            {renderSection(key, data, { 
              headingStyle, 
              accentColor, 
              showSkillBars: false, // Force no bars for ATS
              visibleSections 
            })}
          </div>
        ))}
      </main>
    </div>
  );
}
