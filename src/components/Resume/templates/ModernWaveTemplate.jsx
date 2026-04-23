// ============================================================
// ModernWaveTemplate — Full-Height Stretch Version
// Features curved background dividers and dual-tone full-height sidebar
// ============================================================
import React from 'react';
import { renderSection, ContactInfo } from '../Sections';
import { CATEGORIES } from '../../../utils/constants';
import useResumeStore from '../../../store/useResumeStore';
import useStyleStore from '../../../store/useStyleStore';
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
  const isRtl = language === 'ar';
  
  // Custom splitting + Cleanup (Explicitly excluding header/personalInfo from columns)
  const sideSections = layoutColumns?.columnSide?.filter(k => k !== 'contact' && k !== 'personal_info' && k !== 'header') || ['skills', 'education', 'languages'];
  const basMainSections = layoutColumns?.columnMain?.filter(k => k !== 'personal_info' && k !== 'header') || ['summary', 'experience', 'projects'];
  
  // Discover custom sections
  const customKeys = Object.keys(data).filter(k => k.startsWith('custom_') && Array.isArray(data[k]) && data[k].length > 0);
  const mainSections = [...basMainSections, ...customKeys.filter(k => !basMainSections.includes(k) && !sideSections.includes(k))];

  const filteredMain = (visibleSections ? mainSections.filter(k => visibleSections.includes(k)) : mainSections);
  const filteredSide = (visibleSections ? sideSections.filter(k => visibleSections.includes(k)) : sideSections);

  return (
    <div data-cv-root style={{ 
      direction: language === 'ar' ? 'rtl' : 'ltr', fontFamily: 'var(--global-font)', 
      minHeight: '100%', 
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      position: 'relative',
      overflow: 'hidden',
      padding: 0,
      margin: 0,
      alignItems: 'stretch' // CRITICAL: Stretch children to same height
    }}>
      <style>{`
        [data-cv-root] {
           --dynamic-header-size: ${data.settings?.header_size || 13}pt;
           --line-height: ${data.settings?.line_height || 1.4};
           --section-spacing: ${data.settings?.section_spacing || 24}px;
        }
        
        .main-content {
            position: relative;
            z-index: 2;
            flex: 1;
            background: #FFFFFF;
            padding: 20px 50px 40px 50px; // Compact top padding
            border-start-end-radius: 80px;
            border-start-start-radius: 0;
            margin-top: 0; // Removed margin top
            box-shadow: -10px 0 30px rgba(0,0,0,0.03);
            margin-bottom: 20px; /* Reduced bottom space */
        }

        .sidebar {
            width: 32%;
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            background-color: #f8fafc; /* BASE COLOR: ensures it goes to the end */
        }

        .sidebar-top {
            background-color: ${accentColor};
            color: #FFFFFF !important;
            padding: 100px 30px 60px 30px;
            text-align: center;
            border-end-start-radius: 100px;
            border-end-end-radius: 0;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .sidebar-bottom {
            padding: 60px 30px;
            color: #1e293b;
        }
        
        /* Force white text and icons in dark sidebar top */
        .sidebar-top * {
            color: #FFFFFF !important;
        }

        .sidebar-section-title {
            color: #1e293b;
            border-bottom: 2px solid ${accentColor}40;
            padding-bottom: 8px;
            margin-bottom: 25px;
            font-size: 12pt;
            font-weight: 800;
        }
      `}</style>

      {/* Main Column (Left side in LTR, Left side in RTL too if we want sidebar on right) */}
      <div className="main-content" style={{ order: 1 }}>
          {isFirstPage && (
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '32pt', fontWeight: 900, color: accentColor, marginBottom: '8px', lineHeight: 1 }}>
                  {data.personalInfo?.fullName}
                </h1>
                {data.personalInfo?.jobTitle && (
                  <div style={{ fontSize: '15pt', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>
                      {data.personalInfo.jobTitle}
                  </div>
                )}
            </div>
          )}

          {filteredMain.map((key, index) => {
             const content = (
               <div key={key} data-section data-section-key={key} style={{ marginBottom: 'var(--section-spacing)' }}>
                 {renderSection(key, data, { 
                   accentColor, 
                   language, 
                   visibleSections, 
                   textColor: '#334155',
                   headingStyle: { fontSize: '13pt', fontWeight: 800, color: accentColor, marginBottom: '14px', borderBottom: `2px solid ${accentColor}15`, paddingBottom: '4px' }
                 })}
               </div>
             );
             return IsDnd ? <SectionDraggable key={key} id={`${key}-main-${pageId}`} index={index}>{content}</SectionDraggable> : content;
           })}
      </div>

      {/* Sidebar Column (Right side) */}
      <div className="sidebar" style={{ order: 2, height: '100%' }}>
          <div className="sidebar-top" style={{ 
            display: isFirstPage ? 'block' : 'none',
            padding: '100px 30px 60px 30px'
          }}>
              <div style={{ marginBottom: '10px' }}>
                  <ContactInfo data={data.personalInfo} layout="stacked" accentColor="#FFFFFF" />
              </div>
          </div>
          <div className="sidebar-bottom" style={{ paddingTop: isFirstPage ? '60px' : '30px' }}>
              {filteredSide.map((key, index) => {
                 const content = (
                   <div key={key} data-section data-section-key={key} style={{ marginBottom: 'var(--section-spacing)' }}>
                     <h3 className="sidebar-section-title">
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
              })}
          </div>
      </div>
    </div>
  );
}
