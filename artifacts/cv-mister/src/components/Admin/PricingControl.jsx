import React, { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiDollarSign, FiZap, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../api/config';

export default function PricingControl() {
  const [pricing, setPricing] = useState({
    free: { price: '0', resumesLimit: 2 },
    pro: { price: '29', resumesLimit: 2 }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/content`);
      if (res.data.success && res.data.settings?.pricing) {
        setPricing(res.data.settings.pricing);
      }
    } catch (err) {
      console.error('Failed to fetch pricing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.post(`${API_BASE_URL}/api/admin/pricing/update`, { pricing }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('تم تحديث الأسعار بنجاح');
      }
    } catch (err) {
      toast.error('فشل تحديث الأسعار');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
      <FiRefreshCw className="animate-spin" size={30} style={{ margin: '0 auto 10px' }} />
      جاري تحميل إعدادات الأسعار...
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>إعدادات الباقات والأسعار</h2>
        <p style={{ color: '#64748b' }}>تحكم في أسعار الخطط والحدود الافتراضية لكل باقة.</p>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        {/* Free Plan */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(100,116,139,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <FiZap size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>الخطة المجانية (Free)</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>السعر ($)</label>
              <div style={{ position: 'relative' }}>
                <FiDollarSign style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input 
                  type="text"
                  value={pricing.free.price}
                  disabled
                  style={{ width: '100%', padding: '10px 12px 10px 35px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#475569', cursor: 'not-allowed' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>حد السير الذاتية الافتراضي</label>
              <input 
                type="number"
                value={pricing.free.resumesLimit}
                onChange={(e) => setPricing({...pricing, free: {...pricing.free, resumesLimit: parseInt(e.target.value)}})}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' }}
              />
            </div>
          </div>
        </div>

        {/* Pro Plan */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(99,102,241,0.2)',
          boxShadow: '0 10px 30px -10px rgba(99,102,241,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <FiCheckCircle size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>باقة شهري احترافي (Pro)</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>السعر ($)</label>
              <div style={{ position: 'relative' }}>
                <FiDollarSign style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text"
                  value={pricing.pro.price}
                  onChange={(e) => setPricing({...pricing, pro: {...pricing.pro, price: e.target.value}})}
                  style={{ width: '100%', padding: '10px 12px 10px 35px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', outline: 'none' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>حد السير الذاتية الافتراضي</label>
              <input 
                type="number"
                value={pricing.pro.resumesLimit}
                onChange={(e) => setPricing({...pricing, pro: {...pricing.pro, resumesLimit: parseInt(e.target.value)}})}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          style={{
            marginTop: '12px',
            padding: '16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#fff',
            border: 'none',
            fontSize: '16px',
            fontWeight: 700,
            cursor: saving ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s'
          }}
        >
          {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </div>
  );
}
