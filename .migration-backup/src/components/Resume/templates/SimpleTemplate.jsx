// ============================================================
// The Efficiency Expert — Clean, Fast, Impactful
// ============================================================
import React from 'react';
import { PersonalInfoSection, SummarySection, ExperienceSection, EducationSection, SkillsSection, ProjectsSection, LanguagesSection, CertificatesSection, AwardsSection, VolunteeringSection, ReferencesSection, renderSection } from '../Sections';
import { CATEGORIES, CATEGORY_SECTION_ORDER } from '../../../utils/constants';
import useStyleStore from '../../../store/useStyleStore';

export default function EfficiencyExpertTemplate({ 
  data, 
  category = CATEGORIES.CHRONOLOGICAL, 
  accentColor: propAccentColor = '#475569', 
  visibleSections = null, 
  language = 'en',
  isFirstPage = true,
}) {
  const isAr = language === 'ar';
  const styles = useStyleStore();
  const order = CATEGORY_SECTION_ORDER[category] || CATEGORY_SECTION_ORDER[CATEGORIES.CHRONOLOGICAL];
  const accentColor = propAccentColor || '#475569';
  const s = data?.settings || {};
  const config = {
    nameSize: s.name_size ? `${s.name_size}pt` : '20pt',
    headerSize: s.header_size ? `${s.header_size}pt` : '12pt',
    textSize: s.text_size ? `${s.text_size}pt` : '10pt',
    lineHeight: parseFloat(s.line_height || 1.4),
    marginTop: styles.marginTop ? `${styles.marginTop}mm` : '15mm',
    marginBottom: styles.marginBottom ? `${styles.marginBottom}mm` : '15mm',
    marginSide: styles.marginSides ? `${styles.marginSides}mm` : '20mm',
  };

  const bodyStyle = { fontSize: config.textSize, lineHeight: config.lineHeight, color: '#1F2937' };
  const headingStyle = { color: accentColor, fontSize: config.headerSize, fontWeight: 700, borderBottom: `1px solid #e2e8f0`, paddingBottom: '4px', marginBottom: '8px', marginTop: '14px' };

  const isPopulated = (k) => data[k] && (Array.isArray(data[k]) ? data[k].length > 0 : true);
  const baseSections = visibleSections ? order.filter(k => visibleSections.includes(k)) : order.filter(k => isPopulated(k) || k === 'personal_info');
  // Discover custom sections (custom_XXXX keys)
  const customKeys = Object.keys(data).filter(k => k.startsWith('custom_') && Array.isArray(data[k]) && data[k].length > 0);
  const sectionsToRender = [...baseSections.filter(k => k !== 'custom'), ...customKeys];

  const commonProps = { language, accentColor, textColor: '#1F2937', headingStyle, bodyStyle, visibleSections };

  return (
    <div data-cv-root style={{ width: '100%', minHeight: '297mm', backgroundColor: '#FFFFFF', direction: isAr ? 'rtl' : 'ltr', padding: `${config.marginTop} ${config.marginSide} ${config.marginBottom}`, boxSizing: 'border-box', fontFamily: 'var(--global-font)' }}>
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
        // Handle custom sections
        if (key.startsWith('custom_')) {
          return <React.Fragment key={key}>{renderSection(key, data, commonProps)}</React.Fragment>;
        }
        return null;
      })}
    </div>
  );
}
