// ============================================================
// CV-Mister — Protected Route
// Redirects to login if user is not authenticated
// Uses Firebase auth state for verification checks
// ============================================================

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { auth } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  // ── Listen for Firebase auth state to confirm session ──────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase — verify their email status
        if (firebaseUser.emailVerified) {
          // Ensure our Zustand store reflects the verified state
          const currentUser = useAuthStore.getState().user;
          if (currentUser && !currentUser.emailVerified) {
            useAuthStore.setState((state) => ({
              user: { ...state.user, emailVerified: true }
            }));
          }
        }
      } else {
        // No Firebase user — clear local state if stale
        if (useAuthStore.getState().token) {
          console.log('[ProtectedRoute] Firebase session lost, logging out.');
          useAuthStore.getState().logout();
        }
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  // ── Show nothing until Firebase confirms auth state ────────
  if (!authChecked) {
    return (
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        minHeight: '60vh', color: 'var(--text-muted)' 
      }}>
        <span>Loading...</span>
      </div>
    );
  }

  // ── No token at all → redirect to login ────────────────────
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── User exists but email not verified → redirect ──────────
  if (user && !user.emailVerified) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

