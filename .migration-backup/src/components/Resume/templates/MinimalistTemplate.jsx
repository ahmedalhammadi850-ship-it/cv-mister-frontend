// ============================================================
// The Impact Specialist — Ultra-Clean & Result-Focused
// ============================================================
import React from 'react';
import { PersonalInfoSection, SummarySection, ExperienceSection, EducationSection, SkillsSection, ProjectsSection, LanguagesSection, CertificatesSection, AwardsSection, VolunteeringSection, ReferencesSection, renderSection } from '../Sections';
import { CATEGORIES, CATEGORY_SECTION_ORDER } from '../../../utils/constants';
import useStyleStore from '../../../store/useStyleStore';

export default function ImpactSpecialistTemplate({ 
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
  const s = data?.settings || {};
  const config = {
    nameSize: s.name_size ? `${s.name_size}pt` : '20pt',
    headerSize: s.header_size ? `${s.header_size}pt` : '11pt',
    textSize: s.text_size ? `${s.text_size}pt` : '9.5pt',
    lineHeight: parseFloat(s.line_height || 1.6),
    marginTop: styles.marginTop ? `${styles.marginTop}mm` : '20mm',
    marginBottom: styles.marginBottom ? `${styles.marginBottom}mm` : '20mm',
    marginSide: styles.marginSides ? `${styles.marginSides}mm` : '25mm',
  };

  const bodyStyle = { fontSize: config.textSize, lineHeight: config.lineHeight, color: '#334155', fontFamily: 'var(--global-font)' };
  const headingStyle = { 
    color: accentColor, 
    fontSize: config.headerSize, 
    fontWeight: 700, 
    textTransform: 'uppercase', 
    marginBottom: '8px', 
    marginTop: '20px', 
    letterSpacing: '0.05em',
    textAlign: 'start',
    borderBottom: `1px solid ${accentColor}33`,
    paddingBottom: '4px',
    display: 'block',
    width: '100%'
  };

  const isPopulated = (k) => data[k] && (Array.isArray(data[k]) ? data[k].length > 0 : true);
  const baseSections = visibleSections ? order.filter(k => visibleSections.includes(k)) : order.filter(k => isPopulated(k) || k === 'personal_info');
  const customKeys = Object.keys(data).filter(k => k.startsWith('custom_') && Array.isArray(data[k]) && data[k].length > 0);
  const sectionsToRender = [...baseSections.filter(k => k !== 'custom'), ...customKeys];

  const commonProps = { language, accentColor, textColor: '#334155', headingStyle, bodyStyle, visibleSections };

  return (
    <div data-cv-root style={{ width: '100%', minHeight: '297mm', backgroundColor: '#FFFFFF', direction: isAr ? 'rtl' : 'ltr', padding: `${config.marginTop} ${config.marginSide} ${config.marginBottom}`, boxSizing: 'border-box' }}>
      {isFirstPage && <PersonalInfoSection data={data.personalInfo} {...commonProps} nameStyle={{ fontSize: config.nameSize, fontWeight: 800 }} />}
      {sectionsToRender.filter(k => k !== 'personal_info').map((key) => {
        const titleMap = {
          summary: isAr ? 'الملخص المهني' : 'Professional Summary',
          experience: isAr ? 'الخبرة العملية' : 'Work Experience',
        };
        const sectionMap = {
          summary: (
            <div key={key} data-section data-section-key="summary" className="resume-section">
              <h2 className="section-title" style={headingStyle}>{titleMap.summary}</h2>
              <SummarySection summary={data.summary} {...commonProps} noHeading />
            </div>
          ),
          experience: (
            <div key={key} data-section data-section-key="experience" className="resume-section">
              <h2 className="section-title" style={headingStyle}>{titleMap.experience}</h2>
              <ExperienceSection items={data.experience} {...commonProps} noHeading />
            </div>
          ),
          education: <EducationSection items={data.education} {...commonProps} key={key} />,
          skills: <SkillsSection items={data.skills} {...commonProps} showBars={false} key={key} />,
          projects: <ProjectsSection items={data.projects} {...commonProps} key={key} />,
          languages: <LanguagesSection items={data.languages} {...commonProps} key={key} />,
          certificates: <CertificatesSection items={data.certificates} {...commonProps} key={key} />,
          awards: <AwardsSection items={data.awards} {...commonProps} key={key} />,
          volunteering: <VolunteeringSection items={data.volunteering} {...commonProps} key={key} />,
          references: <ReferencesSection items={data.references} {...commonProps} key={key} />,
        };
        if (sectionMap[key]) return sectionMap[key];
        if (key.startsWith('custom_')) {
          return <React.Fragment key={key}>{renderSection(key, data, commonProps)}</React.Fragment>;
        }
        return null;
      })}
    </div>
  );
}
