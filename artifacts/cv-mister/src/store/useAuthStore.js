// ============================================================
// CV-Mister — Auth Store (Zustand)
// Architecture:
//   LOGIN:    Backend MongoDB only → JWT token
//             If backend 500 + "Illegal arguments" → legacy account (no password) → show reset prompt
//             If backend 502/503 → retry up to 6 times (cold start)
//             Firebase fallback REMOVED (identitytoolkit blocked in browser)
//   REGISTER: Backend MongoDB → Firebase email verification only
//   WAKEUP:   Single silent ping on app load (fire & forget, no retry loop)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { API_ROUTES } from '../api/config';

// Silent axios instance — never throws on any HTTP status
// Prevents browser console errors from ping requests
const silentAxios = axios.create();
silentAxios.defaults.validateStatus = () => true;

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      // ── WAKE UP BACKEND (fire & forget) ──────────────────────
      // One silent ping on app load to pre-warm Render's free tier.
      // No retry loop — login handles cold start with its own retries.
      // Uses silent axios so NO 502 errors flood the browser console.
      wakeUpBackend: () => {
        // Fire and forget — don't await, don't retry, don't log errors
        silentAxios
          .get(`${API_ROUTES.AUTH}/ping`, { timeout: 30000 })
          .then((res) => {
            // Any response (even 404) means server is alive
            if (res.status !== 502 && res.status !== 503) {
              console.log('[AuthStore] ✅ Backend is awake (status:', res.status, ')');
            }
          })
          .catch(() => {
            // Network-level error (ECONNRESET etc.) — ignore silently
          });
      },

      // ── LOGIN ─────────────────────────────────────────────────
      login: async (email, password) => {
        set({ loading: true, error: null });

        // Retry POST /login up to 6 times on 502/503 (cold start)
        // 6 × 5s = 30 seconds max wait — enough for Render cold start
        const attemptLogin = async () => {
          const MAX = 6;
          const DELAY = 5000;
          let lastErr = null;

          for (let attempt = 1; attempt <= MAX; attempt++) {
            try {
              return await axios.post(
                `${API_ROUTES.AUTH}/login`,
                { email, password },
                { timeout: 12000 }
              );
            } catch (err) {
              const status = err.response?.status;
              const msg = (err.response?.data?.error || '').toLowerCase();

              // Wrong credentials → fail immediately, no retry
              if (
                status === 401 ||
                status === 400 ||
                msg.includes('invalid') ||
                msg.includes('incorrect') ||
                msg.includes('not found')
              ) {
                throw err;
              }

              // Legacy account: no password hash in MongoDB
              // bcrypt.compare(pass, undefined) → "Illegal arguments: string, undefined"
              if (status === 500 && msg.includes('illegal arguments')) {
                throw err; // handled below
              }

              // 502/503 = Render cold start → wait and retry
              if (status === 502 || status === 503 || !err.response) {
                lastErr = err;
                if (attempt < MAX) {
                  await new Promise((r) => setTimeout(r, DELAY));
                  continue;
                }
              }
              throw err;
            }
          }
          throw lastErr;
        };

        try {
          const res = await attemptLogin();
          const { token, ...userData } = res.data;

          set({ user: { ...userData, emailVerified: true }, token, loading: false });
          return { success: true };

        } catch (err) {
          const status = err.response?.status;
          const msg = (err.response?.data?.error || '').toLowerCase();

          // Wrong credentials
          if (
            status === 401 ||
            status === 400 ||
            msg.includes('invalid') ||
            msg.includes('incorrect') ||
            msg.includes('not found')
          ) {
            set({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة', loading: false });
            return { success: false };
          }

          // Legacy account — no password hash stored in DB
          if (status === 500 && msg.includes('illegal arguments')) {
            set({ error: 'NO_PASSWORD_HASH', loading: false });
            return { success: false, noPasswordHash: true };
          }

          // Backend completely unreachable after all retries
          set({
            error: 'تعذّر الاتصال بالخادم. الخادم قد يكون في وضع السكون، انتظر دقيقة وأعد المحاولة.',
            loading: false,
          });
          return { success: false };
        }
      },

      // ── REGISTER ──────────────────────────────────────────────
      // Step 1: Backend MongoDB → create account (stores password hash)
      // Step 2: Firebase → send verification email only
      register: async (fullName, email, password) => {
        set({ loading: true, error: null });

        try {
          await axios.post(`${API_ROUTES.AUTH}/register`, { fullName, email, password });

          // Firebase — only for sending verification email
          try {
            const { auth } = await import('../config/firebase');
            const {
              createUserWithEmailAndPassword,
              sendEmailVerification,
              updateProfile,
            } = await import('firebase/auth');

            const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(fbUser, { displayName: fullName });
            await sendEmailVerification(fbUser);
            console.log('[AuthStore] ✅ Verification email sent');
          } catch (fbErr) {
            console.warn('[AuthStore] Firebase verification skipped:', fbErr.message);
          }

          set({ loading: false, error: null });
          return true;

        } catch (err) {
          const raw = err.response?.data?.error || err.message || '';
          let msg = raw;
          if (raw.toLowerCase().includes('already') || err.code === 'auth/email-already-in-use') {
            msg = 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.';
          } else if (err.code === 'auth/weak-password') {
            msg = 'كلمة المرور ضعيفة. يجب أن تكون 8 أحرف على الأقل.';
          }
          set({ error: msg, loading: false });
          return false;
        }
      },

      logout: () => set({ user: null, token: null }),

      updateProfile: async (data) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.put(`${API_ROUTES.AUTH}/profile`, data, {
            headers: { Authorization: `Bearer ${get().token}` },
          });
          set({ user: res.data, loading: false });
          return true;
        } catch (err) {
          set({ error: err.response?.data?.error || 'Update failed', loading: false });
          return false;
        }
      },

      syncLocalUser: (data) => {
        if (!data) return;
        set((state) => ({ user: state.user ? { ...state.user, ...data } : null }));
      },

      getAuthHeader: () => {
        const { token } = get();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    { name: 'cv-mister-auth' }
  )
);

export default useAuthStore;
