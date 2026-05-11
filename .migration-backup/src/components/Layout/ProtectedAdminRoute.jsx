// ============================================================
// CV-Mister — Protected Admin Route
// Strict check for admin_token in localStorage
// ============================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  const location = useLocation();

  if (!token) {
    // Redirect to admin login if no admin token
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
