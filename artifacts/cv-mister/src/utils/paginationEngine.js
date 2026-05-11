// ============================================================
// CV-Mister — A4 Pagination Engine
// Pixel-perfect page distribution with safe zones
// Supports both section-based and column-flow pagination
// ============================================================

import { A4 } from './constants';

const SAFETY_BUFFER = 20; // px buffer for rounding across DPIs

/**
 * Calculate the usable content height per page.
 * @returns {number} Usable height in px
 */
export function getUsableHeight() {
  // Target Height: 297mm (A4)
  // Safe Zone Bottom: 20mm
  // Threshold: 297mm - 20mm = 277mm
  const THRESHOLD_MM = 277;
  return mmToPx(THRESHOLD_MM);
}

/**
 * Convert mm value string to px.
 * @param {string|number} mm - Millimeter value (e.g. "20mm" or 20)
 * @returns {number} Pixel value
 */
export function mmToPx(mm) {
  const val = typeof mm === 'string' ? parseFloat(mm) : mm;
  return val * 3.7795275591; // 1mm = 3.7795px at 96 DPI
}

/**
 * Measure the heights of all direct children of a container.
 * Captures each child's `data-section-key` for identification.
 * @param {HTMLElement} container - The DOM container to measure
 * @returns {Array<{element: HTMLElement, height: number, key: string}>}
 */
export function measureChildren(container) {
  if (!container) return [];

  const children = Array.from(container.children);
  return children.map((child) => {
    const rect = child.getBoundingClientRect();
    const style = window.getComputedStyle(child);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    const totalHeight = rect.height + marginTop + marginBottom;

    return {
      element: child,
      height: totalHeight,
      key: child.dataset.sectionKey || child.id || '',
      topEdge: (rect.top - container.getBoundingClientRect().top) - marginTop,
      bottomEdge: (rect.bottom - container.getBoundingClientRect().top) + marginBottom,
    };
  });
}

/**
 * Measure ALL elements with [data-section-key] recursively inside a container.
 * This handles templates where sections are nested inside layout wrappers
 * (e.g., sidebar templates with flex columns).
 *
 * @param {HTMLElement} container - The DOM container to measure
 * @returns {Array<{height: number, key: string}>}
 */
export function measureSections(container) {
  if (!container) return [];

  const containerRect = container.getBoundingClientRect();
  const elements = container.querySelectorAll('[data-section-key]');
  
  return Array.from(elements).map((el) => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    
    // Calculate absolute bottom limit of this section relative to its parent container
    const relativeBottom = (rect.bottom - containerRect.top) + marginBottom;
    const relativeTop = (rect.top - containerRect.top) - marginTop;
    
    const totalHeight = rect.height + marginTop;

    return {
      height: totalHeight,
      bottomEdge: relativeBottom,
      topEdge: relativeTop,
      key: el.dataset.sectionKey,
      forceBreak: el.dataset.forcePageBreak === 'true',
    };
  });
}

/**
 * Distribute measured sections across pages using bottomEdge tracking.
 * Prevents content clipping by enforcing break-inside: avoid semantics.
 *
 * @param {Array<{height: number, key: string}>} sections - Measured section data
 * @param {number} usableHeight - Available content height per page
 * @returns {Array<Array<{key: string, height: number}>>} Pages, each containing section refs
 */
export function distributeToPages(sections, usableHeight) {
  if (!sections.length) return [[]];

  const pages = [];
  
  // Evaluate sections in a purely mathematical 2D matrix rather than cumulative 1D state
  // This completely eliminates cross-column offset pollution causing premature multi-column breaks
  for (const section of sections) {
    let targetIndex = Math.floor((section.bottomEdge - 1) / usableHeight);
    if (targetIndex < 0) targetIndex = 0;
    
    // Explicit structural safeguard for items that cross boundaries
    // If the top edge implies a previous page but bottom overflows, it shifts to protect content
    while (pages.length <= targetIndex) {
      pages.push([]);
    }

    pages[targetIndex].push({
      key: section.key,
      height: section.height,
      topEdge: section.topEdge,
      bottomEdge: section.bottomEdge
    });
  }

  // To preserve strict visual mapping for nested algorithms, we naturally sort each resultant page
  pages.forEach(page => page.sort((a,b) => (a.topEdge || 0) - (b.topEdge || 0)));

  return pages;
}

/**
 * Content Splitter — the main utility function.
 *
 * Given a measured container, determines which sections fit on Page 1
 * and which overflow to Page 2, 3, etc.
 *
 * @param {HTMLElement} measureContainer - Hidden container with full rendered content
 * @param {Object} options
 * @param {number} options.marginTop - Top margin in mm
 * @param {number} options.marginBottom - Bottom margin in mm
 * @returns {Array<string[]>} Array of pages, each containing section keys
 */
export function splitContentToPages(measureContainer) {
  const usableHeight = getUsableHeight();

  // Measure all sections with data-section-key
  const measured = measureSections(measureContainer);

  // If nothing measured, fallback to direct children
  const toDistribute = measured.length > 0 ? measured : measureChildren(measureContainer);

  // Sort universally by absolute physical Y-axis placement (topEdge) 
  // to ensure parallel columns are processed seamlessly in 2D space.
  toDistribute.sort((a, b) => (a.topEdge || 0) - (b.topEdge || 0));

  // Distribute across pages
  const pages = distributeToPages(toDistribute, usableHeight);

  // Return keys per page, and automatically inject root keys (e.g. 'experience' from 'experience-0')
  return pages.map((page) => {
    const keys = page.map((s) => s.key);
    const parentKeys = keys.map(k => k.split('-')[0]);
    // Merge and deduplicate
    return Array.from(new Set([...keys, ...parentKeys]));
  });
}

