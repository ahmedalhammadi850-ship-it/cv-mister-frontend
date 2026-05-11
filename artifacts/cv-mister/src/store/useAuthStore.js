// ============================================================
// CV-Mister — Auth Store (Zustand)
// Architecture:
//   - Firebase: ONLY for email verification (send + check)
//   - MongoDB (backend): account creation, login, JWT, user data
//   - Legacy fallback: accounts created via old Firebase-only flow
//     use Firebase ID token if backend password login is unavailable
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

      // ── LOGIN ─────────────────────────────────────────────────
      // 1. Firebase → check emailVerified only (keep session for fallback token)
      // 2. Backend → authenticate via MongoDB, get JWT
      // 3. Fallback → if backend login fails (legacy Firebase-only account),
      //               sync with MongoDB and use Firebase ID token
      login: async (email, password) => {
        set({ loading: true, error: null });

        try {
          // Step 1: Firebase — check email verification status
          const { auth } = await import('../config/firebase');
          const { signInWithEmailAndPassword, signOut } = await import('firebase/auth');

          let firebaseUser = null;
          let emailVerified = false;

          try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            firebaseUser = userCredential.user;
            emailVerified = firebaseUser.emailVerified;
          } catch (firebaseErr) {
            if (
              firebaseErr.code === 'auth/user-not-found' ||
              firebaseErr.code === 'auth/invalid-credential' ||
              firebaseErr.code === 'auth/wrong-password'
            ) {
              set({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة', loading: false });
              return { success: false };
            }
            // Network/unknown Firebase error — proceed to backend directly
            console.warn('[AuthStore] Firebase check skipped:', firebaseErr.message);
            emailVerified = true;
          }

          if (!emailVerified) {
            if (firebaseUser) await signOut(auth);
            set({ error: 'يرجى تفعيل بريدك الإلكتروني أولاً', loading: false });
            return { success: false, notVerified: true };
          }

          // Step 2: Try MongoDB backend login (new accounts with password hash)
          try {
            const loginRes = await axios.post(`${API_ROUTES.AUTH}/login`, { email, password });
            const { token, ...userData } = loginRes.data;

            // Sign out Firebase — MongoDB JWT takes over
            if (firebaseUser) await signOut(auth).catch(() => {});

            set({ user: { ...userData, emailVerified: true }, token, loading: false });
            return { success: true };

          } catch (backendErr) {
            // Step 3: Fallback for legacy Firebase-only accounts (no password in MongoDB)
            // Use Firebase ID token + sync to get/create MongoDB user record
            console.warn('[AuthStore] Backend login failed, trying legacy Firebase sync:', backendErr.message);

            if (!firebaseUser) {
              set({ error: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.', loading: false });
              return { success: false };
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
            } catch (syncErr) {
              console.warn('[AuthStore] Sync also failed, using Firebase data only:', syncErr.message);
            }

            // Sign out Firebase — we store Firebase token in state
            await signOut(auth).catch(() => {});

            set({ user: syncedUser, token: firebaseToken, loading: false });
            return { success: true };
          }

        } catch (err) {
          const msg = err.response?.data?.error || err.message || 'Login failed';
          set({ error: msg, loading: false });
          return { success: false };
        }
      },

      // ── REGISTER ──────────────────────────────────────────────
      // 1. Backend → create account in MongoDB (stores password hash)
      // 2. Firebase → create account ONLY to send verification email
      register: async (fullName, email, password) => {
        set({ loading: true, error: null });

        try {
          // Step 1: Create account in MongoDB backend (password hashed)
          await axios.post(`${API_ROUTES.AUTH}/register`, { fullName, email, password });

          // Step 2: Firebase — create account just to send verification email
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
          } else if (errorMsg.toLowerCase().includes('password') || err.code === 'auth/weak-password') {
            errorMsg = 'كلمة المرور ضعيفة. يجب أن تكون 8 أحرف على الأقل.';
          } else if (errorMsg.toLowerCase().includes('email') || err.code === 'auth/invalid-email') {
            errorMsg = 'البريد الإلكتروني غير صالح.';
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
