// ============================================================
// CV-Mister — Template Control Panel (V2 Premium)
// Enable/disable templates with card grid, search, counters,
// and animated toggle switches
// ============================================================
import React, { useState, useEffect } from 'react';
import { TEMPLATE_LIST } from '../../utils/constants';
import { FiEye, FiEyeOff, FiSearch, FiGrid, FiList, FiToggleLeft, FiToggleRight, FiStar, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function TemplateControl({ templates: propTemplates }) {
  const [templateStates, setTemplateStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Fetch from API on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch('/api/admin/templates/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const merged = {};
          TEMPLATE_LIST.forEach(t => {
            merged[t.id] = {
              enabled: data.templates[t.id]?.enabled ?? true,
              isPremium: data.templates[t.id]?.isPremium ?? (t.isPremium || false)
            };
          });
          setTemplateStates(merged);
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = async (templateId, field) => {
    const currentState = templateStates[templateId] || { enabled: true, isPremium: false };
    const newValue = !currentState[field];
    
    const newTemplateState = { ...currentState, [field]: newValue };
    setTemplateStates((prev) => ({ ...prev, [templateId]: newTemplateState }));

    try {
      const token = localStorage.getItem('admin_token');
      await fetch('/api/admin/templates/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          templateId, 
          [field]: newValue 
        })
      });
      // toast.success(`تم تحديث القالب`);
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('فشل التحديث');
    }
  };

  const handleBulkUpdate = async (enabled) => {
    const updates = {};
    const newStates = { ...templateStates };
    TEMPLATE_LIST.forEach((t) => { 
      updates[t.id] = { ...templateStates[t.id], enabled };
      newStates[t.id] = { ...templateStates[t.id], enabled };
    });
    setTemplateStates(newStates);

    try {
      const token = localStorage.getItem('admin_token');
      await fetch('/api/admin/templates/update-bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ updates })
      });
      toast.success(enabled ? 'تم تفعيل الكل' : 'تم تعطيل الكل');
    } catch (err) {
      toast.error('فشل التحديث الجماعي');
    }
  };

  const handleEnableAll = () => handleBulkUpdate(true);
  const handleDisableAll = () => handleBulkUpdate(false);

  const enabledCount = Object.values(templateStates).filter(s => s.enabled).length;
  const totalCount = TEMPLATE_LIST.length;

  const filteredTemplates = TEMPLATE_LIST.filter((t) =>
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.label.toLowerCase().includes(search.toLowerCase())
  );

  const TEMPLATE_NAMES = {
    simple: 'بسيط',
    professional: 'احترافي',
    elegant: 'أنيق',
    creative: 'إبداعي',
    classic: 'كلاسيكي',
    minimalist: 'مبسّط',
    tech: 'تقني',
    executive: 'تنفيذي',
    academic: 'أكاديمي',
    modern_sidebar: 'شريط حديث',
    refined: 'مُطوَّر',
    slate: 'رمادي',
    border_grid: 'شبكة إطار',
    gradient_top: 'تدرج علوي',
    compact: 'مضغوط',
    classic_corporate: 'مؤسساتي',
    modern_split: 'حديث مقسم',
    executive_line: 'خط تنفيذي',
    legacy_clean: 'نظيف تراثي',
    minimal_bold: 'جريء مبسّط',
    subtle_bar: 'شريط ناعم',
    sky_split: 'سكاي سبليت',
    ocean_blue: 'أزرق محيطي',
    ats: 'ats',
    modern_wave: 'موجة حديثة',
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>جاري تحميل القوالب...</div>;

  return (
    <>
      <style>{`
        @keyframes templateCardEntry {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .template-card {
          animation: templateCardEntry 0.3s ease-out both;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .template-card:hover {
          transform: translateY(-2px) !important;
          border-color: rgba(255,255,255,0.12) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
        }
      `}</style>

      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(24px)',
        borderRadius: '18px',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        {/* ── Header ────────────────────────────────────────── */}
        <div style={{
          padding: '22px 28px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                التحكم في القوالب
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
                {enabledCount} من {totalCount} قالب مُفعّل حاليًا
              </p>
            </div>

            {/* Bulk Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleEnableAll}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(52,211,153,0.2)',
                  background: 'rgba(52,211,153,0.06)',
                  color: '#34d399',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(52,211,153,0.12)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(52,211,153,0.06)'}
              >
                <FiToggleRight size={12} />
                تفعيل الكل
              </button>
              <button
                onClick={handleDisableAll}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(248,113,113,0.2)',
                  background: 'rgba(248,113,113,0.06)',
                  color: '#f87171',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.12)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.06)'}
              >
                <FiToggleLeft size={12} />
                تعطيل الكل
              </button>
            </div>
          </div>

          {/* Search + View Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 14px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <FiSearch size={14} color="#64748b" />
              <input
                type="text"
                placeholder="بحث عن قالب..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f1f5f9',
                  fontSize: '13px',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* View Mode */}
            <div style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '3px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  width: '32px', height: '32px', borderRadius: '6px',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: viewMode === 'grid' ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: viewMode === 'grid' ? '#a5b4fc' : '#64748b',
                  transition: 'all 0.2s',
                }}
              >
                <FiGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  width: '32px', height: '32px', borderRadius: '6px',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: viewMode === 'list' ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: viewMode === 'list' ? '#a5b4fc' : '#64748b',
                  transition: 'all 0.2s',
                }}
              >
                <FiList size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Template Grid / List ──────────────────────────── */}
        <div style={{
          padding: '20px 24px',
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid'
            ? 'repeat(auto-fill, minmax(280px, 1fr))'
            : '1fr',
          gap: viewMode === 'grid' ? '16px' : '8px',
        }}>
          {filteredTemplates.map((template, index) => {
            const state = templateStates[template.id] || { enabled: true, isPremium: false };
            const isEnabled = state.enabled;
            const isPremium = state.isPremium;
            const arName = TEMPLATE_NAMES[template.id] || template.id;

            return (
              <div
                key={template.id}
                className="template-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 18px',
                  borderRadius: '14px',
                  background: isEnabled
                    ? 'rgba(255,255,255,0.025)'
                    : 'rgba(239, 68, 68, 0.02)',
                  border: `1px solid ${isEnabled
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(239, 68, 68, 0.12)'}`,
                  opacity: isEnabled ? 1 : 0.6,
                  animationDelay: `${index * 30}ms`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  {/* Template Icon */}
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: isEnabled
                      ? `${template.color}14`
                      : 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    border: `1px solid ${isEnabled ? `${template.color}25` : 'rgba(255,255,255,0.05)'}`,
                    transition: 'all 0.25s',
                    flexShrink: 0,
                  }}>
                    {template.icon}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: isEnabled ? '#f1f5f9' : '#64748b',
                      transition: 'color 0.25s',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {arName}
                      {isPremium && <FiStar size={12} color="#fbbf24" fill="#fbbf24" />}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: isPremium ? '#fbbf24' : '#34d399',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '3px',
                    }}>
                       {isPremium ? 'قالب احترافي (Pro)' : 'قالب مجاني (Free)'}
                    </div>
                  </div>
                </div>

                {/* Toggles Container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  {/* Pro/Free Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Pro</span>
                    <button
                      onClick={() => handleToggle(template.id, 'isPremium')}
                      style={{
                        width: '38px',
                        height: '20px',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.3s',
                        background: isPremium
                          ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                          : 'rgba(255,255,255,0.06)',
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: '2px',
                        left: isPremium ? '20px' : '2px',
                        transition: 'all 0.3s',
                      }} />
                    </button>
                  </div>

                  {/* Enable/Disable Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>{isEnabled ? 'مفعل' : 'معطل'}</span>
                    <button
                      onClick={() => handleToggle(template.id, 'enabled')}
                      style={{
                        width: '38px',
                        height: '20px',
                        borderRadius: '100px',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.3s',
                        background: isEnabled
                          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                          : 'rgba(255,255,255,0.06)',
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: '2px',
                        left: isEnabled ? '20px' : '2px',
                        transition: 'all 0.3s',
                      }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer Stats ──────────────────────────────────── */}
        <div style={{
          padding: '14px 28px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#475569',
          fontWeight: 500,
        }}>
          <span>إجمالي القوالب: {totalCount}</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ color: '#34d399' }}>● {enabledCount} مُفعّل</span>
            <span style={{ color: '#f87171' }}>● {totalCount - enabledCount} معطّل</span>
          </div>
        </div>
      </div>
    </>
  );
}
