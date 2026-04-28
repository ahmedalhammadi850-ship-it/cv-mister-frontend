// ============================================================
// CV-Mister — Constants & Design Tokens
// ============================================================

// ── 21 Template Styles ──────────────────────────────────────
export const TEMPLATES = {
  SIMPLE: 'simple',
  PROFESSIONAL: 'professional',
  ELEGANT: 'elegant',
  CREATIVE: 'creative',
  CLASSIC: 'classic',
  MINIMALIST: 'minimalist',
  TECH: 'tech',
  EXECUTIVE: 'executive',
  ACADEMIC: 'academic',
  MODERN_SIDEBAR: 'modern_sidebar',
  REFINED: 'refined',
  SLATE: 'slate',
  BORDER_GRID: 'border_grid',
  GRADIENT_TOP: 'gradient_top',
  COMPACT: 'compact',
  CLASSIC_CORPORATE: 'classic_corporate',
  MODERN_SPLIT: 'modern_split',
  EXECUTIVE_LINE: 'executive_line',
  LEGACY_CLEAN: 'legacy_clean',
  MINIMAL_BOLD: 'minimal_bold',
  SUBTLE_BAR: 'subtle_bar',
  SKY_SPLIT: 'sky_split',
  OCEAN_BLUE: 'ocean_blue',
  ATS: 'ats',
  MODERN_WAVE: 'modern_wave',
  ELITE_CLEAN: 'elite_clean',
};

export const TEMPLATE_LIST = [
  // ═══════════════════════════════════════════════════════════
  // 🛡️ ATS VERIFIED — Based on REAL code structure analysis
  // Criteria: Single Column | No Sidebar | No Photos | No Visual Effects
  // ═══════════════════════════════════════════════════════════
  { id: TEMPLATES.ATS,               label: 'tpl_ats',                icon: '🤖', color: '#111827', type: 'ats', isPremium: true },
  { id: TEMPLATES.SIMPLE,            label: 'tpl_simple',             icon: '📄', color: '#6B7280', type: 'ats' },
  { id: TEMPLATES.PROFESSIONAL,      label: 'tpl_professional',       icon: '💼', color: '#1E3A5F', type: 'ats', isPremium: true },
  { id: TEMPLATES.CLASSIC,           label: 'tpl_classic',            icon: '📜', color: '#4A2C2A', type: 'ats', isPremium: true },
  { id: TEMPLATES.MINIMALIST,        label: 'tpl_minimalist',         icon: '⬜', color: '#9CA3AF', type: 'ats', isPremium: true },
  { id: TEMPLATES.EXECUTIVE,         label: 'tpl_executive',          icon: '🏛️', color: '#1F2937', type: 'ats', isPremium: true },
  { id: TEMPLATES.ACADEMIC,          label: 'tpl_academic',           icon: '🎓', color: '#7C3AED', type: 'ats', isPremium: true },
  { id: TEMPLATES.COMPACT,           label: 'tpl_compact',            icon: '📊', color: '#000000', type: 'ats', isPremium: true },
  { id: TEMPLATES.CLASSIC_CORPORATE, label: 'tpl_classic_corporate',  icon: '📎', color: '#1F2937', type: 'ats', isPremium: true },
  { id: TEMPLATES.EXECUTIVE_LINE,    label: 'tpl_executive_line',     icon: '➖', color: '#000000', type: 'ats', isPremium: true },
  { id: TEMPLATES.REFINED,           label: 'tpl_refined',            icon: '✒️', color: '#334155', type: 'ats', isPremium: true },
  { id: TEMPLATES.TECH,              label: 'tpl_tech',               icon: '💻', color: '#00D4AA', type: 'ats', isPremium: true },
  { id: TEMPLATES.SUBTLE_BAR,        label: 'tpl_subtle_bar',         icon: '🧾', color: '#666',    type: 'ats', isPremium: true },
  { id: TEMPLATES.BORDER_GRID,       label: 'tpl_border_grid',        icon: '◻️', color: '#1E293B', type: 'ats', isPremium: true },

  // ═══════════════════════════════════════════════════════════
  // ✨ MODERN / SHARE — Not ATS-safe, designed for visual impact
  // Reason: Sidebar | Multi-column | Photos | Gradient Headers
  // ═══════════════════════════════════════════════════════════
  { id: TEMPLATES.MODERN_SIDEBAR,    label: 'tpl_modern_sidebar',     icon: '🔷', color: '#3B82F6', type: 'modern', isPremium: true },  
  { id: TEMPLATES.MODERN_SPLIT,      label: 'tpl_modern_split',       icon: '🌗', color: '#0F172A', type: 'modern', isPremium: true },  
  { id: TEMPLATES.SLATE,             label: 'tpl_slate',              icon: '🪨', color: '#334155', type: 'modern', isPremium: true },  
  { id: TEMPLATES.MINIMAL_BOLD,      label: 'tpl_minimal_bold',       icon: '🔳', color: '#333',    type: 'modern', isPremium: true },  
  { id: TEMPLATES.LEGACY_CLEAN,      label: 'tpl_legacy_clean',       icon: '📄', color: '#111',    type: 'modern', isPremium: true },  
  { id: TEMPLATES.OCEAN_BLUE,        label: 'tpl_ocean_blue',         icon: '🌊', color: '#1d4ed8', type: 'modern', isPremium: true },  
  { id: TEMPLATES.CREATIVE,          label: 'tpl_creative',           icon: '🎨', color: '#E74C8B', type: 'modern', isPremium: true },  
  { id: TEMPLATES.ELEGANT,           label: 'tpl_elegant',            icon: '✨', color: '#C9A84C', type: 'modern', isPremium: true },  
  { id: TEMPLATES.GRADIENT_TOP,      label: 'tpl_gradient_top',       icon: '🌅', color: '#6366F1', type: 'modern', isPremium: true },  
  { id: TEMPLATES.SKY_SPLIT,         label: 'tpl_sky_split',          icon: '🌌', color: '#94a3b8', type: 'modern', isPremium: true },  
  { id: TEMPLATES.MODERN_WAVE,       label: 'tpl_modern_wave',        icon: '🌊', color: '#1e3a8a', type: 'modern', isPremium: true },
  { id: TEMPLATES.ELITE_CLEAN,       label: 'tpl_elite_clean',        icon: '💎', color: '#0f172a', type: 'modern', isPremium: true },
];

