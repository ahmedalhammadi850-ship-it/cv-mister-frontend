// ============================================================
// CV-Mister — A4Page
// Single A4 page with safe zones and optional header/footer
// ============================================================

import React from 'react';

export default function A4Page({
  children,
  pageIndex = 0,
  totalPages = 1,
  showPageNumber = true,
  showContinuationHeader = false,
  personalInfo = {},
  cssVars = {},
  fullBleedSidebar = null, // { width: string, background: string, position: 'right'|'left' }
}) {
  const isFirstPage = pageIndex === 0;

  return (
    <div
      className="a4-page-outer page-break w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] mb-10 border-2 border-gray-300 shadow-lg bg-white overflow-hidden"
      style={{
        ...cssVars,
        position: 'relative',
        zIndex: 0,
        backgroundColor: '#ffffff',
        backgroundImage: fullBleedSidebar 
          ? `linear-gradient(${fullBleedSidebar.position === 'right' ? 'to left' : 'to right'}, ${fullBleedSidebar.colorStart} 0%, ${fullBleedSidebar.colorEnd} ${fullBleedSidebar.width}, transparent ${fullBleedSidebar.width})`
          : 'none'
      }}
    >
      {/* Absolute div removed in favor of raw hardware background image! */}

      {/* Page content */}
      <div
        className="a4-page-content"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </div>

      {/* Page footer (Disabled per user request) */}
      {/* 
      {showPageNumber && totalPages > 1 && (
        <div className="page-footer">
          Page {pageIndex + 1} of {totalPages}
        </div>
      )}
      */}
    </div>
  );
}
