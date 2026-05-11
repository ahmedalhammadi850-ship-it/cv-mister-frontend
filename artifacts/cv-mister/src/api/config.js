const BACKEND_URL = 'https://cv-mister-backend-coly.onrender.com';

export const API_BASE_URL = BACKEND_URL;

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
