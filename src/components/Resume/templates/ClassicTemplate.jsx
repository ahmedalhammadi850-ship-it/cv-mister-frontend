// ============================================================
// The Strategic Leader — Executive & Leadership Focus
// Optimized for Interviews & ATS Single Column
// ============================================================
import React from 'react';
import { PersonalInfoSection, SummarySection, ExperienceSection, EducationSection, SkillsSection, ProjectsSection, LanguagesSection, CertificatesSection, AwardsSection, VolunteeringSection, ReferencesSection, renderSection } from '../Sections';
import { CATEGORIES, CATEGORY_SECTION_ORDER } from '../../../utils/constants';
import useStyleStore from '../../../store/useStyleStore';

export default function StrategicLeaderTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor: propAccentColor = '#1e293b',
  visibleSections = null,
  language = 'en',
  isFirstPage = true,
}) {
  const isAr = language === 'ar';
  const styles = useStyleStore();
  const order = CATEGORY_SECTION_ORDER[category] || CATEGORY_SECTION_ORDER[CATEGORIES.CHRONOLOGICAL];
  
  const accentColor = propAccentColor || '#1e293b';
  const textColor = '#334155';

  const s = data?.settings || {};
  const config = {
    nameSize: s.name_size ? `${s.name_size}pt` : '26pt',
    headerSize: s.header_size ? `${s.header_size}pt` : '14pt',
    textSize: s.text_size ? `${s.text_size}pt` : '10.5pt',
    lineHeight: parseFloat(s.line_height || 1.4),
    marginTop: styles.marginTop ? `${styles.marginTop}mm` : '15mm',
    marginBottom: styles.marginBottom ? `${styles.marginBottom}mm` : '15mm',
    marginSide: styles.marginSides ? `${styles.marginSides}mm` : '20mm',
    sectionSpacing: '20px',
  };

  const bodyStyle = {
    fontSize: config.textSize,
    lineHeight: config.lineHeight,
    color: textColor,
    fontFamily: isAr ? 'var(--global-font)' : '"Georgia", serif' // Classic yet professional for leaders
  };

  const headingStyle = {
    color: accentColor,
    fontSize: config.headerSize,
    fontWeight: 700,
    borderBottom: `1px solid ${accentColor}`,
    paddingBottom: '5px',
    marginBottom: '10px',
    marginTop: '18px',
    textAlign: 'center',
    fontFamily: isAr ? 'var(--global-font)' : 'inherit'
  };

  const isPopulated = (key) => {
    const val = data[key];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    return true;
  };

  const populatedKeys = Object.keys(data).filter(isPopulated);
  const baseSections = visibleSections ? order.filter(k => visibleSections.includes(k)) : order.filter(k => populatedKeys.includes(k) || k === 'personal_info');
  const customKeys = Object.keys(data).filter(k => k.startsWith('custom_') && Array.isArray(data[k]) && data[k].length > 0);
  const sectionsToRender = [...baseSections.filter(k => k !== 'custom'), ...customKeys];

  const commonProps = { language, accentColor, textColor, headingStyle, bodyStyle, visibleSections };

  return (
    <div data-cv-root style={{ 
      width: '100%',
      minHeight: '297mm',
      backgroundColor: '#FFFFFF',
      direction: isAr ? 'rtl' : 'ltr',
      fontFamily: 'var(--global-font)',
      padding: `${config.marginTop} ${config.marginSide} ${config.marginBottom}`,
      boxSizing: 'border-box',
      textAlign: 'center' // Centered header for leadership authority
    }}>
      {isFirstPage && <PersonalInfoSection data={data.personalInfo} {...commonProps} nameStyle={{ fontSize: config.nameSize, fontWeight: 900, textAlign: 'center' }} />}
      
      <div style={{ textAlign: 'start', marginTop: '20px' }}>
        {sectionsToRender.filter(k => k !== 'personal_info').map((key) => {
          if (key === 'summary') {
            return (
              <div key={key} data-section data-section-key="summary" className="resume-section">
                <h2 className="section-title" style={headingStyle}>{isAr ? 'الملخص المهني' : 'Professional Summary'}</h2>
                <SummarySection summary={data.summary} {...commonProps} noHeading />
              </div>
            );
          }
          
          if (key === 'experience') {
            return (
              <div key={key} data-section data-section-key="experience" className="resume-section">
                <h2 className="section-title" style={headingStyle}>{isAr ? 'الخبرة العملية' : 'Work Experience'}</h2>
                <ExperienceSection items={data.experience} {...commonProps} noHeading />
              </div>
            );
          }

          const sectionMap = {
            education: <EducationSection items={data.education} {...commonProps} />,
            skills: <SkillsSection items={data.skills} {...commonProps} showBars={false} />,
            projects: <ProjectsSection items={data.projects} {...commonProps} />,
            languages: <LanguagesSection items={data.languages} {...commonProps} />,
            certificates: <CertificatesSection items={data.certificates} {...commonProps} />,
            awards: <AwardsSection items={data.awards} {...commonProps} />,
            volunteering: <VolunteeringSection items={data.volunteering} {...commonProps} />,
            references: <ReferencesSection items={data.references} {...commonProps} />,
          };

          if (sectionMap[key]) return <React.Fragment key={key}>{sectionMap[key]}</React.Fragment>;
          if (key.startsWith('custom_')) return <React.Fragment key={key}>{renderSection(key, data, commonProps)}</React.Fragment>;
          return null;
        })}
      </div>
    </div>
  );
}
