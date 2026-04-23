// ============================================================
// ModernSidebarTemplate — The Visual Strategist (Modern/Share)
// High-impact 2-column layout with a sophisticated sidebar
// ============================================================
import React from 'react';
import { ContactInfo, renderSection } from '../Sections';
import useResumeStore from '../../../store/useResumeStore';
import { CATEGORY_SECTION_ORDER, CATEGORIES } from '../../../utils/constants';

const SIDEBAR_SECTIONS = ['skills', 'languages', 'certificates', 'awards'];

export default function ModernSidebarTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor = '#2563eb', 
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
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
    nameSize: data.settings?.name_size ? `${data.settings.name_size}pt` : '26pt',
    headerSize: data.settings?.header_size ? `${data.settings.header_size}pt` : '13pt',
    textSize: data.settings?.text_size ? `${data.settings.text_size}pt` : '10pt',
    sectionSpacing: `${data.settings?.section_spacing || 24}px`
  };

  const headingStyle = {
    color: accentColor,
    fontSize: config.headerSize,
    fontWeight: 800,
    textTransform: 'uppercase',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    letterSpacing: '0.05em'
  };

  const sidebarHeadingStyle = {
    ...headingStyle,
    color: '#fff',
    fontSize: '11pt',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    paddingBottom: '4px'
  };

  return (
    <div data-cv-root style={{ 
      direction: language === 'ar' ? 'rtl' : 'ltr', width: '100%',
      minHeight: '297mm',
      background: 'linear-gradient(to right, #1e293b 32%, #FFFFFF 32%)',
      display: 'flex',
      flexDirection: isRtl ? 'row-reverse' : 'row'
    }}>
      {/* 🚀 Visual Sidebar */}
      <aside style={{
        width: '32%',
        backgroundColor: 'transparent',
        color: '#fff',
        padding: '50px 30px',
        display: 'flex',
        flexDirection: 'column',
        gap: config.sectionSpacing
      }}>
        {isFirstPage && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '9pt', opacity: 0.9 }}>
                {data.personalInfo?.email && <div>{data.personalInfo.email}</div>}
                {data.personalInfo?.phone && <div>{data.personalInfo.phone}</div>}
                {data.personalInfo?.location && <div>{data.personalInfo.location}</div>}
                {data.personalInfo?.website && <div>{data.personalInfo.website}</div>}
                {data.personalInfo?.linkedin && <div>{data.personalInfo.linkedin}</div>}
                {data.personalInfo?.github && <div>{data.personalInfo.github}</div>}
            </div>
          </div>
        )}

        {filteredSidebarKeys.map(key => (
          <div key={key} data-section data-section-key={key}>
             {renderSection(key, data, { headingStyle: sidebarHeadingStyle, accentColor, textColor: '#fff', showSkillBars: true, visibleSections })}
          </div>
        ))}
      </aside>

      {/* 📄 Main Content Area */}
      <main style={{
        flex: 1,
        padding: '50px 40px',
        backgroundColor: 'transparent'
      }}>
        {isFirstPage && (
          <header style={{ 
            marginBottom: '40px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: nameAlign === 'center' ? 'center' : (nameAlign === 'end' ? 'flex-end' : 'flex-start')
          }}>
            <h1 style={{ fontSize: config.nameSize, fontWeight: 900, color: '#111827', margin: 0, lineHeight: 1.1, textAlign: nameAlign }}>
              {data.personalInfo?.fullName}
            </h1>
            <div style={{ height: '4px', width: '60px', backgroundColor: accentColor, margin: '15px 0' }} />
            <div style={{ fontSize: '14pt', fontWeight: 600, color: '#475569', textAlign: infoAlign }}>
               {data.personalInfo?.jobTitle}
            </div>
          </header>
        )}

        {filteredMainKeys.map(key => (
          <div key={key} data-section data-section-key={key} style={{ marginBottom: config.sectionSpacing }}>
             {renderSection(key, data, { headingStyle, accentColor, textColor: '#334155', visibleSections })}
          </div>
        ))}
      </main>
    </div>
  );
}
