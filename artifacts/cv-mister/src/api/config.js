const BACKEND_URL = import.meta.env.DEV
  ? ''
  : 'https://cv-mister-backend-coly.onrender.com';

export const API_BASE_URL = BACKEND_URL;

export const API_ROUTES = {
  AUTH: `${BACKEND_URL}/api/auth`,
  RESUMES: `${BACKEND_URL}/api/resumes`,
  COVER_LETTERS: `${BACKEND_URL}/api/cover-letters`,
  ADMIN: `${BACKEND_URL}/api/admin`,
  UPGRADE: `${BACKEND_URL}/api/upgrade`,
  PAYMENTS: `${BACKEND_URL}/api/payments`,
  CONTACT: `${BACKEND_URL}/api/contact`,
  CONTENT: `${BACKEND_URL}/api/content`,
  GENERATE_PDF: `${BACKEND_URL}/api/generate-pdf`,
};
