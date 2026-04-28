// ============================================================
// CV-Mister — Shared Section Renderers
// Reusable across all 10 templates, with i18n support
// ============================================================

import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaLinkedin, FaGithub } from 'react-icons/fa';
import { t } from '../../utils/locales';
import useResumeStore from '../../store/useResumeStore';
import useStyleStore from '../../store/useStyleStore';

/* ── Personal Info Section (Separate) ─────────────────────── */
export function PersonalInfoSection({ data, headingStyle = {}, nameStyle = {}, accentColor = '#1E3A5F', language = 'en', headingOnly = false, noHeading = false, textColor = '#374151' }) {
  const isAr = language === 'ar';
  const { alignments = {} } = useResumeStore();
  const alignment = alignments['personal_info'] || 'start';
  
  if (!data) return null;

  const contactItems = [
    { label: isAr ? 'البريد الإلكتروني' : 'Email', value: data.email, type: 'ltr' },
    { label: isAr ? 'رقم الهاتف' : 'Phone', value: data.phone, type: 'ltr' },
    { label: isAr ? 'الموقع الجغرافي' : 'Location', value: data.location, type: 'text' },
    { label: isAr ? 'الموقع الإلكتروني' : 'Website', value: data.website, type: 'ltr' },
    { label: isAr ? 'LinkedIn' : 'LinkedIn', value: data.linkedin, type: 'ltr' },
    { label: isAr ? 'GitHub' : 'GitHub', value: data.github, type: 'ltr' },
  ].filter(i => i.value && i.value.trim() !== '');

  if (contactItems.length === 0 && !data.fullName) return null;

  // Convert alignment keyword to CSS-compatible value
  // Uses 'start'/'end' which respects direction (RTL/LTR) automatically
  const getFlexAlign = (align) => {
    if (align === 'center') return 'center';
    if (align === 'right') return isAr ? 'flex-start' : 'flex-end';
    if (align === 'left') return isAr ? 'flex-end' : 'flex-start';
    // 'start' or default → respects direction
    return 'flex-start';
  };

  const getTextAlign = (align) => {
    if (align === 'center') return 'center';
    if (align === 'right') return 'right';
    if (align === 'left') return 'left';
    return 'start'; // CSS logical — respects direction
  };

  const nameAlignment = alignments['full_name'] || alignment;

  return (
    <div data-section data-section-key="personal_info" className="resume-section" style={{ textAlign: getTextAlign(alignment) }}>
      {!headingOnly && (
        <div style={{ marginTop: '0px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: getFlexAlign(alignment) }}>
          {/* 1. Full Name */}
          {data.fullName && (
             <div style={{ 
               fontSize: nameStyle.fontSize || 'var(--name-font-size, 22pt)', 
               fontWeight: nameStyle.fontWeight || 900, 
               color: nameStyle.color || accentColor, 
               marginBottom: '2px', 
               width: '100%', 
               lineHeight: 1.1,
               display: 'flex',
               justifyContent: getFlexAlign(nameAlignment),
               textAlign: getTextAlign(nameAlignment)
             }}>
               {data.fullName}
             </div>
          )}
          
          {/* 2. Job Title */}
          {data.jobTitle && (
            <div style={{ fontSize: '13pt', fontWeight: 600, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {data.jobTitle}
            </div>
          )}

          {/* 3. Contact Data Row */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row',
            flexWrap: 'wrap',
            columnGap: '12px',
            rowGap: '6px',
            justifyContent: getFlexAlign(alignment),
            alignItems: 'center',
            width: '100%',
            marginTop: '4px'
          }}>
            {contactItems.map((item, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ 
                    fontSize: '10pt', 
                    color: textColor, 
                    direction: item.type === 'ltr' ? 'ltr' : 'inherit',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.value}
                  </span>
                </div>
                {i < contactItems.length - 1 && (
                  <span style={{ color: '#CBD5E1', fontSize: '12px', fontWeight: 300, margin: '0 4px' }}>|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Contact Info (Compact) ──────────────────────────────── */
export function ContactInfo({ data, layout = 'inline', accentColor = '#1E3A5F', textColor = '#4B5563', alignment = 'left' }) {
  const items = [
    { icon: <FaEnvelope />, value: data?.email || '' },
    { icon: <FaPhone />,   value: data?.phone || '' },
    { icon: <FaMapMarkerAlt />, value: data?.location || '' },
    { icon: <FaGlobe />,   value: data?.website || '' },
    { icon: <FaLinkedin />, value: data?.linkedin || '' },
    { icon: <FaGithub />,  value: data?.github || '' },
  ].filter((i) => i.value && i.value.trim() !== '');

  const justifyMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end'
  };

  const alignMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end'
  };

  if (items.length === 0) return null;

  if (layout === 'stacked') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '9pt', color: textColor, alignItems: alignMap[alignment] || 'flex-start' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: accentColor, flexShrink: 0, fontSize: '10px' }}>{item.icon}</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', fontSize: '10pt', color: textColor, justifyContent: justifyMap[alignment] || 'flex-start', alignItems: 'center' }}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: accentColor, fontSize: '10px', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
            <span style={{ whiteSpace: 'nowrap' }}>{item.value}</span>
          </span>
          {i < items.length - 1 && (
            <span style={{ color: '#CBD5E1', fontSize: '12px', fontWeight: 300 }}>|</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── Summary Section ─────────────────────────────────────── */
export function SummarySection({ summary, headingStyle = {}, bodyStyle = {}, language = 'en', headingOnly = false, noHeading = false, textColor = '#374151', customColor }) {
  const { alignments = {} } = useResumeStore();
  if (!summary) return null;
  return (
    <div data-section data-section-key="summary" className="resume-section">
      {!noHeading && <h2 className="resume-heading section-title" style={headingStyle}>{t('professional_summary', language)}</h2>}
      {!headingOnly && (
        <p className="resume-body" style={{ marginTop: noHeading ? '0px' : '10px', color: customColor || textColor, textAlign: alignments['summary'] || 'inherit', ...bodyStyle }}>
          {summary}
        </p>
      )}
    </div>
  );
}

/* ── Experience Section ──────────────────────────────────── */
export function ExperienceSection({ items = [], headingStyle = {}, accentColor = '#1E3A5F', language = 'en', visibleSections, headingOnly = false, noHeading = false, textColor = '#374151', customColor, bodyStyle = {} }) {
  const { customTitles, pageBreaks, alignments = {} } = useResumeStore();
  if (!items.length) return null;
  const filteredItems = visibleSections 
    ? items.filter((_, idx) => visibleSections.includes(`experience-${idx}`))
    : items;
  if (filteredItems.length === 0) return null;
  const showHeading = !visibleSections || visibleSections.includes('experience-0');
  const title = customTitles['experience'] || t('experience', language);
  const shouldBreak = pageBreaks.includes('experience');

  return (
    <div data-section className="resume-section">
      {showHeading && !noHeading && <h2 className="resume-heading section-title" style={headingStyle}>{title}</h2>}
      {!headingOnly && filteredItems.map((exp) => {
        const trueIdx = items.indexOf(exp);
        const isLast = trueIdx === items.length - 1;
        const isFirst = trueIdx === 0;
        return (
          <div key={exp.id} data-section-key={`experience-${trueIdx}`} data-force-page-break={shouldBreak && isLast ? "true" : undefined} className="experience-item" style={{ marginTop: isFirst && noHeading ? '0px' : '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '11pt', fontWeight: 600, color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? textColor : '#111827'), flex: '1 1 150px' }}>{exp.position}</h3>
              <span style={{ fontSize: '9pt', color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? 'rgba(255,255,255,0.7)' : '#6B7280'), whiteSpace: 'nowrap', opacity: customColor ? 0.85 : 1 }}>
                {exp.startDate} — {exp.endDate}
              </span>
            </div>
            <div style={{ fontSize: '10pt', color: customColor || accentColor, fontWeight: 500, marginTop: '2px' }}>
              {exp.company}{exp.location ? ` · ${exp.location}` : ''}
            </div>
            {exp.description && (
              <p style={{ 
                fontSize: bodyStyle.fontSize || 'var(--body-font-size)', 
                color: customColor || textColor, 
                marginTop: '6px', 
                lineHeight: bodyStyle.lineHeight || 'var(--line-height-global)', 
                textAlign: alignments[`experience-${exp.id}`] || 'inherit',
                ...bodyStyle 
              }}>
                {exp.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Education Section ───────────────────────────────────── */
export function EducationSection({ items = [], headingStyle = {}, accentColor = '#1E3A5F', language = 'en', visibleSections, headingOnly = false, noHeading = false, textColor = '#374151', customColor, bodyStyle = {} }) {
  const { customTitles, pageBreaks, alignments = {} } = useResumeStore();
  if (!items.length) return null;
  const filteredItems = visibleSections 
    ? items.filter((_, idx) => visibleSections.includes(`education-${idx}`))
    : items;
  if (filteredItems.length === 0) return null;
  const showHeading = !visibleSections || visibleSections.includes('education-0');
  const title = customTitles['education'] || t('education', language);
  const shouldBreak = pageBreaks.includes('education');

  return (
    <div data-section className="resume-section">
      {showHeading && !noHeading && <h2 className="resume-heading section-title" style={headingStyle}>{title}</h2>}
      {!headingOnly && filteredItems.map((edu) => {
        const trueIdx = items.indexOf(edu);
        const isLast = trueIdx === items.length - 1;
        const isFirst = trueIdx === 0;
        return (
          <div key={edu.id} data-section-key={`education-${trueIdx}`} data-force-page-break={shouldBreak && isLast ? "true" : undefined} className="education-item" style={{ marginTop: isFirst && noHeading ? '0px' : '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '11pt', fontWeight: 600, color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? textColor : '#111827'), flex: '1 1 150px' }}>{edu.degree}</h3>
              <span style={{ fontSize: '9pt', color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? 'rgba(255,255,255,0.7)' : '#6B7280'), whiteSpace: 'nowrap', opacity: customColor ? 0.85 : 1 }}>
                {edu.startDate} — {edu.endDate}
              </span>
            </div>
            <div style={{ fontSize: '10pt', color: customColor || accentColor, fontWeight: 500, marginTop: '2px' }}>
              {edu.institution}{edu.location ? ` · ${edu.location}` : ''}
            </div>
            {edu.description && (
              <p style={{ 
                fontSize: bodyStyle.fontSize || 'var(--body-font-size)', 
                color: customColor || textColor, 
                marginTop: '4px', 
                lineHeight: bodyStyle.lineHeight || 'var(--line-height-global)',
                textAlign: alignments[`education-${edu.id}`] || 'inherit',
                ...bodyStyle
              }}>
                {edu.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Skills Section ──────────────────────────────────────── */
export function SkillsSection({ items = [], headingStyle = {}, accentColor = '#1E3A5F', showBars = true, language = 'en', headingOnly = false, noHeading = false, textColor = '#374151', customColor, visibleSections }) {
  const { customTitles } = useResumeStore();
  if (!items.length) return null;
  const filteredItems = visibleSections 
    ? items.filter((_, idx) => visibleSections.includes(`skills-${idx}`))
    : items;
  if (!filteredItems.length) return null;

  const showHeading = !visibleSections || visibleSections.includes('skills-0');
  const title = customTitles?.skills || t('skills', language);

  return (
    <div data-section data-section-key="skills" className="resume-section">
      {showHeading && !noHeading && <h2 className="resume-heading section-title" style={headingStyle}>{title}</h2>}
      {!headingOnly && (
        <div style={{ marginTop: noHeading ? '0px' : '8px', display: 'grid', gridTemplateColumns: showBars ? '1fr' : 'repeat(2, 1fr)', gap: showBars ? '8px' : '6px' }}>
        {filteredItems.map((skill) => {
          const trueIdx = items.indexOf(skill);
          return showBars ? (
            <div key={skill.id} data-section-key={`skills-${trueIdx}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5pt', marginBottom: '3px' }}>
                <span style={{ fontWeight: 500, color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? textColor : '#111827') }}>{skill.name}</span>
                <span style={{ color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? 'rgba(255,255,255,0.6)' : '#9CA3AF'), fontSize: '8.5pt' }}>{skill.level}%</span>
              </div>
              <div className="skill-bar-bg" style={customColor ? { background: `${customColor}33` } : undefined}>
                <div className="skill-bar-fill" style={{ width: `${skill.level}%`, background: customColor || accentColor }} />
              </div>
            </div>
          ) : (
            <span key={skill.id} data-section-key={`skills-${trueIdx}`} style={{ fontSize: '9.5pt', color: customColor || textColor, padding: '4px 0' }}>
              • {skill.name}
            </span>
          );
        })}
      </div>
      )}
    </div>
  );
}

/* ── Projects Section ─────────────────────────────────────── */
export function ProjectsSection({ items = [], headingStyle = {}, accentColor = '#1E3A5F', language = 'en', visibleSections, headingOnly = false, noHeading = false, textColor = '#374151', customColor, bodyStyle = {} }) {
  const { customTitles, pageBreaks, alignments = {} } = useResumeStore();
  if (!items.length) return null;
  const filteredItems = visibleSections 
    ? items.filter((_, idx) => visibleSections.includes(`projects-${idx}`))
    : items;
  if (filteredItems.length === 0) return null;
  const showHeading = !visibleSections || visibleSections.includes('projects-0');
  const title = customTitles['projects'] || t('projects', language);
  const shouldBreak = pageBreaks.includes('projects');

  return (
    <div data-section className="resume-section">
      {showHeading && !noHeading && <h2 className="resume-heading section-title" style={headingStyle}>{title}</h2>}
      {!headingOnly && filteredItems.map((proj) => {
        const trueIdx = items.indexOf(proj);
        const isLast = trueIdx === items.length - 1;
        const isFirst = trueIdx === 0;
        return (
          <div key={proj.id} data-section-key={`projects-${trueIdx}`} data-force-page-break={shouldBreak && isLast ? "true" : undefined} className="project-item" style={{ marginTop: isFirst && noHeading ? '0px' : '10px' }}>
            <h3 style={{ fontSize: '11pt', fontWeight: 600, color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? textColor : '#111827') }}>
              {proj.name}
              {proj.link && (
                <span style={{ fontWeight: 400, fontSize: '8.5pt', color: customColor || accentColor, marginInlineStart: '8px' }}>
                  {proj.link}
                </span>
              )}
            </h3>
            {proj.description && (
              <p style={{ 
                fontSize: bodyStyle.fontSize || 'var(--body-font-size)', 
                color: customColor || textColor, 
                marginTop: '4px', 
                lineHeight: bodyStyle.lineHeight || 'var(--line-height-global)',
                textAlign: alignments[`projects-${proj.id}`] || 'inherit',
                ...bodyStyle
              }}>
                {proj.description}
              </p>
            )}
            {proj.technologies && (
              <div style={{ fontSize: '8.5pt', color: customColor || (textColor === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : '#6B7280'), marginTop: '4px' }}>
                <span style={{ fontWeight: 500 }}>{t('tech', language)}</span> {proj.technologies}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Languages Section ───────────────────────────────────── */
export function LanguagesSection({ items = [], headingStyle = {}, language = 'en', headingOnly = false, noHeading = false, textColor = '#374151', customColor, visibleSections }) {
  const { customTitles } = useResumeStore();
  const filteredItems = visibleSections 
    ? items.filter((_, idx) => visibleSections.includes(`languages-${idx}`))
    : items;
  if (!filteredItems.length) return null;

  const showHeading = !visibleSections || visibleSections.includes('languages-0');
  const title = customTitles['languages'] || t('languages', language);

  return (
    <div data-section data-section-key="languages" className="resume-section">
      {showHeading && !noHeading && <h2 className="resume-heading section-title" style={headingStyle}>{title}</h2>}
      {!headingOnly && (
        <div style={{ marginTop: noHeading ? '0px' : '8px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {filteredItems.map((lang) => {
          const trueIdx = items.indexOf(lang);
          return (
          <div key={lang.id} data-section-key={`languages-${trueIdx}`} style={{ fontSize: '10pt', color: customColor || textColor }}>
            <span style={{ fontWeight: 600, color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? textColor : '#111827') }}>{lang.name}</span>
            <span style={{ color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? 'rgba(255,255,255,0.7)' : '#6B7280') }}> — {lang.level}</span>
          </div>
        )})}
      </div>
      )}
    </div>
  );
}

/* ── Certificates Section ────────────────────────────────── */
export function CertificatesSection({ items = [], headingStyle = {}, language = 'en', headingOnly = false, noHeading = false, textColor = '#374151', customColor, visibleSections }) {
  const { customTitles } = useResumeStore();
  const filteredItems = visibleSections 
    ? items.filter((_, idx) => visibleSections.includes(`certificates-${idx}`))
    : items;
  if (!filteredItems.length) return null;

  const showHeading = !visibleSections || visibleSections.includes('certificates-0');
  const title = customTitles['certificates'] || t('certifications', language);

  return (
    <div data-section data-section-key="certificates" className="resume-section">
      {showHeading && !noHeading && <h2 className="resume-heading section-title" style={headingStyle}>{title}</h2>}
      {!headingOnly && filteredItems.map((cert) => {
        const trueIdx = items.indexOf(cert);
        return (
        <div key={cert.id} data-section-key={`certificates-${trueIdx}`} className="certificate-item" style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5pt', fontWeight: 600, color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? textColor : '#111827'), flex: '1 1 120px' }}>{cert.name}</span>
            <span style={{ fontSize: '8.5pt', color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? 'rgba(255,255,255,0.6)' : '#9CA3AF'), opacity: customColor ? 0.85 : 1, whiteSpace: 'nowrap' }}>{cert.date}</span>
          </div>
          <span style={{ fontSize: '9.5pt', color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? 'rgba(255,255,255,0.7)' : '#6B7280') }}>{cert.issuer}</span>
        </div>
      )})}
    </div>
  );
}

/* ── Awards Section ──────────────────────────────────────── */
export function AwardsSection({ items = [], headingStyle = {}, language = 'en', headingOnly = false, noHeading = false, textColor = '#374151', customColor, visibleSections, bodyStyle = {} }) {
  const { customTitles, alignments = {} } = useResumeStore();
  if (!items.length) return null;

  const filteredItems = visibleSections 
    ? items.filter((_, idx) => visibleSections.includes(`awards-${idx}`))
    : items;
  if (!filteredItems.length) return null;

  const showHeading = !visibleSections || visibleSections.includes('awards-0');
  const title = customTitles['awards'] || t('awards', language);

  return (
    <div data-section data-section-key="awards" className="resume-section">
      {showHeading && !noHeading && <h2 className="resume-heading section-title" style={headingStyle}>{title}</h2>}
      {!headingOnly && filteredItems.map((award) => {
        const trueIdx = items.indexOf(award);
        return (
        <div key={award.id} data-section-key={`awards-${trueIdx}`} className="award-item" style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', alignItems: 'baseline' }}>
            <span style={{ fontSize: '10.5pt', fontWeight: 600, color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? textColor : '#111827'), flex: '1 1 120px' }}>{award.name}</span>
            <span style={{ fontSize: '8.5pt', color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? 'rgba(255,255,255,0.6)' : '#9CA3AF'), opacity: customColor ? 0.85 : 1, whiteSpace: 'nowrap' }}>{award.date}</span>
          </div>
          <span style={{ fontSize: '9.5pt', color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? 'rgba(255,255,255,0.7)' : '#6B7280') }}>{award.issuer}</span>
          {award.description && (
            <p style={{ 
              fontSize: bodyStyle.fontSize || '9.5pt', 
              color: customColor || textColor, 
              marginTop: '4px', 
              lineHeight: bodyStyle.lineHeight || 'var(--line-height-global)',
              textAlign: alignments[`awards-${award.id}`] || 'inherit',
              ...bodyStyle 
            }}>{award.description}</p>
          )}
        </div>
      )})}
    </div>
  );
}

/* ── Volunteering Section ────────────────────────────────── */
export function VolunteeringSection({ items = [], headingStyle = {}, language = 'en', visibleSections, headingOnly = false, noHeading = false, textColor = '#374151', customColor, bodyStyle = {} }) {
  const { customTitles, pageBreaks, alignments = {} } = useResumeStore();
  if (!items.length) return null;
  const filteredItems = visibleSections 
    ? items.filter((_, idx) => visibleSections.includes(`volunteering-${idx}`))
    : items;
  if (filteredItems.length === 0) return null;
  const showHeading = !visibleSections || visibleSections.includes('volunteering-0');
  const title = customTitles['volunteering'] || t('volunteering', language);
  const shouldBreak = pageBreaks.includes('volunteering');

  return (
    <div data-section className="resume-section">
      {showHeading && !noHeading && <h2 className="resume-heading section-title" style={headingStyle}>{title}</h2>}
      {!headingOnly && filteredItems.map((vol) => {
        const trueIdx = items.indexOf(vol);
        const isLast = trueIdx === items.length - 1;
        return (
          <div key={vol.id} data-section-key={`volunteering-${trueIdx}`} data-force-page-break={shouldBreak && isLast ? "true" : undefined} className="volunteer-item" style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontSize: '11pt', fontWeight: 600, color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? textColor : '#111827') }}>{vol.role}</h3>
              <span style={{ fontSize: '9pt', color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? 'rgba(255,255,255,0.6)' : '#6B7280'), opacity: customColor ? 0.85 : 1, whiteSpace: 'nowrap' }}>{vol.startDate} — {vol.endDate}</span>
            </div>
            <div style={{ fontSize: '10pt', color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? 'rgba(255,255,255,0.7)' : '#6B7280') }}>{vol.organization}</div>
            {vol.description && (
              <p style={{ 
                fontSize: bodyStyle.fontSize || 'var(--body-font-size)', 
                color: customColor || textColor, 
                marginTop: '4px', 
                lineHeight: bodyStyle.lineHeight || 'var(--line-height-global)',
                textAlign: alignments[`volunteering-${vol.id}`] || 'inherit',
                ...bodyStyle
              }}>
                {vol.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── References Section ──────────────────────────────────── */
export function ReferencesSection({ items = [], headingStyle = {}, language = 'en', visibleSections, headingOnly = false, noHeading = false, textColor = '#374151', customColor }) {
  const { customTitles, pageBreaks } = useResumeStore();
  const filteredItems = visibleSections 
    ? items.filter((_, idx) => visibleSections.includes(`references-${idx}`))
    : items;
  if (filteredItems.length === 0) return null;
  const showHeading = !visibleSections || visibleSections.includes('references-0');
  const title = customTitles['references'] || t('references', language);
  const shouldBreak = pageBreaks.includes('references');

  return (
    <div data-section className="resume-section">
      {showHeading && !noHeading && <h2 className="resume-heading section-title" style={headingStyle}>{title}</h2>}
      {!headingOnly && (
        <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {filteredItems.map((ref) => {
          const trueIdx = items.indexOf(ref);
          const isLast = trueIdx === items.length - 1;
          return (
            <div key={ref.id} data-section-key={`references-${trueIdx}`} data-force-page-break={shouldBreak && isLast ? "true" : undefined} style={{ padding: '10px', border: customColor ? `1px solid ${customColor}40` : '1px solid #E5E7EB', borderRadius: '4px' }}>
              <div style={{ fontSize: '10.5pt', fontWeight: 600, color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? textColor : '#111827') }}>{ref.name}</div>
              <div style={{ fontSize: '9pt', color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? 'rgba(255,255,255,0.6)' : '#6B7280') }}>{ref.position}</div>
              {ref.email && <div style={{ fontSize: '8.5pt', color: customColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? 'rgba(255,255,255,0.6)' : '#9CA3AF'), marginTop: '4px', opacity: customColor ? 0.8 : 1 }}>{ref.email}</div>}
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

export function ContactSection({ data, headingStyle = {}, language = 'en', noHeading = false, accentColor = '#1E3A5F', textColor = '#4B5563' }) {
  const { customTitles, alignments = {} } = useResumeStore();
  const title = customTitles['contact'] || t('contact', language);
  const alignment = alignments['contact'] || 'left';
  
  return (
    <div data-section data-section-key="contact" className="resume-section" style={{ textAlign: alignment }}>
      {!noHeading && <h2 className="resume-heading section-title" style={headingStyle}>{title}</h2>}
      <div style={{ marginTop: '8px' }}>
        <ContactInfo data={data} layout="stacked" accentColor={accentColor} textColor={textColor} alignment={alignment} />
      </div>
    </div>
  );
}


/* ── Section Renderer (by key) ───────────────────────────── */
export function renderSection(key, data, props = {}) {
  const globalLanguage = useStyleStore.getState().language;
  const { 
    headingStyle: originalHeadingStyle = {}, 
    accentColor = '#1E3A5F', 
    showSkillBars = true, 
    language = globalLanguage || 'en', 
    visibleSections, 
    headingOnly = false, 
    noHeading = false, 
    textColor = '#374151' 
  } = props;

  const store = useResumeStore.getState();
  const { sectionsStyles: storeStyles = {}, customTitles = {} } = store;
  const sectionsStyles = data?.settings?.sections_styles || storeStyles;

  if (headingOnly) {
    if (key === 'header' || key === 'personal_info') return null;
    if (key.startsWith('custom_')) return customTitles[key] || key;
    
    const defaultTitles = {
      summary: t('professional_summary', language),
      experience: t('experience', language),
      education: t('education', language),
      skills: t('skills', language),
      projects: t('projects', language),
      languages: t('languages', language),
      certificates: t('certifications', language),
      awards: t('awards', language),
      volunteering: t('volunteering', language),
      references: t('references', language),
    };
    return customTitles[key] || defaultTitles[key] || key;
  }

  const sectionColor = sectionsStyles[key]?.color;

  // Clone and override color if section-specific color is set
  const headingStyle = { ...originalHeadingStyle };
  if (sectionColor) {
    headingStyle.color = sectionColor;
    headingStyle.borderColor = sectionColor;
  }

  // Use sectionColor as the local accentColor for this section if it exists
  const localAccentColor = sectionColor || accentColor;

  // Custom section check first
  if (key.startsWith('custom_')) {
    const items = data[key] || [];
    const customTitle = useResumeStore.getState().customTitles[key] || key;
    const { alignments = {} } = useResumeStore.getState();

    const filteredItems = visibleSections 
      ? items.filter((_, idx) => visibleSections.includes(`${key}-${idx}`))
      : items;

    if (filteredItems.length === 0) return null;

    return (
      <div data-section data-section-key={key} className="resume-section">
        {!noHeading && <h2 className="resume-heading section-title" style={headingStyle}>{customTitle}</h2>}
        {!headingOnly && filteredItems.map((item) => {
          const trueIdx = items.indexOf(item);
          return (
          <div key={item.id || trueIdx} data-section-key={`${key}-${trueIdx}`} style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontSize: '11pt', fontWeight: 600, color: sectionColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? textColor : '#111827') }}>{item.title}</h3>
              <span style={{ fontSize: '9pt', color: sectionColor || (['#FFFFFF', '#ffffff', '#fff', '#F8FAFC', '#f8fafc'].includes(textColor) ? 'rgba(255,255,255,0.7)' : localAccentColor), fontWeight: 500, whiteSpace: 'nowrap' }}>{item.subtitle}</span>
            </div>
            {item.description && (
              <p style={{ 
                fontSize: 'var(--body-font-size)', 
                color: sectionColor || textColor, 
                marginTop: '6px', 
                lineHeight: 'var(--line-height-global)',
                textAlign: alignments[`${key}-${item.id}`] || 'inherit'
              }}>
                {item.description}
              </p>
            )}
          </div>
        )})}
      </div>
    );
  }

  const commonProps = { headingStyle, accentColor: localAccentColor, language, visibleSections, headingOnly, noHeading, customColor: sectionColor };

  const { alignments = {} } = useResumeStore.getState();

  const map = {
    header: (
      <div data-section-key="header" style={{ marginBottom: '16px', textAlign: alignments['header'] || 'inherit' }}>
        <h1 className="resume-name" style={{ color: sectionColor || accentColor, fontSize: 'var(--name-font-size)' }}>
          {data?.personalInfo?.fullName || ''}
        </h1>
        {data?.personalInfo?.jobTitle && (
          <div style={{ fontSize: '12pt', color: sectionColor || (textColor === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : '#6B7280'), marginTop: '4px' }}>{data.personalInfo.jobTitle}</div>
        )}
      </div>
    ),
    personal_info: <PersonalInfoSection data={data.personalInfo} {...commonProps} textColor={textColor} />,
    contact:      <ContactSection data={data.personalInfo} {...commonProps} textColor={textColor} />,
    summary:      <SummarySection summary={data.summary} {...commonProps} textColor={textColor} />,
    experience:   <ExperienceSection items={data.experience} {...commonProps} textColor={textColor} />,
    education:    <EducationSection items={data.education} {...commonProps} textColor={textColor} />,
    skills:       <SkillsSection items={data.skills} {...commonProps} showBars={showSkillBars} textColor={textColor} />,
    projects:     <ProjectsSection items={data.projects} {...commonProps} textColor={textColor} />,
    languages:    <LanguagesSection items={data.languages} {...commonProps} textColor={textColor} />,
    certificates: <CertificatesSection items={data.certificates} {...commonProps} textColor={textColor} />,
    awards:       <AwardsSection items={data.awards} {...commonProps} textColor={textColor} />,
    volunteering: <VolunteeringSection items={data.volunteering} {...commonProps} textColor={textColor} />,
    references:   <ReferencesSection items={data.references} {...commonProps} textColor={textColor} />,
  };

  const content = map[key] || null;
  if (!content) return null;

  // Handle header headingOnly logic
  if (key === 'header' && headingOnly) return null;

  return content;
}
