// ============================================================
// CV-Mister — Auth Store (Zustand)
// Manages user session, JWT, and auth states
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

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { auth } = await import('../config/firebase');
          const { signInWithEmailAndPassword, signOut } = await import('firebase/auth');
          
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;

          // Mandatory Check: Email Verification
          if (!firebaseUser.emailVerified) {
            await signOut(auth);
            set({ error: 'يرجى تفعيل بريدك الإلكتروني أولاً. تحقق من صندوق الوارد.', loading: false });
            return { success: false, notVerified: true };
          }

          // Sync with our backend to get custom user data and DB ID
          const syncRes = await axios.post(`${API_ROUTES.AUTH}/sync`, {
            firebaseUID: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: firebaseUser.displayName || 'User'
          });

          // Force refresh the token so it includes email_verified=true
          const token = await firebaseUser.getIdToken(true);
          
          set({ 
            user: { ...syncRes.data.user, emailVerified: true }, 
            token: token, 
            loading: false 
          });
          return { success: true };
        } catch (err) {
          let errorMsg = 'Login failed';
          if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            errorMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
          }
          set({ error: errorMsg, loading: false });
          return { success: false };
        }
      },

      register: async (fullName, email, password) => {
        set({ loading: true, error: null });
        try {
          const { auth } = await import('../config/firebase');
          const { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } = await import('firebase/auth');
          
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;

          console.log(`[Firebase Auth] Account created for: ${firebaseUser.email}`);

          // PRIORITY: Send email immediately while session is freshest
          console.log(`[Firebase Auth] Attempting to send verification email...`);
          try {
            // Using auth.currentUser to ensure we use the active authenticated session
            await sendEmailVerification(auth.currentUser);
            console.log(`[Firebase Auth] ✅ Verification email sent successfully to ${firebaseUser.email}`);
          } catch (verifyErr) {
            console.error(`[Firebase Auth] ❌ Failed to send verification email:`, verifyErr.message);
          }

          // Then update the name
          await updateProfile(firebaseUser, { displayName: fullName });

          // Sync with our backend
          await axios.post(`${API_ROUTES.AUTH}/sync`, {
            firebaseUID: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: fullName
          });

          // UPDATE: Instead of immediate sign out, we keep the user object in state 
          // but marked as unverified so the UI can poll for status change.
          const token = await firebaseUser.getIdToken();
          set({ 
            user: { 
              firebaseUID: firebaseUser.uid, 
              email: firebaseUser.email, 
              fullName: fullName,
              emailVerified: false 
            }, 
            token, 
            loading: false 
          });
          
          return true;
        } catch (err) {
          set({ error: err.message, loading: false });
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
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ user: res.data, token: res.data.token, loading: false });
          return true;
        } catch (err) {
          set({ error: err.response?.data?.error || 'Update failed', loading: false });
          return false;
        }
      },

      getAuthHeader: () => {
        const token = get().token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      }
    }),
    { name: 'cv-mister-auth' }
  )
);

export default useAuthStore;