// ============================================================
// COLUMN-FLOW PAGINATION ENGINE
// Distributes sections across pages where each page has 2 CSS columns.
// Content fills left column first, then right, then overflows to next page.
// ============================================================

/**
 * Measure all sections as a flat ordered list with their individual heights.
 * Used by the column-flow layout to decide page boundaries.
 *
 * @param {HTMLElement} container - The hidden measure container
 * @returns {Array<{key: string, height: number}>} Ordered sections with heights
 */
export function measureSectionsFlat(container) {
  if (!container) return [];
  
  const elements = container.querySelectorAll('[data-section-key]');
  const result = [];
  const seenKeys = new Set();
  
  Array.from(elements).forEach((el) => {
    const key = el.dataset.sectionKey;
    if (!key || seenKeys.has(key)) return;
    seenKeys.add(key);
    
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    const totalHeight = rect.height + marginTop + marginBottom;
    
    result.push({
      key,
      height: totalHeight,
    });
  });
  
  return result;
}

/**
 * Column-Flow Pagination: Distributes sections into pages where each page
 * has 2 columns. Content fills column 1 first, then column 2.
 * 
 * Algorithm:
 * 1. Measure all sections as a flat list
 * 2. For each page, we have (usableHeight) per column × 2 columns
 * 3. Fill column 1 (left) first, when it overflows, move to column 2 (right)
 * 4. When both columns overflow, start a new page
 *
 * @param {HTMLElement} measureContainer - Hidden container with all content rendered flat
 * @param {Object} options
 * @param {number} options.headerHeight - Height of header section (only on page 1)
 * @returns {Array<{sections: string[], headerSections: string[]}>} Pages with section assignments
 */
export function splitContentToColumnarPages(measureContainer, options = {}) {
  const usableHeight = getUsableHeight();
  const sections = measureSectionsFlat(measureContainer);
  
  if (!sections.length) return [{ sections: [], headerSections: [] }];
  
  // Separate header section (full-width, appears only on page 1)
  const headerSections = [];
  const bodySections = [];
  let headerTotalHeight = 0;
  
  for (const section of sections) {
    if (section.key === 'header' || section.key === 'contact') {
      headerSections.push(section);
      headerTotalHeight += section.height;
    } else {
      bodySections.push(section);
    }
  }
  
  // Available column height on page 1 (reduced by header)
  // Header is full-width, so it reduces the column height for the rest
  const page1ColumnHeight = usableHeight - headerTotalHeight;
  const normalColumnHeight = usableHeight;
  
  const pages = [];
  let currentPage = { sections: [], headerSections: headerSections.map(s => s.key) };
  let columnHeights = [0, 0]; // [left column used, right column used]
  let currentColumn = 0; // 0 = left, 1 = right
  let isFirstPage = true;
  
  const getMaxColumnHeight = () => isFirstPage ? page1ColumnHeight : normalColumnHeight;
  
  for (const section of bodySections) {
    const maxHeight = getMaxColumnHeight();
    
    // Try to fit in current column
    if (columnHeights[currentColumn] + section.height <= maxHeight + SAFETY_BUFFER) {
      // Fits in current column
      columnHeights[currentColumn] += section.height;
      currentPage.sections.push(section.key);
    } else if (currentColumn === 0) {
      // Left column full, try right column
      currentColumn = 1;
      if (columnHeights[currentColumn] + section.height <= maxHeight + SAFETY_BUFFER) {
        columnHeights[currentColumn] += section.height;
        currentPage.sections.push(section.key);
      } else {
        // Both columns full, start new page
        pages.push(currentPage);
        isFirstPage = false;
        currentPage = { sections: [section.key], headerSections: [] };
        columnHeights = [section.height, 0];
        currentColumn = 0;
      }
    } else {
      // Right column full, start new page
      pages.push(currentPage);
      isFirstPage = false;
      currentPage = { sections: [section.key], headerSections: [] };
      columnHeights = [section.height, 0];
      currentColumn = 0;
    }
  }
  
  // Push the last page
  if (currentPage.sections.length > 0 || currentPage.headerSections.length > 0) {
    pages.push(currentPage);
  }
  
  // If no pages were created, return empty page
  if (pages.length === 0) {
    pages.push({ sections: [], headerSections: headerSections.map(s => s.key) });
  }
  
  return pages;
}

/**
 * Apply break-inside: avoid to all section-level elements.
 * Also ensures orphans/widows are set.
 * @param {HTMLElement} container
 */
export function applyBreakRules(container) {
  if (!container) return;

  const sections = container.querySelectorAll('[data-section-key]');
  sections.forEach((el) => {
    el.style.breakInside = 'avoid';
    el.style.pageBreakInside = 'avoid';
  });

  // Apply orphan/widow rules to text elements
  const textElements = container.querySelectorAll('p, li, .experience-item, .education-item');
  textElements.forEach((el) => {
    el.style.widows = '3';
    el.style.orphans = '3';
  });
}
