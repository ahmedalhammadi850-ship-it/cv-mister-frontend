// ============================================================
// CV-Mister — Style Store (Zustand)
// Controls template, category, colors, font sizes, spacing
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TEMPLATES, CATEGORIES } from '../utils/constants';

const useStyleStore = create(
  persist(
    (set, get) => ({
      // ── Template & Category ────────────────────────
      template: TEMPLATES.SIMPLE,
      category: CATEGORIES.CHRONOLOGICAL,

      // ── Colors ─────────────────────────────────────
      accentColor: '#1E3A5F',

      // ── Typography (pt values for print fidelity) ──
      nameFontSize: 22,
      headingFontSize: 15,
      bodyFontSize: 13,
      lineHeight: 1.5,
      headerAlign: 'left',

      // ── Spacing (mm for print margins) ─────────────
      marginTop: 7,
      marginBottom: 20,
      marginSides: 6,
      sectionGap: 16,
      headerFontSize: 14,

      // ── Column Flow Layout ─────────────────────
      columnFlowEnabled: false, // true = newspaper-style 2-column flow

      // ── Language (Global Document Direction) ───────
      language: 'en', // 'en' | 'ar'

      // ── Actions ────────────────────────────────────
      setTemplate: (template) => set({ template }),
      setCategory: (category) => set({ category }),
      setLanguage: (language) => set({ language }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setNameFontSize: (nameFontSize) => set({ nameFontSize }),
      setHeadingFontSize: (headingFontSize) => set({ headingFontSize }),
      setBodyFontSize: (bodyFontSize) => set({ bodyFontSize }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setHeaderAlign: (headerAlign) => set({ headerAlign }),
      setMarginTop: (marginTop) => set({ marginTop }),
      setMarginBottom: (marginBottom) => set({ marginBottom }),
      setMarginSides: (marginSides) => set({ marginSides }),
      setSectionGap: (sectionGap) => set({ sectionGap }),
      setColumnFlowEnabled: (columnFlowEnabled) => set({ columnFlowEnabled }),

      // ── CSS Variable Generation ────────────────────
      getCssVars: () => {
        const s = get();
        return {
          '--global-font': "'Roboto', 'Arial', sans-serif",
          '--accent-color': s.accentColor,
          '--name-font-size': `${s.nameFontSize}pt`,
          '--heading-font-size': `${s.headingFontSize}pt`,
          '--body-font-size': `${s.bodyFontSize}pt`,
          '--line-height': s.lineHeight,
          '--line-height-global': s.lineHeight,
          '--margin-top': `${s.marginTop}mm`,
          '--margin-bottom': `${s.marginBottom}mm`,
          '--margin-sides': `${s.marginSides}mm`,
          '--section-gap': `${s.sectionGap}px`,
        };
      },

      // ── Reset ──────────────────────────────────────
      resetStyles: () =>
        set({
          template: TEMPLATES.SIMPLE,
          category: CATEGORIES.CHRONOLOGICAL,
          language: 'en',
          accentColor: '#1E3A5F',
          nameFontSize: 22,
          headingFontSize: 15,
          bodyFontSize: 13,
          lineHeight: 1.5,
          headerAlign: 'left',
          marginTop: 7,
          marginBottom: 20,
          marginSides: 6,
          sectionGap: 16,
          columnFlowEnabled: false,
        }),
    }),
    {
      name: 'cv-mister-style',
    }
  )
);

export default useStyleStore;
