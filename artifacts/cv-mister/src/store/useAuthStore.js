// ============================================================
// CV-Mister — Auth Store (Zustand)
// Architecture:
//   - Login: Backend MongoDB ONLY (no Firebase dependency)
//   - Legacy fallback: Firebase sync for accounts without password hash
//   - Firebase: ONLY used during registration to send verification email
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { API_ROUTES } from '../api/config';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      // ── WAKE UP BACKEND ───────────────────────────────────────
      // Call this on app load to pre-warm the Render server before login
      wakeUpBackend: async () => {
        try {
          await axios.get(`${API_ROUTES.AUTH}/ping`, { timeout: 30000 });
        } catch {
          // Ignore — just waking up the server
        }
      },

      // ── LOGIN ─────────────────────────────────────────────────
      // Primary: Backend MongoDB login → JWT (with auto-retry on 502)
      // Fallback: Firebase sync (for legacy accounts with no password in MongoDB)
      // Firebase is NOT used here — avoids identitytoolkit.googleapis.com dependency
      login: async (email, password) => {
        set({ loading: true, error: null });

        // Helper: attempt backend login with retry on 502/503 (cold start)
        const attemptBackendLogin = async () => {
          const MAX_RETRIES = 3;
          const RETRY_DELAY = 4000; // 4 seconds between retries
          let lastErr = null;

          for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
              return await axios.post(`${API_ROUTES.AUTH}/login`, { email, password }, { timeout: 20000 });
            } catch (err) {
              const status = err.response?.status;
              const msg = err.response?.data?.error || '';

              // Wrong credentials — don't retry
              if (status === 401 || status === 400 || msg.toLowerCase().includes('invalid')) {
                throw err;
              }

              // 502/503 (cold start) — retry after delay
              if (status === 502 || status === 503 || !status) {
                lastErr = err;
                if (attempt < MAX_RETRIES) {
                  await new Promise(r => setTimeout(r, RETRY_DELAY));
                  continue;
                }
              }
              throw err;
            }
          }
          throw lastErr;
        };

        try {
          // Primary: MongoDB backend login (with cold-start retry)
          const loginRes = await attemptBackendLogin();
          const { token, ...userData } = loginRes.data;

          set({
            user: { ...userData, emailVerified: true },
            token,
            loading: false,
          });
          return { success: true };

        } catch (backendErr) {
          const status = backendErr.response?.status;
          const msg = backendErr.response?.data?.error || '';

          // Wrong credentials — fail immediately, no fallback
          if (status === 401 || status === 400 || msg.toLowerCase().includes('invalid')) {
            set({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة', loading: false });
            return { success: false };
          }

          // Backend unreachable or legacy account (no password hash in MongoDB)
          // Fallback: try Firebase sign-in + sync to get user data
          console.warn('[AuthStore] Backend login failed, trying Firebase fallback:', msg);

          try {
            const { auth } = await import('../config/firebase');
            const { signInWithEmailAndPassword, signOut } = await import('firebase/auth');

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            if (!firebaseUser.emailVerified) {
              await signOut(auth);
              set({ error: 'يرجى تفعيل بريدك الإلكتروني أولاً', loading: false });
              return { success: false, notVerified: true };
            }

            const firebaseToken = await firebaseUser.getIdToken(true);

            let syncedUser = {
              email: firebaseUser.email,
              fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              plan: 'free',
              emailVerified: true,
            };

            try {
              const syncRes = await axios.post(`${API_ROUTES.AUTH}/sync`, {
                firebaseUID: firebaseUser.uid,
                email: firebaseUser.email,
                fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              });
              syncedUser = { ...syncRes.data.user, emailVerified: true };
            } catch {
              console.warn('[AuthStore] Sync failed, using Firebase data');
            }

            await signOut(auth).catch(() => {});
            set({ user: syncedUser, token: firebaseToken, loading: false });
            return { success: true };

          } catch (firebaseErr) {
            if (
              firebaseErr.code === 'auth/user-not-found' ||
              firebaseErr.code === 'auth/wrong-password' ||
              firebaseErr.code === 'auth/invalid-credential'
            ) {
              set({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة', loading: false });
              return { success: false };
            }
            // Both backend and Firebase failed (network issues)
            set({ error: 'تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.', loading: false });
            return { success: false };
          }
        }
      },

      // ── REGISTER ──────────────────────────────────────────────
      // 1. Backend → create account in MongoDB (stores password hash)
      // 2. Firebase → create account ONLY to send verification email
      register: async (fullName, email, password) => {
        set({ loading: true, error: null });

        try {
          // Step 1: Create account in MongoDB backend
          await axios.post(`${API_ROUTES.AUTH}/register`, { fullName, email, password });

          // Step 2: Firebase — send verification email only
          const { auth } = await import('../config/firebase');
          const {
            createUserWithEmailAndPassword,
            sendEmailVerification,
            updateProfile,
          } = await import('firebase/auth');

          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            await updateProfile(firebaseUser, { displayName: fullName });
            await sendEmailVerification(firebaseUser);
            console.log('[AuthStore] ✅ Verification email sent');
          } catch (firebaseErr) {
            console.warn('[AuthStore] Firebase verification setup failed:', firebaseErr.message);
          }

          set({ loading: false, error: null });
          return true;

        } catch (err) {
          let errorMsg = err.response?.data?.error || err.message || 'Registration failed';
          if (errorMsg.toLowerCase().includes('already') || err.code === 'auth/email-already-in-use') {
            errorMsg = 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.';
          } else if (err.code === 'auth/weak-password') {
            errorMsg = 'كلمة المرور ضعيفة. يجب أن تكون 8 أحرف على الأقل.';
          }
          set({ error: errorMsg, loading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null });
      },

      updateProfile: async (data) => {
        set({ loading: true, error: null });
        try {
          const token = get().token;
          const res = await axios.put(`${API_ROUTES.AUTH}/profile`, data, {
            headers: { Authorization: `Bearer ${token}` },
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
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
        console.log('[AuthStore] 🔄 State synced:', data);
      },

      getAuthHeader: () => {
        const token = get().token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    { name: 'cv-mister-auth' }
  )
);

export default useAuthStore;
