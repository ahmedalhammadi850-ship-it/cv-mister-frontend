// ============================================================
// CV-Mister — Auth Store (Zustand)
// Architecture:
//   - Firebase: ONLY for email verification (send + check)
//   - MongoDB (backend): account creation, login, JWT, user data
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
      // 1. Firebase → check emailVerified only
      // 2. Backend → authenticate via MongoDB, get JWT
      login: async (email, password) => {
        set({ loading: true, error: null });

        try {
          // Step 1: Use Firebase ONLY to check email verification status
          const { auth } = await import('../config/firebase');
          const { signInWithEmailAndPassword, signOut } = await import('firebase/auth');

          let emailVerified = false;
          try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            emailVerified = userCredential.user.emailVerified;
            // Immediately sign out from Firebase — we use backend for auth
            await signOut(auth);
          } catch (firebaseErr) {
            if (
              firebaseErr.code === 'auth/user-not-found' ||
              firebaseErr.code === 'auth/invalid-credential' ||
              firebaseErr.code === 'auth/wrong-password'
            ) {
              // Wrong credentials — fail early
              set({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة', loading: false });
              return { success: false };
            }
            // Firebase network/unknown error — skip verification check, proceed to backend
            console.warn('[AuthStore] Firebase check skipped:', firebaseErr.message);
            emailVerified = true; // optimistic: let backend decide
          }

          if (!emailVerified) {
            set({ error: 'يرجى تفعيل بريدك الإلكتروني أولاً', loading: false });
            return { success: false, notVerified: true };
          }

          // Step 2: Authenticate via MongoDB backend → get JWT + user data
          const loginRes = await axios.post(`${API_ROUTES.AUTH}/login`, { email, password });
          const { token, ...userData } = loginRes.data;

          set({
            user: { ...userData, emailVerified: true },
            token,
            loading: false,
          });
          return { success: true };

        } catch (err) {
          const msg = err.response?.data?.error || err.message || 'Login failed';
          set({ error: msg, loading: false });
          return { success: false };
        }
      },

      // ── REGISTER ──────────────────────────────────────────────
      // 1. Backend → create account in MongoDB
      // 2. Firebase → create account ONLY to send verification email, then sign out
      register: async (fullName, email, password) => {
        set({ loading: true, error: null });

        try {
          // Step 1: Create account in MongoDB backend
          await axios.post(`${API_ROUTES.AUTH}/register`, { fullName, email, password });

          // Step 2: Create Firebase account ONLY for sending verification email
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
            // Keep Firebase session alive so VerifyEmail page can poll
            console.log('[AuthStore] ✅ Verification email sent via Firebase');
          } catch (firebaseErr) {
            console.warn('[AuthStore] Firebase email verification setup failed:', firebaseErr.message);
            // Still succeed — user is in MongoDB, they can login once verified manually
          }

          set({ loading: false, error: null });
          return true;

        } catch (err) {
          let errorMsg = err.response?.data?.error || err.message || 'Registration failed';
          if (err.code === 'auth/email-already-in-use' || errorMsg.toLowerCase().includes('already')) {
            errorMsg = 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.';
          } else if (err.code === 'auth/weak-password' || errorMsg.toLowerCase().includes('password')) {
            errorMsg = 'كلمة المرور ضعيفة. يجب أن تكون 8 أحرف على الأقل.';
          } else if (err.code === 'auth/invalid-email' || errorMsg.toLowerCase().includes('email')) {
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
        console.log('[AuthStore] 🔄 State synced with real-time data:', data);
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
