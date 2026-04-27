// ============================================================
// GradientHeaderTemplate — "Creative Split" Design
// Inspired by user-provided high-impact aesthetic
// ============================================================
import React from 'react';
import { renderSection, ContactInfo } from '../Sections';
import { CATEGORIES } from '../../../utils/constants';
import useResumeStore from '../../../store/useResumeStore';
import SectionDraggable from '../SectionDraggable';

export default function GradientHeaderTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor = '#6366F1',
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
  pageId = 'preview'
}) {
  const { layoutColumns, alignments = {} } = useResumeStore();
  const IsDnd = pageId === 'main-canvas' || pageId === 'preview-canvas';
  const isRtl = language === 'ar';
  const showHeader = visibleSections === null || isFirstPage;
  const nameAlign = alignments['full_name'] || 'start';

  // Helper to get icons matching the visual style
  const getSectionIcon = (key) => {
    const icons = {
        summary: '👤',
        experience: '💼',
        education: '🎓',
        skills: '🛠️',
        projects: '🚀',
        languages: '🌍',
        certificates: '📜',
        awards: '🏆',
        volunteering: '🤝',
        references: '📞',
        hobbies: '🏀'
    };
    return icons[key] || '🔹';
  };

  const sideKeys = ['summary', 'skills', 'languages', 'volunteering'];
  const mainKeys = ['education', 'experience', 'projects', 'certificates', 'awards', 'references'];
  
  // Discover custom sections
  const customKeys = Object.keys(data).filter(k => k.startsWith('custom_') && Array.isArray(data[k]) && data[k].length > 0);
  
  const filteredMain = (visibleSections 
    ? [...mainKeys, ...customKeys].filter(k => visibleSections.includes(k) || visibleSections.some(vs => vs.startsWith(k + '-'))) 
    : [...mainKeys, ...customKeys]).filter(k => data?.[k]);
  const filteredSide = (visibleSections 
    ? sideKeys.filter(k => visibleSections.includes(k) || visibleSections.some(vs => vs.startsWith(k + '-'))) 
    : sideKeys).filter(k => data?.[k]);

  const nameParts = data?.personalInfo?.fullName ? data.personalInfo.fullName.split(' ') : [];
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  return (
    <div data-cv-root style={{ 
      direction: language === 'ar' ? 'rtl' : 'ltr', backgroundColor: '#FFFFFF', 
      minHeight: '100%', 
      fontFamily: 'var(--global-font)', 
      position: 'relative',
      overflow: 'hidden',
      color: '#334155'
    }}>
      <style>{`
        [data-cv-root] {
           --dynamic-header-size: ${data?.settings?.header_size || 14}pt;
           --line-height: ${data?.settings?.line_height || 1.6};
           --section-spacing: ${data?.settings?.section_spacing || 32}px;
           --header-justify: ${
             data?.settings?.header_align === 'center' ? 'center' :
             data?.settings?.header_align === 'right' ? (isRtl ? 'flex-start' : 'flex-end') :
             data?.settings?.header_align === 'left' ? (isRtl ? 'flex-end' : 'flex-start') :
             'flex-start'
           };
        }
        .section-header-wrap {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 15px;
            justify-content: var(--header-justify);
        }
        .section-icon {
            width: 32px;
            height: 32px;
            background-color: ${accentColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            flex-shrink: 0;
            box-shadow: 0 4px 10px ${accentColor}40;
        }
        .section-title-text {
            font-size: var(--dynamic-header-size);
            font-weight: 800;
            color: ${accentColor};
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .timeline-container {
            position: relative;
            padding-inline-start: 25px;
            border-inline-start: 2px solid ${accentColor}20;
            margin-inline-start: 15px;
        }
        .timeline-dot {
            position: absolute;
            left: ${isRtl ? 'auto' : '-7px'};
            right: ${isRtl ? '-7px' : 'auto'};
            top: 5px;
            width: 12px;
            height: 12px;
            background: white;
            border: 3px solid ${accentColor};
            border-radius: 50%;
        }
        .decor-orb {
            position: absolute;
            background: ${accentColor}15;
            z-index: 1;
            pointer-events: none;
        }
        .orb-bottom-left {
            width: 300px;
            height: 300px;
            bottom: -150px;
            left: -150px;
            border-radius: 50%;
            background: ${accentColor};
            opacity: 0.8;
            filter: blur(2px);
        }
        .orb-bottom-right {
            width: 200px;
            height: 200px;
            bottom: -100px;
            right: -100px;
            border-radius: 50%;
            background: ${accentColor}40;
        }
        .contact-box-white * {
            color: #FFFFFF !important;
        }
      `}</style>
      
      <div className="decor-orb orb-bottom-left" />
      <div className="decor-orb orb-bottom-right" />

      {showHeader && (
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          flexDirection: 'row',
          padding: '40px 50px',
          position: 'relative',
          zIndex: 5
        }}>
          <div style={{ 
            background: accentColor,
            color: 'white',
            padding: '25px 30px',
            borderStartStartRadius: '0',
            borderStartEndRadius: '0',
            borderEndEndRadius: '40px',
            borderEndStartRadius: '0',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            minWidth: '220px',
            marginTop: '-40px',
            marginInlineStart: '-50px',
          }}>
            <div className="contact-box-white"> 
                <ContactInfo data={data?.personalInfo} layout="stacked" accentColor="#FFFFFF" />
            </div>
          </div>

          <div style={{ 
             display: 'flex', 
             alignItems: nameAlign === 'center' ? 'center' : 'flex-start', 
             gap: '25px',
             flexDirection: nameAlign === 'center' ? 'column' : 'row',
             textAlign: nameAlign
          }}>
             <div>
                <h1 style={{ fontSize: '30pt', fontWeight: 900, color: '#1e293b', margin: 0, lineHeight: 1 }}>
                    {firstName} <span style={{ color: accentColor }}>{lastName}</span>
                </h1>
                <p style={{ fontSize: '14pt', fontWeight: 600, color: '#64748b', marginTop: '10px' }}>
                    {data?.personalInfo?.jobTitle}
                </p>
             </div>
             {data?.personalInfo?.photo && (
               <div style={{ 
                 width: '130px', 
                 height: '130px', 
                 borderRadius: '50%', 
                 border: `4px solid ${accentColor}20`,
                 padding: '5px',
                 overflow: 'hidden',
                 background: 'white'
               }}>
                 <img src={data.personalInfo.photo} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt="Profile" />
               </div>
             )}
          </div>
        </header>
      )}

      <main style={{ 
        padding: '0 50px 30px 50px', 
        display: 'flex', 
        gap: '40px',
        position: 'relative',
        zIndex: 5,
        flexDirection: 'row'
      }}>
        <div style={{ width: '35%' }}>
          {filteredSide.map((key, index) => {
            const content = renderSection(key, data, { 
              noHeading: true,
              accentColor, 
              language, 
              visibleSections,
              showSkillBars: true
            });
            if (!content) return null;

            const isFirstPart = !visibleSections || visibleSections.includes(key) || visibleSections.some(vs => vs === `${key}-0`);

            const wrapped = (
              <div key={key} data-section data-section-key={key} style={{ marginBottom: 'var(--section-spacing)' }}>
                {isFirstPart && (
                  <div className="section-header-wrap">
                      <div className="section-icon">{getSectionIcon(key)}</div>
                      <h2 className="section-title-text">{renderSection(key, data, { headingOnly: true, language })}</h2>
                  </div>
                )}
                {content}
              </div>
            );
            return IsDnd ? <SectionDraggable key={key} id={`${key}-side-${pageId}`} index={index}>{wrapped}</SectionDraggable> : wrapped;
          })}
        </div>

        <div style={{ width: '65%' }}>
          {filteredMain.map((key, index) => {
            const content = renderSection(key, data, { 
              noHeading: true,
              accentColor, 
              language, 
              visibleSections 
            });
            if (!content) return null;

            const isTimelineSection = key === 'experience' || key === 'education';
            const isFirstPart = !visibleSections || visibleSections.includes(key) || visibleSections.some(vs => vs === `${key}-0`);

            const wrapped = (
              <div key={key} data-section data-section-key={key} style={{ marginBottom: 'var(--section-spacing)' }}>
                {isFirstPart && (
                  <div className="section-header-wrap">
                      <div className="section-icon">{getSectionIcon(key)}</div>
                      <h2 className="section-title-text">{renderSection(key, data, { headingOnly: true, language })}</h2>
                  </div>
                )}
                <div className={isTimelineSection ? 'timeline-container' : ''}>
                    {isTimelineSection && isFirstPart && <div className="timeline-dot" style={{ top: '15px' }} />}
                    {content}
                </div>
              </div>
            );
            return IsDnd ? <SectionDraggable key={key} id={`${key}-main-${pageId}`} index={index}>{wrapped}</SectionDraggable> : wrapped;
          })}
        </div>
      </main>
    </div>
  );
}
