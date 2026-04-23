// ============================================================
// The Achievement Master — Interview-Focused CV Template
// Designed by Antigravity (SaaS Resume Expert)
// ============================================================
import React from 'react';
import { PersonalInfoSection, SummarySection, ExperienceSection, EducationSection, SkillsSection, ProjectsSection, LanguagesSection, CertificatesSection, AwardsSection, VolunteeringSection, ReferencesSection, renderSection } from '../Sections';
import { CATEGORIES, CATEGORY_SECTION_ORDER } from '../../../utils/constants';
import useStyleStore from '../../../store/useStyleStore';

export default function AchievementMasterTemplate({
  data,
  category = CATEGORIES.CHRONOLOGICAL,
  accentColor: propAccentColor = '#000000',
  visibleSections = null,
  language = 'en',
  isFirstPage = true,
}) {
  const isAr = language === 'ar';
  const styles = useStyleStore();
  const order = CATEGORY_SECTION_ORDER[category] || CATEGORY_SECTION_ORDER[CATEGORIES.CHRONOLOGICAL];
  
  const accentColor = propAccentColor || '#000000';
  const textColor = '#1F2937';

  const s = data?.settings || {};
  const config = {
    nameSize: s.name_size ? `${s.name_size}pt` : '22pt',
    headerSize: s.header_size ? `${s.header_size}pt` : '12pt',
    textSize: s.text_size ? `${s.text_size}pt` : '10pt',
    lineHeight: parseFloat(s.line_height || 1.5),
    marginTop: styles.marginTop ? `${styles.marginTop}mm` : '15mm',
    marginBottom: styles.marginBottom ? `${styles.marginBottom}mm` : '15mm',
    marginSide: styles.marginSides ? `${styles.marginSides}mm` : '20mm',
    sectionSpacing: '18px',
  };

  const bodyStyle = {
    fontSize: config.textSize,
    lineHeight: config.lineHeight,
    color: textColor,
    fontFamily: isAr ? 'var(--global-font)' : '"Inter", "system-ui", sans-serif'
  };

  const headingStyle = {
    color: accentColor,
    fontSize: config.headerSize,
    fontWeight: 800,
    textTransform: 'uppercase',
    borderBottom: `2.5px solid ${accentColor}`,
    paddingBottom: '5px',
    marginBottom: '10px',
    marginTop: '12px',
    letterSpacing: '0.08em',
    fontFamily: isAr ? 'var(--global-font)' : 'inherit'
  };

  const isPopulated = (key) => {
    const val = data[key];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    return true;
  };

  const populatedKeys = Object.keys(data).filter(isPopulated);
  const baseSections = visibleSections 
    ? order.filter(k => visibleSections.includes(k)) 
    : order.filter(k => populatedKeys.includes(k) || k === 'personal_info');
  const customKeys = Object.keys(data).filter(k => k.startsWith('custom_') && Array.isArray(data[k]) && data[k].length > 0);
  const sectionsToRender = [...baseSections.filter(k => k !== 'custom'), ...customKeys];

  const commonProps = { 
    language, 
    accentColor, 
    textColor,
    headingStyle,
    bodyStyle,
    visibleSections
  };

  return (
    <div data-cv-root style={{ 
      width: '100%',
      minHeight: '297mm',
      backgroundColor: '#FFFFFF',
      direction: isAr ? 'rtl' : 'ltr',
      fontFamily: 'var(--global-font)',
      padding: `${config.marginTop} ${config.marginSide} ${config.marginBottom}`,
      boxSizing: 'border-box'
    }}>
      {/* 🚀 Interview-Focused Header: Extreme Clarity */}
      {isFirstPage && <PersonalInfoSection data={data.personalInfo} {...commonProps} nameStyle={{ fontSize: config.nameSize, fontWeight: 900 }} />}
      
      <div style={{ height: config.sectionSpacing }} />

      {sectionsToRender.filter(k => k !== 'personal_info').map((key) => {
        // Transform Summary into a "Strategic Value Proposition"
        if (key === 'summary') {
          return (
            <div key={key} data-section data-section-key="summary" className="resume-section">
              <h2 className="section-title" style={headingStyle}>{isAr ? 'الملخص المهني' : 'Professional Summary'}</h2>
              <SummarySection summary={data.summary} {...commonProps} noHeading />
              <div style={{ height: config.sectionSpacing }} />
            </div>
          );
        }
        
        // Transform Experience into "Quantifiable Achievements"
        if (key === 'experience') {
          return (
            <div key={key} data-section data-section-key="experience" className="resume-section">
              <h2 className="section-title" style={headingStyle}>{isAr ? 'الخبرة العملية' : 'Work Experience'}</h2>
              <ExperienceSection items={data.experience} {...commonProps} noHeading />
              <div style={{ height: config.sectionSpacing }} />
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

        if (sectionMap[key]) {
          return (
            <React.Fragment key={key}>
              {sectionMap[key]}
              <div style={{ height: config.sectionSpacing }} />
            </React.Fragment>
          );
        }
        if (key.startsWith('custom_')) {
          return (
            <React.Fragment key={key}>
              {renderSection(key, data, commonProps)}
              <div style={{ height: config.sectionSpacing }} />
            </React.Fragment>
          );
        }
        return null;
      })}
    </div>
  );
}
