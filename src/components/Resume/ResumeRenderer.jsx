// ============================================================
// CV-Mister — ResumeRenderer (Strategy Pattern Dispatcher)
// Maps template ID → component, injects category section order
// Now supports `visibleSections` for page-level filtering
// ============================================================

import React from 'react';
import { TEMPLATES } from '../../utils/constants';
import useStyleStore from '../../store/useStyleStore';
import useResumeStore from '../../store/useResumeStore';

import SimpleTemplate from './templates/SimpleTemplate';
import ProfessionalTemplate from './templates/ProfessionalTemplate';
import ElegantTemplate from './templates/ElegantTemplate';
import CreativeTemplate from './templates/CreativeTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import MinimalistTemplate from './templates/MinimalistTemplate';
import TechTemplate from './templates/TechTemplate';
import ExecutiveTemplate from './templates/ExecutiveTemplate';
import AcademicTemplate from './templates/AcademicTemplate';
import ModernSidebarTemplate from './templates/ModernSidebarTemplate';
import RefinedTemplate from './templates/RefinedTemplate';
import SlateTemplate from './templates/SlateTemplate';
import BorderGridTemplate from './templates/BorderGridTemplate';
import GradientHeaderTemplate from './templates/GradientHeaderTemplate';
import CompactTemplate from './templates/CompactTemplate';
import ClassicCorporateTemplate from './templates/ClassicCorporateTemplate';
import ModernSplitTemplate from './templates/ModernSplitTemplate';
import ExecutiveLineTemplate from './templates/ExecutiveLineTemplate';
import LegacyCleanTemplate from './templates/LegacyCleanTemplate';
import MinimalBoldTemplate from './templates/MinimalBoldTemplate';
import SubtleBarTemplate from './templates/SubtleBarTemplate';
import SkySplitTemplate from './templates/SkySplitTemplate';
import OceanBlueTemplate from './templates/OceanBlueTemplate';
import ModernWaveTemplate from './templates/ModernWaveTemplate';
import ATSTemplate from './templates/ATSTemplate';

// ── Strategy Map ─────────────────────────────────────────
const TEMPLATE_MAP = {
  [TEMPLATES.SIMPLE]:          SimpleTemplate,
  [TEMPLATES.PROFESSIONAL]:    ProfessionalTemplate,
  [TEMPLATES.ELEGANT]:         ElegantTemplate,
  [TEMPLATES.CREATIVE]:        CreativeTemplate,
  [TEMPLATES.CLASSIC]:         ClassicTemplate,
  [TEMPLATES.MINIMALIST]:      MinimalistTemplate,
  [TEMPLATES.TECH]:            TechTemplate,
  [TEMPLATES.EXECUTIVE]:       ExecutiveTemplate,
  [TEMPLATES.ACADEMIC]:        AcademicTemplate,
  [TEMPLATES.MODERN_SIDEBAR]:  ModernSidebarTemplate,
  [TEMPLATES.REFINED]:         RefinedTemplate,
  [TEMPLATES.SLATE]:           SlateTemplate,
  [TEMPLATES.BORDER_GRID]:     BorderGridTemplate,
  [TEMPLATES.GRADIENT_TOP]:    GradientHeaderTemplate,
  [TEMPLATES.COMPACT]:         CompactTemplate,
  [TEMPLATES.CLASSIC_CORPORATE]: ClassicCorporateTemplate,
  [TEMPLATES.MODERN_SPLIT]:      ModernSplitTemplate,
  [TEMPLATES.EXECUTIVE_LINE]:    ExecutiveLineTemplate,
  [TEMPLATES.LEGACY_CLEAN]:      LegacyCleanTemplate,
  [TEMPLATES.MINIMAL_BOLD]:      MinimalBoldTemplate,
  [TEMPLATES.SUBTLE_BAR]:        SubtleBarTemplate,
  [TEMPLATES.SKY_SPLIT]:         SkySplitTemplate,
  [TEMPLATES.OCEAN_BLUE]:        OceanBlueTemplate,
  [TEMPLATES.MODERN_WAVE]:       ModernWaveTemplate,
  [TEMPLATES.ATS]:               ATSTemplate,
};

/**
 * ResumeRenderer — Strategy Pattern entry point.
 * Renders the correct template based on templateId.
 *
 * @param {string}   templateId      - One of TEMPLATES constants
 * @param {Object}   data            - Full resume data object
 * @param {string}   category        - One of CATEGORIES constants
 * @param {string}   accentColor     - Hex color for accents
 * @param {Object}   cssVars         - CSS custom properties from style store
 * @param {string[]} visibleSections - If provided, only render these section keys
 *                                     (null = render all, used for measuring)
 * @param {boolean}  isFirstPage     - Whether this is the first page (show header)
 */
export default function ResumeRenderer({
  templateId,
  data,
  category,
  accentColor,
  cssVars,
  visibleSections = null,
  isFirstPage = true,
  language = 'en',
  pageId = 'measure',
}) {
  const TemplateComponent = TEMPLATE_MAP[templateId] || ProfessionalTemplate;
  const styles = useStyleStore();
  const { alignments = {} } = useResumeStore();
  const s = data?.settings || {};
  const isRtl = language === 'ar';
  const headerAlign = alignments['header'] || styles.headerAlign || s.header_align || 'start';
 
  return (
    <>
      <style>{`
        /* العنوان الرئيسي فقط هو الذي يستجيب للسلايدر/الأزرار */
        .section-title, 
        .resume-heading,
        .section-header,
        [data-section] > h2, 
        [data-section] > h3 { 
           text-align: ${headerAlign} !important; 
           width: 100% !important;
           display: block !important;
        }

        /* منع توريث المحاذاة للنصوص الداخلية — يستخدم start لدعم RTL/LTR */
        .section-content, 
        .section-body,
        .section-item-title, 
        .section-description,
        [data-section-key],
        .project-item *,
        .experience-item *,
        .education-item * {
           text-align: start !important; 
        }
      `}</style>
      <TemplateComponent
        data={data}
        category={category}
        accentColor={accentColor}
        cssVars={cssVars}
        visibleSections={visibleSections}
        isFirstPage={isFirstPage}
        language={language}
        pageId={pageId}
      />
    </>
  );
}
