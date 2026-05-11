# CV-Mister

A professional resume builder SaaS with AI assistance, bilingual (Arabic + English) support, and pixel-perfect A4 PDF export.

## Run & Operate

- `pnpm --filter @workspace/cv-mister run dev` — run the frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7 + Tailwind CSS v4
- State: Zustand
- Router: React Router DOM v7
- Auth: Firebase Auth + JWT (custom backend)
- Real-time: Socket.IO client
- Backend: External — https://cv-mister-backend-coly.onrender.com

## Where things live

- `artifacts/cv-mister/` — frontend app
- `artifacts/cv-mister/src/pages/` — page components (Landing, Dashboard, ResumeBuilder, etc.)
- `artifacts/cv-mister/src/components/` — shared UI components
- `artifacts/cv-mister/src/store/` — Zustand stores (auth, resume, style, theme, CMS)
- `artifacts/cv-mister/src/api/config.js` — centralized API URL config (points to production backend)
- `artifacts/cv-mister/src/config/firebase.js` — Firebase config for auth

## Architecture decisions

- App uses an external Express backend hosted on Render (`cv-mister-backend-coly.onrender.com`) — no local backend.
- Firebase handles Google OAuth; the backend issues JWT tokens for session management.
- All API URLs are centralized in `src/api/config.js`.
- CSS variables are used for theming (light/dark mode) — Tailwind classes used sparingly alongside custom CSS classes.
- RTL/LTR is controlled by the `language` Zustand store and applied via `dir` attribute on the root div.

## Product

- Landing page, About, Pricing, Contact
- Auth: Login, Register, Forgot/Reset Password (Firebase + JWT)
- Dashboard: user's saved resumes and cover letters
- Resume Builder: drag-and-drop, 10+ templates, bilingual support, A4 PDF export
- Cover Letter Builder
- Admin Dashboard (admin-only)

## User preferences

_Populate as you build._

## Gotchas

- The backend is external (Render). If it's cold-started, first requests may be slow.
- Socket.IO connects to the backend for real-time plan updates.
- Firebase config is hardcoded in `src/config/firebase.js` (public config, safe to commit).
- `@ts-ignore` is used on JSX file imports since the codebase uses `.jsx` not `.tsx`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
