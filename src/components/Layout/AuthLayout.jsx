// ============================================================
// CV-Mister — Auth Layout
// Centered card layout for Login, Register, etc.
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useStyleStore from '../../store/useStyleStore';

export default function AuthLayout({ children, title, subtitle }) {
  const language = useStyleStore((s) => s.language);

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 56px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at top right, rgba(59,130,246,0.05), transparent), radial-gradient(circle at bottom left, rgba(139,92,246,0.05), transparent)'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-surface)',
          padding: '40px',
          borderRadius: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block', marginBottom: '16px' }}>
            <div style={{ fontSize: '32px' }}>📄</div>
          </Link>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{subtitle}</p>
        </div>

        {children}
      </motion.div>
    </div>
  );
}
