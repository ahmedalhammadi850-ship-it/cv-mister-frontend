// ============================================================
// ModernSplitTemplate — The Contemporary Split (Modern/Share)
// Stylish 50/50 or proportional split layout for high visual impact
// ============================================================
import React from 'react';
import { renderSection } from '../Sections';
import useResumeStore from '../../../store/useResumeStore';
import { CATEGORIES, CATEGORY_SECTION_ORDER } from '../../../utils/constants';

const SIDEBAR_SECTIONS = ['skills', 'languages', 'certificates', 'awards'];

export default function ModernSplitTemplate({ 
  data, 
  category = CATEGORIES.CHRONOLOGICAL, 
  accentColor = '#4f46e5', 
  visibleSections = null, 
  language = 'en',
  isFirstPage = true 
}) {
  const isRtl = language === 'ar';
  const { alignments = {} } = useResumeStore();
  const nameAlign = alignments['full_name'] || 'start';
  const infoAlign = alignments['personal_info'] || 'start';
  
  const isPopulated = (key) => {
    const val = data[key];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    return true;
  };

  const order = CATEGORY_SECTION_ORDER[category] || CATEGORY_SECTION_ORDER[CATEGORIES.CHRONOLOGICAL];
  const populatedKeys = Object.keys(data).filter(isPopulated);
  
  const sidebarKeys = order.filter(k => SIDEBAR_SECTIONS.includes(k) && populatedKeys.includes(k));
  const filteredSidebarKeys = visibleSections 
    ? sidebarKeys.filter(k => visibleSections.includes(k) || visibleSections.some(vs => vs.startsWith(`${k}-`)))
    : sidebarKeys;
  const customKeys = populatedKeys.filter(k => k.startsWith('custom_'));
  const mainKeys = [...order.filter(k => !SIDEBAR_SECTIONS.includes(k) && populatedKeys.includes(k)), ...customKeys];
  const filteredMainKeys = visibleSections 
    ? mainKeys.filter(k => visibleSections.includes(k) || visibleSections.some(vs => vs.startsWith(`${k}-`)))
    : mainKeys;

  const config = {
    nameSize: data.settings?.name_size ? `${data.settings.name_size}pt` : '28pt',
    headerSize: data.settings?.header_size ? `${data.settings.header_size}pt` : '13pt',
    textSize: data.settings?.text_size ? `${data.settings.text_size}pt` : '10.5pt',
    lineHeight: parseFloat(data.settings?.line_height || 1.5),
    sectionSpacing: `${data.settings?.section_spacing || 20}px`
  };

  const bodyStyle = { 
    fontSize: config.textSize, 
    lineHeight: config.lineHeight, 
    color: '#1e293b', 
    textAlign: 'justify', 
    fontFamily: isRtl ? 'var(--global-font)' : '"Inter", sans-serif' 
  };

  const headingStyle = {
    color: accentColor,
    fontSize: config.headerSize,
    fontWeight: 900,
    textTransform: 'uppercase',
    marginBottom: '12px',
    letterSpacing: '0.08em',
  };

  const sidebarHeadingStyle = {
    ...headingStyle,
    color: accentColor,
    borderLeft: 'none',
    borderRight: 'none',
    paddingLeft: 0,
    paddingRight: 0,
    borderBottom: `2px solid ${accentColor}40`,
    paddingBottom: '4px'
  };

  return (
    <div data-cv-root style={{ 
      width: '100%',
      minHeight: '100%',
      flex: 1,
      background: `linear-gradient(${isRtl ? 'to left' : 'to right'}, #fff 40%, #f8fafc 40%)`,
      display: 'flex',
      flexDirection: isRtl ? 'row-reverse' : 'row',
      direction: isRtl ? 'rtl' : 'ltr'
    }}>
      {/* 🌑 Split Section: About & Skills */}
      <aside style={{
        width: '40%',
        backgroundColor: 'transparent',
        padding: '60px 40px',
        borderInlineEnd: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: config.sectionSpacing
      }}>
        {isFirstPage && (
          <div style={{ marginBottom: '20px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '10pt', color: '#64748b' }}>
               {data.personalInfo?.email && <div style={{ wordBreak: 'break-all' }}><b>Email:</b> {data.personalInfo.email}</div>}
               {data.personalInfo?.phone && <div><b>Phone:</b> {data.personalInfo.phone}</div>}
               {data.personalInfo?.location && <div><b>Location:</b> {data.personalInfo.location}</div>}
               {data.personalInfo?.website && <div style={{ wordBreak: 'break-all' }}><b>Website:</b> {data.personalInfo.website}</div>}
               {data.personalInfo?.linkedin && <div style={{ wordBreak: 'break-all' }}><b>LinkedIn:</b> {data.personalInfo.linkedin}</div>}
               {data.personalInfo?.github && <div style={{ wordBreak: 'break-all' }}><b>GitHub:</b> {data.personalInfo.github}</div>}
            </div>
          </div>
        )}

        {filteredSidebarKeys.map(key => (
          <div key={key} data-section data-section-key={key}>
             {renderSection(key, data, { headingStyle: sidebarHeadingStyle, accentColor, showSkillBars: true, visibleSections })}
          </div>
        ))}
      </aside>

      {/* ⚪ Main Section: Experience */}
      <main style={{
        flex: 1,
        padding: '60px 25px',
        backgroundColor: 'transparent'
      }}>
        {isFirstPage && (
          <header style={{ 
            marginBottom: '50px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: nameAlign === 'center' ? 'center' : (nameAlign === 'end' ? 'flex-end' : 'flex-start')
          }}>
            <h1 style={{ fontSize: config.nameSize, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.02em', textAlign: nameAlign }}>
              {data.personalInfo?.fullName}
            </h1>
            <div style={{ fontSize: '15pt', fontWeight: 500, color: accentColor, marginTop: '5px', textAlign: infoAlign }}>
               {data.personalInfo?.jobTitle}
            </div>
          </header>
        )}

        {filteredMainKeys.map(key => (
          <div 
            key={key} 
            data-section
            data-section-key={key}
            style={{ 
              marginBottom: config.sectionSpacing,
              borderInlineStart: `3px solid ${accentColor}`,
              paddingInlineStart: '8px',
            }}
          >
             {renderSection(key, data, { headingStyle, accentColor, bodyStyle, visibleSections })}
          </div>
        ))}
      </main>
    </div>
  );
}
