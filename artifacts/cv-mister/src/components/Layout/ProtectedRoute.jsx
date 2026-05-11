// ============================================================
// CV-Mister — Protected Route
// Auth check: MongoDB JWT token only (no Firebase dependency)
// If token + user exist in store → allow access
// If not → redirect to login
// ============================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

export default function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  // No token or no user → redirect to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
