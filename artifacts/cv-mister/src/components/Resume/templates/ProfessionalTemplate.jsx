// ============================================================
// The Corporate Closer — Professional Corporate Standard
// ============================================================
import React from 'react';
import { PersonalInfoSection, SummarySection, ExperienceSection, EducationSection, SkillsSection, ProjectsSection, LanguagesSection, CertificatesSection, AwardsSection, VolunteeringSection, ReferencesSection, renderSection } from '../Sections';
import { CATEGORIES, CATEGORY_SECTION_ORDER } from '../../../utils/constants';
import useStyleStore from '../../../store/useStyleStore';

export default function CorporateCloserTemplate({ 
  data, 
  category = CATEGORIES.CHRONOLOGICAL, 
  accentColor: propAccentColor = '#1e3a8a', 
  visibleSections = null, 
  language = 'en',
  isFirstPage = true,
}) {
  const isAr = language === 'ar';
  const styles = useStyleStore();
  const order = CATEGORY_SECTION_ORDER[category] || CATEGORY_SECTION_ORDER[CATEGORIES.CHRONOLOGICAL];
  const accentColor = propAccentColor || '#1e3a8a';
  const s = data?.settings || {};
  const config = {
    nameSize: s.name_size ? `${s.name_size}pt` : '22pt',
    headerSize: s.header_size ? `${s.header_size}pt` : '12pt',
    textSize: s.text_size ? `${s.text_size}pt` : '10pt',
    lineHeight: parseFloat(s.line_height || 1.4),
    marginTop: styles.marginTop ? `${styles.marginTop}mm` : '15mm',
    marginBottom: styles.marginBottom ? `${styles.marginBottom}mm` : '15mm',
    marginSide: styles.marginSides ? `${styles.marginSides}mm` : '20mm',
  };

  const bodyStyle = { fontSize: config.textSize, lineHeight: config.lineHeight, color: '#111827', fontFamily: isAr ? 'var(--global-font)' : '"Inter", sans-serif' };
  const headingStyle = { 
    color: accentColor, 
    backgroundColor: '#f1f5f9', 
    borderInlineStart: `4px solid ${accentColor}`, 
    padding: '6px 10px', 
    fontSize: config.headerSize, 
    fontWeight: 800, 
    textTransform: 'uppercase', 
    paddingBottom: '5px',
    borderBottom: `2px solid ${accentColor}`,
    marginBottom: '10px', 
    marginTop: '16px',
    fontFamily: isAr ? 'var(--global-font)' : 'inherit'
  };

  const isPopulated = (k) => data[k] && (Array.isArray(data[k]) ? data[k].length > 0 : true);
  const baseSections = visibleSections ? order.filter(k => visibleSections.includes(k)) : order.filter(k => isPopulated(k) || k === 'personal_info');
  const customKeys = Object.keys(data).filter(k => k.startsWith('custom_') && Array.isArray(data[k]) && data[k].length > 0);
  const sectionsToRender = [...baseSections.filter(k => k !== 'custom'), ...customKeys];

  const commonProps = { language, accentColor, textColor: '#111827', headingStyle, bodyStyle, visibleSections };

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
      {isFirstPage && <PersonalInfoSection data={data.personalInfo} {...commonProps} nameStyle={{ fontSize: config.nameSize, fontWeight: 900 }} />}
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
