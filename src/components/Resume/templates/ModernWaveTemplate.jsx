// ============================================================
// ModernWaveTemplate — PDF Optimized Version 2.3
// Features curved background dividers and dual-tone full-height sidebar
// Re-engineered for pixel-perfect PDF export in production environments
// ============================================================
import React from 'react';
import { renderSection, ContactInfo } from '../Sections';
import { CATEGORIES } from '../../../utils/constants';
import useResumeStore from '../../../store/useResumeStore';
import SectionDraggable from '../SectionDraggable';

export default function ModernWaveTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor = '#1e3a8a', 
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
  pageId = 'preview'
}) {
  const { layoutColumns } = useResumeStore();
  const IsDnd = pageId === 'main-canvas' || pageId === 'preview-canvas';
  
  // 🚀 CRITICAL: Force Arabic mode if language is 'ar' to prevent layout collapse
  const isRtl = language === 'ar';
  
  // Robust Sidebar/Main section detection with fallbacks
  const sideSections = layoutColumns?.columnSide?.length > 0 
    ? layoutColumns.columnSide.filter(k => k !== 'contact' && k !== 'personal_info' && k !== 'header')
    : ['skills', 'education', 'languages']; // Fallback if store is lost during export
    
  const basMainSections = layoutColumns?.columnMain?.length > 0
    ? layoutColumns.columnMain.filter(k => k !== 'personal_info' && k !== 'header')
    : ['summary', 'experience', 'projects']; // Fallback if store is lost during export
  
  const customKeys = Object.keys(data).filter(k => k.startsWith('custom_') && Array.isArray(data[k]) && data[k].length > 0);
  const mainSections = [...basMainSections, ...customKeys.filter(k => !basMainSections.includes(k) && !sideSections.includes(k))];

  const filteredMain = (visibleSections ? mainSections.filter(k => visibleSections.includes(k)) : mainSections);
  const filteredSide = (visibleSections ? sideSections.filter(k => visibleSections.includes(k)) : sideSections);

  // ── HARDWARE CONSTANTS ──
  const s = data.settings || {};
  const mTop = s.margin_top || 20;

  const SIDEBAR_WIDTH = '32%';
  const MAIN_WIDTH = '68%';
  const BORDER_RADIUS_MAIN = '80px';
  const BORDER_RADIUS_SIDEBAR = '100px';

  return (
    <div data-cv-root style={{ 
      direction: isRtl ? 'rtl' : 'ltr', 
      fontFamily: 'var(--global-font)', 
      width: '100%',
      minHeight: '297mm',
      display: 'flex',
      flexDirection: isRtl ? 'row-reverse' : 'row',
      backgroundColor: '#f8fafc', 
      position: 'relative',
      margin: 0,
      padding: 0,
      alignItems: 'stretch',
      overflow: 'hidden'
    }}>
      
      {/* 1. Main Column */}
      <div className="main-content" style={{ 
        width: MAIN_WIDTH,
        minWidth: MAIN_WIDTH,
        backgroundColor: '#FFFFFF',
        padding: '40px',
        paddingTop: `${mTop + 20}px`,
        position: 'relative',
        zIndex: 10,
        borderTopRightRadius: isRtl ? '0' : BORDER_RADIUS_MAIN,
        borderTopLeftRadius: isRtl ? BORDER_RADIUS_MAIN : '0',
        boxShadow: isRtl ? '10px 0 20px rgba(0,0,0,0.03)' : '-10px 0 20px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column'
      }}>
          {isFirstPage && (
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32pt', fontWeight: 900, color: accentColor, marginBottom: '8px', lineHeight: 1.1 }}>
                  {data.personalInfo?.fullName}
                </h1>
                {data.personalInfo?.jobTitle && (
                  <div style={{ fontSize: '15pt', color: '#64748b', fontWeight: 600 }}>
                      {data.personalInfo.jobTitle}
                  </div>
                )}
            </div>
          )}

          {filteredMain.map((key, index) => {
             const content = (
               <div key={key} data-section data-section-key={key} style={{ marginBottom: `${s.section_spacing || 25}px` }}>
                 {renderSection(key, data, { 
                   accentColor, 
                   language, 
                   visibleSections, 
                   textColor: '#334155',
                   headingStyle: { fontSize: `${s.header_size || 13}pt`, fontWeight: 700, color: accentColor, marginBottom: '14px', borderBottom: `2px solid ${accentColor}15`, paddingBottom: '4px' }
                 })}
               </div>
             );
             return IsDnd ? <SectionDraggable key={key} id={`${key}-main-${pageId}`} index={index}>{content}</SectionDraggable> : content;
           })}
      </div>

      {/* 2. Sidebar Column */}
      <div className="sidebar" style={{ 
        width: SIDEBAR_WIDTH,
        minWidth: SIDEBAR_WIDTH,
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 5,
        // Ensure sidebar background is printed
        boxShadow: 'inset 0 0 0 1000px #f8fafc'
      }}>
          {/* Top Wave Section (Only on first page) */}
          <div style={{ 
            backgroundColor: accentColor,
            // Force background print for Puppeteer
            boxShadow: `inset 0 0 0 1000px ${accentColor}`,
            padding: `${mTop + 20}px 25px 40px 25px`,
            borderBottomLeftRadius: isRtl ? '0' : BORDER_RADIUS_SIDEBAR,
            borderBottomRightRadius: isRtl ? BORDER_RADIUS_SIDEBAR : '0',
            display: isFirstPage ? 'block' : 'none',
            minHeight: '200px'
          }}>
              <div style={{ color: '#FFFFFF' }}>
                  <ContactInfo data={data.personalInfo} layout="stacked" accentColor="#FFFFFF" textColor="#FFFFFF" />
              </div>
          </div>

          {/* Sidebar Content */}
          <div style={{ padding: '40px 25px', paddingTop: isFirstPage ? '40px' : `${mTop + 20}px` }}>
              {filteredSide.length > 0 ? filteredSide.map((key, index) => {
                 const content = (
                   <div key={key} data-section data-section-key={key} style={{ marginBottom: `${s.section_spacing || 25}px` }}>
                     <h3 style={{
                        color: '#1e293b',
                        borderBottom: `2px solid ${accentColor}30`,
                        paddingBottom: '8px',
                        marginBottom: '18px',
                        fontSize: `${s.header_size || 12}pt`,
                        fontWeight: 700,
                        textTransform: 'uppercase'
                     }}>
                        {renderSection(key, data, { headingOnly: true, language })}
                     </h3>
                     {renderSection(key, data, { 
                       noHeading: true,
                       accentColor, 
                       language, 
                       visibleSections, 
                       textColor: '#475569',
                       showSkillBars: true 
                     })}
                   </div>
                 );
                 return IsDnd ? <SectionDraggable key={key} id={`${key}-side-${pageId}`} index={index}>{content}</SectionDraggable> : content;
              }) : (
                <div style={{ color: '#94a3b8', fontSize: '10pt', fontStyle: 'italic' }}>
                  {isRtl ? 'لا توجد عناصر في القائمة الجانبية' : 'No sections in sidebar'}
                </div>
              )}
          </div>
      </div>
    </div>
  );
}
