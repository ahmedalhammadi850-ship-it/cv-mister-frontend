// ============================================================
// CV-Mister — PrintContainer
// Print-optimized wrapper for Ctrl+P / Puppeteer PDF export
// ============================================================

import React from 'react';
import ResumeRenderer from './ResumeRenderer';
import useResumeStore from '../../store/useResumeStore';
import useStyleStore from '../../store/useStyleStore';

/**
 * PrintContainer — Dedicated print component.
 *
 * Renders the resume in a strict A4 format optimized for:
 * - Browser Ctrl+P printing
 * - Puppeteer PDF generation
 *
 * Key behaviors:
 * - Exactly 210mm × 297mm per page
 * - break-inside: avoid on all sections
 * - page-break-after: always between pages
 * - widows: 3, orphans: 3 for text
 * - 20mm safe zones top/bottom
 * - Header/footer on continuation pages
 */
export default function PrintContainer() {
  const rawData = useResumeStore((s) => s.data);
  const {
    template, category, accentColor, getCssVars, language,
    nameFontSize, headingFontSize, bodyFontSize, lineHeight,
    marginTop, marginBottom, marginSides, sectionGap, headerAlign,
  } = useStyleStore();
  const cssVars = getCssVars();

  // ── BRIDGE: Inject useStyleStore values into data.settings ──
  const data = {
    ...rawData,
    settings: {
      ...(rawData?.settings || {}),
      name_size: nameFontSize,
      header_size: headingFontSize,
      text_size: bodyFontSize,
      line_height: lineHeight,
      margin_top: marginTop,
      margin_bottom: marginBottom,
      margin_side: marginSides,
      section_spacing: sectionGap,
      header_align: headerAlign,
    }
  };

  return (
    <div
      className="print-container"
      style={{
        ...cssVars,
        width: '210mm',
        margin: '0 auto',
        background: '#fff',
      }}
    >
      <div
        className="a4-page-outer"
        style={{
          width: '210mm',
          minHeight: '297mm',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="a4-page-content"
          style={{
            paddingTop: cssVars['--margin-top'] || '20mm',
            paddingBottom: cssVars['--margin-bottom'] || '20mm',
            paddingLeft: cssVars['--margin-sides'] || '15mm',
            paddingRight: cssVars['--margin-sides'] || '15mm',
          }}
        >
          <ResumeRenderer
            templateId={template}
            data={data}
            category={category}
            accentColor={accentColor}
            cssVars={cssVars}
          />
        </div>
      </div>
    </div>
  );
}
