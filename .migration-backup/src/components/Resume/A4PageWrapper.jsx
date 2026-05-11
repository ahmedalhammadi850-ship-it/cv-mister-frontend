// ============================================================
// CV-Mister — A4PageWrapper
// Measures content → distributes across pages via pagination engine
// Supports two modes:
//   1. Section-based (default): Standard layout with sidebar/main columns
//   2. Column-flow: CSS columns — fills left column first, then right,
//                   overflows to next page
// ============================================================

import React, { useRef, useState, useEffect, useCallback } from 'react';
import A4Page from './A4Page';
import ResumeRenderer from './ResumeRenderer';
import useResumeStore from '../../store/useResumeStore';
import useStyleStore from '../../store/useStyleStore';
import { splitContentToPages, splitContentToColumnarPages } from '../../utils/paginationEngine';
import DraggableResumeCanvas from './DraggableResumeCanvas';
import { renderSection } from './Sections';
import { CATEGORY_SECTION_ORDER, CATEGORIES } from '../../utils/constants';

export default function A4PageWrapper({ deferredData }) {
  const { layoutColumns, customTitles, pageBreaks, sectionsStyles } = useResumeStore();
  const storeData = useResumeStore((s) => s.data);
  const {
    template, category, language, accentColor, getCssVars, columnFlowEnabled,
    nameFontSize, headingFontSize, bodyFontSize, lineHeight: storeLineHeight,
    marginTop: storeMarginTop, marginBottom: storeMarginBottom, marginSides: storeMarginSides,
    sectionGap, headerAlign,
  } = useStyleStore();
  const cssVars = getCssVars();

  // Prefer deferredData if available to keep UI responsive
  const rawData = deferredData || storeData;

  // ── BRIDGE: Inject useStyleStore values into data.settings ──
  // Templates read from data.settings.header_size, but the sidebar writes to useStyleStore.headingFontSize
  // This bridge ensures slider changes propagate to all templates instantly.
  const renderData = {
    ...rawData,
    settings: {
      ...(rawData?.settings || {}),
      name_size: nameFontSize,
      header_size: headingFontSize,
      text_size: bodyFontSize,
      line_height: storeLineHeight,
      margin_top: storeMarginTop,
      margin_bottom: storeMarginBottom,
      margin_side: storeMarginSides,
      section_spacing: sectionGap,
      header_align: headerAlign,
      sections_styles: sectionsStyles,
    }
  };


  const measureRef = useRef(null);
  const columnMeasureRef = useRef(null);
  
  // Section-based pagination state
  const [pages, setPages] = useState(null); 
  // Column-flow pagination state
  const [columnPages, setColumnPages] = useState(null);

  // ── Section-based Pagination measurement ─────────────────────────
  const runPagination = useCallback(() => {
    if (columnFlowEnabled) return; // Skip if in column-flow mode
    if (!measureRef.current) return;

    const distributed = splitContentToPages(measureRef.current, {
      marginTop: parseInt(cssVars['--margin-top']) || 20,
      marginBottom: 20, // 🚀 Forced 20px per user request
    });

    setPages(distributed);
  }, [renderData, template, category, cssVars, layoutColumns, customTitles, pageBreaks, columnFlowEnabled]);

  // ── Column-flow Pagination measurement ───────────────────────────
  const runColumnPagination = useCallback(() => {
    if (!columnFlowEnabled) return;
    if (!columnMeasureRef.current) return;

    const distributed = splitContentToColumnarPages(columnMeasureRef.current);
    setColumnPages(distributed);
  }, [renderData, template, category, cssVars, layoutColumns, customTitles, pageBreaks, columnFlowEnabled]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (columnFlowEnabled) {
        runColumnPagination();
      } else {
        runPagination();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [runPagination, runColumnPagination, columnFlowEnabled]);

  const hasSidebarColumns = layoutColumns?.columnSide?.length > 0;
  
  let fullBleedSidebar = null;
  if (!columnFlowEnabled) {
    if (template === 'modern_sidebar') {
      fullBleedSidebar = {
        width: `calc(32% + 0.36 * var(--margin-sides, 15px))`, 
        colorStart: '#1e293b', colorEnd: '#1e293b',
        position: 'left'
      };
    } else if (template === 'modern_split') {
      fullBleedSidebar = {
        width: `calc(60% - 0.2 * var(--margin-sides, 15px))`,
        colorStart: '#f8fafc', colorEnd: '#f8fafc',
        position: 'right'
      };
    } else if (template === 'professional' && hasSidebarColumns) {
      fullBleedSidebar = {
        width: `calc(35% + 0.3 * var(--margin-sides, 15px))`,
        colorStart: '#1e293b', colorEnd: '#1e293b',
        position: language === 'ar' ? 'right' : 'left'
      };
    } else if (template === 'slate') {
      fullBleedSidebar = {
        width: `calc(32% + 0.36 * var(--margin-sides, 15px))`,
        colorStart: '#1E293B', colorEnd: '#1E293B',
        position: language === 'ar' ? 'right' : 'left'
      };
    } else if (template === 'modern_wave') {
      fullBleedSidebar = {
        width: language === 'ar' ? `calc(32% + var(--margin-sides, 15px))` : `calc(32% + var(--margin-sides, 15px))`, 
        colorStart: '#f8fafc', 
        colorEnd: '#f8fafc',
        position: 'right'
      };
    }
  }

  // Get section order for column-flow rendering
  const order = CATEGORY_SECTION_ORDER[category] || CATEGORY_SECTION_ORDER[CATEGORIES.CHRONOLOGICAL];
  
  // Find all populated sections (including custom)
  const standardKeys = [
    'personalInfo', 'summary', 'experience', 'education', 'skills', 
    'projects', 'languages', 'certificates', 'awards', 'volunteering', 'references'
  ];
  const customSectionKeys = Object.keys(renderData).filter(key => 
    !standardKeys.includes(key) && Array.isArray(renderData[key])
  );
  const allSections = [...order, ...customSectionKeys].filter(key => {
    const val = renderData[key];
    if (!val) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    return true;
  });

  // Heading style for column-flow mode
  const columnHeadingStyle = {
    color: accentColor,
    borderBottom: `2px solid ${accentColor}`,
    paddingBottom: '6px',
    marginBottom: '10px',
  };

  // ── COLUMN-FLOW MODE ──────────────────────────────────────────
  if (columnFlowEnabled) {
    return (
      <DraggableResumeCanvas>
        <div className="print-container">
          {/* Hidden measuring container for column-flow — renders all sections flat */}
          <div
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            style={{
              position: 'absolute',
              left: '-9999px',
              top: 0,
              width: '794px',
              visibility: 'hidden',
              ...cssVars,
            }}
          >
            <div ref={columnMeasureRef} className="a4-page-content">
              {/* Header section (full-width) */}
              <div data-section-key="header" style={{ marginBottom: '16px' }}>
                <h1 className="resume-name" style={{ color: accentColor, fontSize: 'var(--name-font-size)' }}>
                  {renderData?.personalInfo?.fullName || ''}
                </h1>
                {renderData?.personalInfo?.jobTitle && (
                  <div style={{ fontSize: '12pt', color: '#6B7280', marginTop: '4px' }}>
                    {renderData.personalInfo.jobTitle}
                  </div>
                )}
              </div>
              {/* All body sections rendered flat for measurement */}
              {allSections.map((key) => (
                <div key={key} data-section-key={key} style={{ marginBottom: '16px' }}>
                  {renderSection(key, renderData, { 
                    headingStyle: columnHeadingStyle, 
                    accentColor, 
                    language 
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Visible column-flow pages */}
          {columnPages ? columnPages.map((page, index) => (
            <A4Page
              key={index}
              pageIndex={index}
              totalPages={columnPages.length}
              showPageNumber={true}
              showContinuationHeader={index > 0}
              personalInfo={renderData.personalInfo}
              cssVars={cssVars}
              fullBleedSidebar={null}
            >
              <div 
                dir={language === 'ar' ? 'rtl' : 'ltr'} 
                style={{ 
                  height: '100%', 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  fontFamily: 'var(--global-font)',
                }}
              >
                {/* Header (full-width, only on first page) */}
                {index === 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h1 className="resume-name" style={{ 
                      color: accentColor, 
                      fontSize: 'var(--name-font-size)',
                      textAlign: language === 'ar' ? 'right' : 'left',
                    }}>
                      {renderData?.personalInfo?.fullName || ''}
                    </h1>
                    {renderData?.personalInfo?.jobTitle && (
                      <div style={{ 
                        fontSize: '12pt', 
                        color: '#6B7280', 
                        marginTop: '4px',
                      }}>
                        {renderData.personalInfo.jobTitle}
                      </div>
                    )}
                    {/* Contact info inline */}
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '12px', 
                      fontSize: '9pt', 
                      color: '#4B5563', 
                      marginTop: '10px',
                      borderBottom: `2px solid ${accentColor}`,
                      paddingBottom: '12px',
                    }}>
                      {renderData?.personalInfo?.email && <span>{renderData.personalInfo.email}</span>}
                      {renderData?.personalInfo?.phone && <span>{renderData.personalInfo.phone}</span>}
                      {renderData?.personalInfo?.location && <span>{renderData.personalInfo.location}</span>}
                      {renderData?.personalInfo?.website && <span>{renderData.personalInfo.website}</span>}
                      {renderData?.personalInfo?.linkedin && <span>{renderData.personalInfo.linkedin}</span>}
                      {renderData?.personalInfo?.github && <span>{renderData.personalInfo.github}</span>}
                    </div>
                  </div>
                )}

                {/* Column-flow body */}
                <div className="column-flow-body" style={{
                  columnCount: 2,
                  columnGap: '28px',
                  columnRule: '1px solid #E5E7EB',
                  flex: 1,
                  columnFill: 'auto',
                  height: '100%',
                }}>
                  {page.sections.map((key) => (
                    <div 
                      key={key} 
                      data-section-key={key}
                      style={{ 
                        marginBottom: 'var(--section-gap, 16px)',
                        breakInside: 'avoid',
                        pageBreakInside: 'avoid',
                      }}
                    >
                      {renderSection(key, renderData, { 
                        headingStyle: columnHeadingStyle, 
                        accentColor, 
                        language,
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </A4Page>
          )) : (
            <A4Page
              pageIndex={0}
              totalPages={1}
              showPageNumber={false}
              showContinuationHeader={false}
              personalInfo={renderData.personalInfo}
              cssVars={cssVars}
              fullBleedSidebar={null}
            >
              <div dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ height: '100%', opacity: 0.5 }}>Calculating layout...</div>
            </A4Page>
          )}
        </div>
      </DraggableResumeCanvas>
    );
  }

  // ── SECTION-BASED MODE (DEFAULT) ──────────────────────────────
  return (
    <DraggableResumeCanvas>
      <div className="print-container">
        {/* Hidden measuring container — renders full content off-screen */}
        <div
          dir={language === 'ar' ? 'rtl' : 'ltr'}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: '794px', // A4 width at 96 DPI
            visibility: 'hidden',
            ...cssVars,
          }}
        >
          <div ref={measureRef} className="a4-page-content">
            <ResumeRenderer
              templateId={template}
              data={renderData}
              category={category}
              accentColor={accentColor}
              cssVars={cssVars}
              visibleSections={null} 
              isFirstPage={true}
              language={language}
              pageId="measure"
            />
          </div>
        </div>

        {/* Visible pages */}
        {pages ? pages.map((pageSections, index) => (
          <A4Page
            key={index}
            pageIndex={index}
            totalPages={pages.length}
            showPageNumber={true}
            showContinuationHeader={index > 0}
            personalInfo={renderData.personalInfo}
            cssVars={cssVars}
            fullBleedSidebar={fullBleedSidebar}
          >
            <div dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ height: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <ResumeRenderer
                templateId={template}
                data={renderData}
                category={category}
                accentColor={accentColor}
                cssVars={cssVars}
                visibleSections={pageSections} 
                isFirstPage={index === 0}
                language={language}
                pageId={`page-${index}`}
              />
            </div>
          </A4Page>
        )) : (
          <A4Page
            pageIndex={0}
            totalPages={1}
            showPageNumber={false}
            showContinuationHeader={false}
            personalInfo={renderData.personalInfo}
            cssVars={cssVars}
            fullBleedSidebar={fullBleedSidebar}
          >
            <div dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ height: '100%', opacity: 0.5 }}>Calculating layout...</div>
          </A4Page>
        )}
      </div>
    </DraggableResumeCanvas>
  );
}
