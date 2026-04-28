// ============================================================
// EliteCleanTemplate — Sophisticated & Minimalist
// Features a razor-sharp layout with elegant vertical accents
// Designed for a premium, non-decorated professional look.
// ============================================================
import React from 'react';
import { renderSection, ContactInfo } from '../Sections';
import { CATEGORIES } from '../../../utils/constants';
import useResumeStore from '../../../store/useResumeStore';
import SectionDraggable from '../SectionDraggable';

export default function EliteCleanTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor = '#0f172a', // Default to a deep navy for "Elite" look
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
  pageId = 'preview'
}) {
  const { layoutColumns } = useResumeStore();
  const IsDnd = pageId === 'main-canvas' || pageId === 'preview-canvas';
  const isRtl = language === 'ar';
  
  const sideSections = layoutColumns?.columnSide?.length > 0 
    ? layoutColumns.columnSide.filter(k => k !== 'contact' && k !== 'personal_info' && k !== 'header')
    : ['skills', 'education', 'languages'];
    
  const basMainSections = layoutColumns?.columnMain?.length > 0
    ? layoutColumns.columnMain.filter(k => k !== 'personal_info' && k !== 'header')
    : ['summary', 'experience', 'projects'];
  
  const customKeys = Object.keys(data).filter(k => k.startsWith('custom_') && Array.isArray(data[k]) && data[k].length > 0);
  const mainSections = [...basMainSections, ...customKeys.filter(k => !basMainSections.includes(k) && !sideSections.includes(k))];

  const filteredMain = (visibleSections ? mainSections.filter(k => visibleSections.includes(k)) : mainSections);
  const filteredSide = (visibleSections ? sideSections.filter(k => visibleSections.includes(k)) : sideSections);

  const s = data.settings || {};
  const mTop = s.margin_top || 20;
  const mBottom = 20;

  const SIDEBAR_WIDTH = '30%';
  const MAIN_WIDTH = '70%';

  return (
    <div data-cv-root style={{ 
      direction: isRtl ? 'rtl' : 'ltr', 
      fontFamily: 'var(--global-font)', 
      width: '100%',
      height: '100%',
      minHeight: '297mm',
      display: 'flex',
      flexDirection: isRtl ? 'row' : 'row', // We'll handle RTL by switching column order in DOM
      backgroundColor: '#FFFFFF', 
      position: 'relative',
      margin: 0,
      padding: 0,
      alignItems: 'stretch'
    }}>
      {/* Dynamic Column Ordering based on Language */}
      {(() => {
        const sideCol = (
          <div key="side" className="sidebar" style={{ 
            width: SIDEBAR_WIDTH,
            minWidth: SIDEBAR_WIDTH,
            backgroundColor: '#f8fafc', // Very subtle off-white/grey
            borderLeft: isRtl ? 'none' : '1px solid #e2e8f0',
            borderRight: isRtl ? '1px solid #e2e8f0' : 'none',
            display: 'flex',
            flexDirection: 'column',
            padding: '35px 25px',
            paddingTop: `${mTop + 15}px`,
            boxSizing: 'border-box'
          }}>
              {isFirstPage && (
                <div style={{ marginBottom: '35px' }}>
                   <ContactInfo data={data.personalInfo} layout="stacked" accentColor={accentColor} textColor="#475569" />
                </div>
              )}

              {filteredSide.map((key, index) => {
                 const content = (
                   <div key={key} data-section data-section-key={key} style={{ marginBottom: '30px' }}>
                     <h3 style={{
                        color: accentColor,
                        fontSize: '11pt',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                     }}>
                        <span style={{ width: '12px', height: '2px', backgroundColor: accentColor }}></span>
                        {renderSection(key, data, { headingOnly: true, language })}
                     </h3>
                     {renderSection(key, data, { 
                       noHeading: true,
                       accentColor, 
                       language, 
                       textColor: '#475569',
                       showSkillBars: true 
                     })}
                   </div>
                 );
                 return IsDnd ? <SectionDraggable key={key} id={`${key}-side-${pageId}`} index={index}>{content}</SectionDraggable> : content;
              })}
          </div>
        );

        const mainCol = (
          <div key="main" className="main-content" style={{ 
            width: MAIN_WIDTH,
            minWidth: MAIN_WIDTH,
            padding: '40px 45px',
            paddingTop: `${mTop + 15}px`,
            paddingBottom: `${mBottom}px`,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            boxSizing: 'border-box'
          }}>
              {isFirstPage && (
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ 
                      fontSize: '34pt', 
                      fontWeight: 800, 
                      color: '#0f172a', 
                      marginBottom: '5px', 
                      lineHeight: 1,
                      letterSpacing: '-0.02em'
                    }}>
                      {data.personalInfo?.fullName}
                    </h1>
                    {data.personalInfo?.jobTitle && (
                      <div style={{ 
                        fontSize: '16pt', 
                        color: accentColor, 
                        fontWeight: 500,
                        opacity: 0.9
                      }}>
                          {data.personalInfo.jobTitle}
                      </div>
                    )}
                </div>
              )}

              {filteredMain.map((key, index) => {
                 const content = (
                   <div key={key} data-section data-section-key={key} style={{ marginBottom: '30px' }}>
                     {renderSection(key, data, { 
                       accentColor, 
                       language, 
                       textColor: '#1e293b',
                       headingStyle: { 
                         fontSize: '14pt', 
                         fontWeight: 700, 
                         color: '#0f172a', 
                         marginBottom: '18px', 
                         display: 'flex',
                         alignItems: 'center',
                         gap: '12px',
                         borderBottom: `1px solid #f1f5f9`,
                         paddingBottom: '8px'
                       }
                     })}
                   </div>
                 );
                 return IsDnd ? <SectionDraggable key={key} id={`${key}-main-${pageId}`} index={index}>{content}</SectionDraggable> : content;
               })}
          </div>
        );

        return isRtl ? [mainCol, sideCol] : [mainCol, sideCol]; // Main is always on one side, side on other.
        // Wait, for standard Elite Clean, let's keep Main on Left/Right consistently.
        // Actually, the DOM order should follow visual order for PDF stability.
      })()}
    </div>
  );
}