// ── 6 Layout Categories ─────────────────────────────────────
export const CATEGORIES = {
  CHRONOLOGICAL: 'chronological',
  FUNCTIONAL: 'functional',
  COMBINATION: 'combination',
  EXECUTIVE: 'executive',
  ACADEMIC: 'academic',
  ENTRY_LEVEL: 'entry_level',
};

export const CATEGORY_LIST = [
  { id: CATEGORIES.CHRONOLOGICAL, label: 'Chronological', desc: 'Standard timeline order' },
  { id: CATEGORIES.FUNCTIONAL,    label: 'Functional',    desc: 'Skills-focused layout' },
  { id: CATEGORIES.COMBINATION,   label: 'Combination',   desc: 'Skills + experience blend' },
  { id: CATEGORIES.EXECUTIVE,     label: 'Executive',     desc: 'Leadership-first format' },
  { id: CATEGORIES.ACADEMIC,      label: 'Academic',      desc: 'Education & research first' },
  { id: CATEGORIES.ENTRY_LEVEL,   label: 'Entry-Level',   desc: 'Education & skills emphasis' },
];

// ── Section Rendering Order per Category ─────────────────────
export const CATEGORY_SECTION_ORDER = {
  [CATEGORIES.CHRONOLOGICAL]: [
    'personal_info', 'summary', 'experience', 'education', 'skills', 'projects',
    'languages', 'certificates', 'awards', 'volunteering', 'references', 'custom',
  ],
  [CATEGORIES.FUNCTIONAL]: [
    'personal_info', 'summary', 'skills', 'projects', 'experience', 'education',
    'languages', 'certificates', 'awards', 'volunteering', 'references', 'custom',
  ],
  [CATEGORIES.COMBINATION]: [
    'personal_info', 'summary', 'skills', 'experience', 'education', 'projects',
    'languages', 'certificates', 'awards', 'volunteering', 'references', 'custom',
  ],
  [CATEGORIES.EXECUTIVE]: [
    'personal_info', 'summary', 'experience', 'education', 'skills', 'awards',
    'projects', 'languages', 'certificates', 'volunteering', 'references', 'custom',
  ],
  [CATEGORIES.ACADEMIC]: [
    'personal_info', 'summary', 'education', 'experience', 'projects', 'certificates',
    'awards', 'skills', 'languages', 'volunteering', 'references', 'custom',
  ],
  [CATEGORIES.ENTRY_LEVEL]: [
    'personal_info', 'summary', 'education', 'skills', 'projects', 'experience',
    'languages', 'certificates', 'awards', 'volunteering', 'references', 'custom',
  ],
};

// ── Design Tokens (8px Grid System) ─────────────────────────
export const DESIGN_TOKENS = {
  // Typography (strict)
  nameFontSize: '22pt',
  headingFontSize: '14pt',
  bodyFontSize: '10.5pt',
  lineHeightGlobal: 1.5,

  // 8px Grid
  gridUnit: 8,
  spacingXs: 8,
  spacingSm: 16,
  spacingMd: 24,
  spacingLg: 32,
  spacingXl: 40,
  spacing2xl: 48,

  // Border Radius
  radiusProfessional: '4px',
  radiusCircular: '9999px',
};

// ── A4 Page Dimensions ──────────────────────────────────────
export const A4 = {
  WIDTH_MM: 210,
  HEIGHT_MM: 297,
  WIDTH_PX: 794,   // at 96 DPI
  HEIGHT_PX: 1123,  // at 96 DPI
  SAFE_ZONE_MM: 20,
  SAFE_ZONE_PX: 75.6, // 20mm at 96 DPI
  MARGIN_SIDES_PX: 56.7, // 15mm
};

// ── Section Keys ────────────────────────────────────────────
export const SECTION_KEYS = [
  'summary', 'experience', 'education', 'skills', 'projects',
  'languages', 'certificates', 'awards', 'volunteering', 'references', 'custom',
];
