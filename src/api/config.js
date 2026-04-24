// ============================================================
// CV-Mister — API Configuration
// Centralized API URL management
// ============================================================

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cv-mister-backend-production.up.railway.app';

export const API_ROUTES = {
  AUTH: `${API_BASE_URL}/api/auth`,
  RESUMES: `${API_BASE_URL}/api/resumes`,
  COVER_LETTERS: `${API_BASE_URL}/api/cover-letters`,
  ADMIN: `${API_BASE_URL}/api/admin`,
  UPGRADE: `${API_BASE_URL}/api/upgrade`,
  PAYMENTS: `${API_BASE_URL}/api/payments`,
  CONTACT: `${API_BASE_URL}/api/contact`,
  CONTENT: `${API_BASE_URL}/api/content`,
  GENERATE_PDF: `${API_BASE_URL}/api/generate-pdf`,
};
