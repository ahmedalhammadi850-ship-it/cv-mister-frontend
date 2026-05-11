import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiUser, FiZap, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

// ============================================================
// Simulate Inertia.js useForm hook for React Router environment
// ============================================================
const useForm = (initialValues) => {
  const [data, setData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const post = async (url) => {
    setProcessing(true);
    setErrors({});
    
    try {
      // Direct call to the new backend endpoint
      const res = await axios.post(`${API_BASE_URL}/api/admin/login`, data);
      
      if (res.data.success && res.data.token) {
        localStorage.setItem('admin_token', res.data.token);
        toast.success('تم تسجيل الدخول بنجاح');
        navigate('/admin');
        return true;
      }
    } catch (err) {
      console.error('[Login Error]', err);
      const msg = err.response?.data?.error || 'فشل تسجيل الدخول. يرجى التأكد من البيانات.';
      setErrors({ username: msg });
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
    return false;
  };

  return { data, setData, post, processing, errors };
};

export default function AdminLogin() {
  const { data, setData, post, processing, errors } = useForm({
    username: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await post('/admin/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#020617', // Slate-950
      fontFamily: "'IBM Plex Sans Arabic', 'Inter', sans-serif",
      direction: 'rtl',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background abstract elements for Vibe Coding aesthetic */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0) 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(15, 23, 42, 0.6)', // Slate-900 with transparency
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(30, 41, 59, 0.8)', // Slate-800
        padding: '48px 40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.02)',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Logo Area */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
          }}>
            <FiShield size={28} color="#ffffff" strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#f8fafc',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em'
          }}>
            CV-Mister
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#818cf8',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <FiZap size={14} />
            Admin Access Only
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Username Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#94a3b8',
              marginBottom: '8px'
            }}>
              اسم المستخدم
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                right: '16px',
                transform: 'translateY(-50%)',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <FiUser size={18} />
              </div>
              <input
                type="text"
                value={data.username}
                onChange={e => setData({ ...data, username: e.target.value })}
                placeholder="أدخل اسم المستخدم"
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 40px',
                  background: 'rgba(2, 6, 23, 0.5)', // Slate-950
                  border: `1px solid ${errors.username ? '#ef4444' : '#1e293b'}`, // Slate-800
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  if (!errors.username) {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.username) {
                    e.target.style.borderColor = '#1e293b';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
            </div>
            {errors.username && (
              <div style={{ color: '#f87171', fontSize: '12px', marginTop: '6px', fontWeight: 500 }}>
                {errors.username}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#94a3b8',
              marginBottom: '8px'
            }}>
              كلمة المرور
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                right: '16px',
                transform: 'translateY(-50%)',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <FiLock size={18} />
              </div>
              <input
                type="password"
                value={data.password}
                onChange={e => setData({ ...data, password: e.target.value })}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 40px',
                  background: 'rgba(2, 6, 23, 0.5)',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  letterSpacing: '2px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#1e293b';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={processing}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: processing ? 'wait' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
              opacity: processing ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              if (!processing) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!processing) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
              }
            }}
          >
            {processing ? (
              <div style={{
                width: '20px',
                height: '20px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>
        
        {/* Spin Animation Definition */}
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}
