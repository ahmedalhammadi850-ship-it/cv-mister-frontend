// ============================================================
// CV-Mister — CMS Control (Full)
// Dynamic management of Landing Page, About, and Pricing
// Premium dark glassmorphism UI
// ============================================================
import React, { useState } from 'react';
import { 
  FiHome, FiInfo, FiTag, FiSave, FiPlus, 
  FiTrash2, FiRefreshCw, FiChevronDown, FiChevronUp,
  FiStar, FiTarget, FiEye, FiLayout, FiHelpCircle,
  FiDollarSign, FiList, FiClock, FiCheck, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import useCMSStore from '../../store/useCMSStore';

// ── Shared Styles ───────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(2, 6, 23, 0.5)',
  color: '#f1f5f9', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
};
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' };
const sectionTitle = { fontSize: '16px', fontWeight: 700, color: '#818cf8', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' };
const cardStyle = { background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' };

// ── Collapsible Section ─────────────────────────────────────
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: '8px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          ...sectionTitle, width: '100%', cursor: 'pointer', border: 'none',
          background: 'none', textAlign: 'right', margin: 0, padding: '14px 0',
          borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'inherit',
        }}
      >
        <Icon size={18} color="#6366f1" />
        <span style={{ flex: 1, textAlign: 'right' }}>{title}</span>
        {open ? <FiChevronUp size={16} color="#64748b" /> : <FiChevronDown size={16} color="#64748b" />}
      </button>
      {open && <div style={{ paddingTop: '20px', paddingBottom: '12px' }}>{children}</div>}
    </div>
  );
}

// ── Save Button ─────────────────────────────────────────────
function SaveButton({ onClick, processing }) {
  return (
    <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: 0, background: 'linear-gradient(to top, rgba(30,41,59,0.98) 70%, transparent)', zIndex: 10 }}>
      <button
        onClick={onClick}
        disabled={processing}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 36px',
          borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff', fontSize: '14px', fontWeight: 700, cursor: processing ? 'wait' : 'pointer',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)', opacity: processing ? 0.7 : 1,
          transition: 'all 0.2s', fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => { if (!processing) e.currentTarget.style.transform = 'scale(1.02)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {processing ? <FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <FiSave size={16} />}
        {processing ? 'جاري تطبيق التعديلات...' : '💾 نشر التحديثات'}
      </button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// MAIN EXPORT
// ───────────────────────────────────────────────────────────
export default function CMSControl() {
  const [activeTab, setActiveTab] = useState('home');

  const TABS = [
    { id: 'home', label: 'الرئيسية', icon: FiHome, color: '#6366f1' },
    { id: 'about', label: 'من نحن', icon: FiInfo, color: '#06b6d4' },
    { id: 'pricing', label: 'الأسعار', icon: FiTag, color: '#10b981' },
  ];

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(24px)',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '750px'
    }}>
      {/* Tab Bar */}
      <div style={{
        display: 'flex', gap: '4px', padding: '20px 28px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(15, 23, 42, 0.3)',
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px',
                borderRadius: '12px 12px 0 0', border: 'none',
                background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: isActive ? '#f1f5f9' : '#94a3b8',
                borderBottom: isActive ? `2px solid ${tab.color}` : '2px solid transparent',
                fontSize: '14px', fontWeight: isActive ? 700 : 500, cursor: 'pointer',
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}
            >
              <tab.icon size={16} style={{ color: isActive ? tab.color : '#64748b' }} />
              {tab.label}
              {isActive && (
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: tab.color, boxShadow: `0 0 8px ${tab.color}`,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '32px 36px', flex: 1, position: 'relative', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
        {activeTab === 'home' && <HomeCMS />}
        {activeTab === 'about' && <AboutCMS />}
        {activeTab === 'pricing' && <PricingCMS />}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// HOME PAGE CMS
// ═══════════════════════════════════════════════════════════
function HomeCMS() {
  const { settings, syncSettings } = useCMSStore();
  const [data, setData] = useState({ ...settings });
  const [processing, setProcessing] = useState(false);

  const saveChanges = async () => {
    setProcessing(true);
    const res = await syncSettings(data);
    if (res?.success) {
      toast.success('✅ تم تحديث الإعدادات بنجاح في قاعدة البيانات', {
        style: { background: '#0f172a', color: '#fff', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.3)' },
      });
    } else {
      toast.error(res?.error === 'Unauthorized' ? '❌ خطأ: غير مصرح لك' : '❌ فشل الاتصال بالخادم');
    }
    setProcessing(false);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      
      {/* Hero Setup */}
      <CollapsibleSection title="إعدادات الـ Hero (العناوين)" icon={FiLayout}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={labelStyle}>شارة البداية (عربي)</label>
            <input style={inputStyle} value={data.heroBadgeAr} onChange={e => setData({...data, heroBadgeAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>شارة البداية (إنجليزي)</label>
            <input style={inputStyle} value={data.heroBadgeEn} onChange={e => setData({...data, heroBadgeEn: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>العنوان الرئيسي (عربي) - يدعم HTML</label>
            <textarea style={{...inputStyle, height: '80px'}} value={data.heroTitleAr} onChange={e => setData({...data, heroTitleAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>العنوان الرئيسي (إنجليزي) - يدعم HTML</label>
            <textarea style={{...inputStyle, height: '80px'}} value={data.heroTitleEn} onChange={e => setData({...data, heroTitleEn: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>الوصف الفرعي (عربي)</label>
            <textarea style={{...inputStyle, height: '80px'}} value={data.heroSubtitleAr} onChange={e => setData({...data, heroSubtitleAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>الوصف الفرعي (إنجليزي)</label>
            <textarea style={{...inputStyle, height: '80px'}} value={data.heroSubtitleEn} onChange={e => setData({...data, heroSubtitleEn: e.target.value})} />
          </div>
        </div>
      </CollapsibleSection>

      {/* AI Features Toggle */}
      <CollapsibleSection title="إعدادات النظام الذكي (AI)" icon={FiTarget}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>ميزات الذكاء الاصطناعي مجانية للجميع</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>تفعيل هذا الخيار يسمح لجميع المستخدمين (المجانيين والمدفوعين) باستخدام الذكاء الاصطناعي بلا قيود.</p>
            </div>
            <button
              onClick={() => setData({ ...data, isAIFreeGlobally: !data.isAIFreeGlobally })}
              style={{
                width: '46px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer',
                background: data.isAIFreeGlobally ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.06)',
                position: 'relative', transition: 'all 0.3s',
                boxShadow: data.isAIFreeGlobally ? '0 2px 8px rgba(16,185,129,0.3)' : 'none',
              }}
            >
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%', background: '#fff',
                position: 'absolute', top: '2px', left: data.isAIFreeGlobally ? '22px' : '2px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
        </div>
      </CollapsibleSection>

      {/* Features */}
      <CollapsibleSection title="المميزات (Features)" icon={FiStar} defaultOpen={false}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {data.features.map((feat, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ ...labelStyle, fontSize: '11px' }}>عنوان عربي</label>
                  <input style={{...inputStyle}} value={feat.titleAr} onChange={e => {
                    const newF = [...data.features]; newF[i] = {...newF[i], titleAr: e.target.value}; setData({...data, features: newF});
                  }} />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '11px' }}>عنوان إنجليزي</label>
                  <input style={{...inputStyle}} value={feat.titleEn} onChange={e => {
                    const newF = [...data.features]; newF[i] = {...newF[i], titleEn: e.target.value}; setData({...data, features: newF});
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, fontSize: '11px' }}>الأيقونة</label>
                  <input style={{...inputStyle}} value={feat.iconKey} onChange={e => {
                    const newF = [...data.features]; newF[i] = {...newF[i], iconKey: e.target.value}; setData({...data, features: newF});
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, fontSize: '11px' }}>اللون</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="color" value={feat.color} onChange={e => {
                      const newF = [...data.features]; newF[i] = {...newF[i], color: e.target.value}; setData({...data, features: newF});
                    }} style={{ width: '40px', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                    <input style={{...inputStyle, flex: 1}} value={feat.color} onChange={e => {
                      const newF = [...data.features]; newF[i] = {...newF[i], color: e.target.value}; setData({...data, features: newF});
                    }} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, fontSize: '11px' }}>وصف عربي</label>
                  <textarea style={{...inputStyle, height: '60px'}} value={feat.descAr} onChange={e => {
                    const newF = [...data.features]; newF[i] = {...newF[i], descAr: e.target.value}; setData({...data, features: newF});
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, fontSize: '11px' }}>وصف إنجليزي</label>
                  <textarea style={{...inputStyle, height: '60px'}} value={feat.descEn} onChange={e => {
                    const newF = [...data.features]; newF[i] = {...newF[i], descEn: e.target.value}; setData({...data, features: newF});
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Steps */}
      <CollapsibleSection title="خطوات العمل (How it works)" icon={FiList} defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', ...cardStyle }}>
              <div style={{ padding: '8px 12px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderRadius: '8px', fontWeight: 'bold', flexShrink: 0 }}>
                {step.num}
              </div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input style={inputStyle} placeholder="عنوان عربي" value={step.titleAr} onChange={e => {
                  const newS = [...data.steps]; newS[i] = {...newS[i], titleAr: e.target.value}; setData({...data, steps: newS});
                }} />
                <input style={inputStyle} placeholder="عنوان إنجليزي" value={step.titleEn} onChange={e => {
                  const newS = [...data.steps]; newS[i] = {...newS[i], titleEn: e.target.value}; setData({...data, steps: newS});
                }} />
                <input style={inputStyle} placeholder="وصف عربي" value={step.descAr} onChange={e => {
                  const newS = [...data.steps]; newS[i] = {...newS[i], descAr: e.target.value}; setData({...data, steps: newS});
                }} />
                <input style={inputStyle} placeholder="وصف إنجليزي" value={step.descEn} onChange={e => {
                  const newS = [...data.steps]; newS[i] = {...newS[i], descEn: e.target.value}; setData({...data, steps: newS});
                }} />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Stats */}
      <CollapsibleSection title="الإحصائيات والأرقام (Stats)" icon={FiStar} defaultOpen={false}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {data.stats.map((stat, i) => (
            <div key={i} style={cardStyle}>
              <input style={{...inputStyle, fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#38bdf8'}} value={stat.value} onChange={e => {
                const newS = [...data.stats]; newS[i] = {...newS[i], value: e.target.value}; setData({...data, stats: newS});
              }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input style={{...inputStyle, flex: 1}} placeholder="عربي" value={stat.labelAr} onChange={e => {
                  const newS = [...data.stats]; newS[i] = {...newS[i], labelAr: e.target.value}; setData({...data, stats: newS});
                }} />
                <input style={{...inputStyle, flex: 1}} placeholder="إنجليزي" value={stat.labelEn} onChange={e => {
                  const newS = [...data.stats]; newS[i] = {...newS[i], labelEn: e.target.value}; setData({...data, stats: newS});
                }} />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Footer */}
      <CollapsibleSection title="إعدادات التذييل (Footer)" icon={FiLayout} defaultOpen={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={labelStyle}>نص الحقوق (عربي)</label>
            <input style={inputStyle} value={data.copyrightAr || ''} onChange={e => setData({...data, copyrightAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>نص الحقوق (إنجليزي)</label>
            <input style={inputStyle} value={data.copyrightEn || ''} onChange={e => setData({...data, copyrightEn: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>رابط تيليجرام</label>
            <input style={inputStyle} value={data.socialTelegram || ''} onChange={e => setData({...data, socialTelegram: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>رابط واتساب</label>
            <input style={inputStyle} value={data.socialWhatsapp || ''} onChange={e => setData({...data, socialWhatsapp: e.target.value})} />
          </div>
        </div>
      </CollapsibleSection>

      <SaveButton onClick={saveChanges} processing={processing} />
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// ABOUT PAGE CMS
// ═══════════════════════════════════════════════════════════
function AboutCMS() {
  const { settings, syncSettings } = useCMSStore();
  const [data, setData] = useState({ ...settings });
  const [processing, setProcessing] = useState(false);

  const saveChanges = async () => {
    setProcessing(true);
    const res = await syncSettings(data);
    if (res?.success) {
      toast.success('✅ تم تحديث صفحة "من نحن" بنجاح', {
        style: { background: '#0f172a', color: '#fff', borderRadius: '12px', border: '1px solid rgba(6,182,212,0.3)' },
      });
    } else {
      toast.error(res?.error === 'Unauthorized' ? '❌ خطأ: غير مصرح لك' : '❌ فشل الاتصال بالخادم');
    }
    setProcessing(false);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '8px' }}>

      {/* About Hero */}
      <CollapsibleSection title="عنوان الصفحة (Hero)" icon={FiLayout}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={labelStyle}>التسمية (عربي)</label>
            <input style={inputStyle} value={data.aboutHeroLabelAr} onChange={e => setData({...data, aboutHeroLabelAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>التسمية (إنجليزي)</label>
            <input style={inputStyle} value={data.aboutHeroLabelEn} onChange={e => setData({...data, aboutHeroLabelEn: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>العنوان الرئيسي (عربي) - يدعم HTML</label>
            <textarea style={{...inputStyle, height: '70px'}} value={data.aboutHeroTitleAr} onChange={e => setData({...data, aboutHeroTitleAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>العنوان الرئيسي (إنجليزي) - يدعم HTML</label>
            <textarea style={{...inputStyle, height: '70px'}} value={data.aboutHeroTitleEn} onChange={e => setData({...data, aboutHeroTitleEn: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>الوصف (عربي)</label>
            <textarea style={{...inputStyle, height: '70px'}} value={data.aboutHeroSubtitleAr} onChange={e => setData({...data, aboutHeroSubtitleAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>الوصف (إنجليزي)</label>
            <textarea style={{...inputStyle, height: '70px'}} value={data.aboutHeroSubtitleEn} onChange={e => setData({...data, aboutHeroSubtitleEn: e.target.value})} />
          </div>
        </div>
      </CollapsibleSection>

      {/* About Stats */}
      <CollapsibleSection title="الإحصائيات" icon={FiStar} defaultOpen={false}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {(data.aboutStats || []).map((stat, i) => (
            <div key={i} style={cardStyle}>
              <input style={{...inputStyle, fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#22d3ee'}} value={stat.value} onChange={e => {
                const newS = [...data.aboutStats]; newS[i] = {...newS[i], value: e.target.value}; setData({...data, aboutStats: newS});
              }} />
              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <input style={{...inputStyle, flex: 1}} placeholder="عربي" value={stat.labelAr} onChange={e => {
                  const newS = [...data.aboutStats]; newS[i] = {...newS[i], labelAr: e.target.value}; setData({...data, aboutStats: newS});
                }} />
                <input style={{...inputStyle, flex: 1}} placeholder="إنجليزي" value={stat.labelEn} onChange={e => {
                  const newS = [...data.aboutStats]; newS[i] = {...newS[i], labelEn: e.target.value}; setData({...data, aboutStats: newS});
                }} />
              </div>
              <input style={{...inputStyle}} placeholder="الأيقونة (مثل: Users, Star)" value={stat.iconKey} onChange={e => {
                const newS = [...data.aboutStats]; newS[i] = {...newS[i], iconKey: e.target.value}; setData({...data, aboutStats: newS});
              }} />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Timeline */}
      <CollapsibleSection title="الجدول الزمني (Timeline)" icon={FiClock} defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(data.aboutTimeline || []).map((item, i) => (
            <div key={i} style={{ ...cardStyle, display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                <input style={{...inputStyle, width: '80px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: '#a78bfa'}} value={item.year} onChange={e => {
                  const newT = [...data.aboutTimeline]; newT[i] = {...newT[i], year: e.target.value}; setData({...data, aboutTimeline: newT});
                }} />
                <input style={{...inputStyle, width: '80px', textAlign: 'center', fontSize: '11px'}} placeholder="أيقونة" value={item.iconKey} onChange={e => {
                  const newT = [...data.aboutTimeline]; newT[i] = {...newT[i], iconKey: e.target.value}; setData({...data, aboutTimeline: newT});
                }} />
              </div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input style={inputStyle} placeholder="عنوان عربي" value={item.titleAr} onChange={e => {
                  const newT = [...data.aboutTimeline]; newT[i] = {...newT[i], titleAr: e.target.value}; setData({...data, aboutTimeline: newT});
                }} />
                <input style={inputStyle} placeholder="عنوان إنجليزي" value={item.titleEn} onChange={e => {
                  const newT = [...data.aboutTimeline]; newT[i] = {...newT[i], titleEn: e.target.value}; setData({...data, aboutTimeline: newT});
                }} />
                <textarea style={{...inputStyle, height: '60px'}} placeholder="وصف عربي" value={item.descAr} onChange={e => {
                  const newT = [...data.aboutTimeline]; newT[i] = {...newT[i], descAr: e.target.value}; setData({...data, aboutTimeline: newT});
                }} />
                <textarea style={{...inputStyle, height: '60px'}} placeholder="وصف إنجليزي" value={item.descEn} onChange={e => {
                  const newT = [...data.aboutTimeline]; newT[i] = {...newT[i], descEn: e.target.value}; setData({...data, aboutTimeline: newT});
                }} />
              </div>
              <button onClick={() => {
                const newT = data.aboutTimeline.filter((_, idx) => idx !== i);
                setData({...data, aboutTimeline: newT});
              }} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#f87171', flexShrink: 0 }}>
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
          <button onClick={() => {
            setData({...data, aboutTimeline: [...(data.aboutTimeline || []), { year: '2027', titleAr: '', titleEn: '', descAr: '', descEn: '', iconKey: 'Star' }]});
          }} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
            borderRadius: '10px', border: '1px dashed rgba(99,102,241,0.3)',
            background: 'rgba(99,102,241,0.05)', color: '#a5b4fc', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
          }}>
            <FiPlus size={16} /> إضافة محطة جديدة
          </button>
        </div>
      </CollapsibleSection>

      {/* Mission & Vision */}
      <CollapsibleSection title="المهمة والرؤية" icon={FiTarget} defaultOpen={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Mission */}
          <div style={{ ...cardStyle, borderColor: 'rgba(99,102,241,0.15)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#818cf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiTarget size={16} /> المهمة
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>العنوان (عربي)</label>
                <input style={inputStyle} value={data.aboutMissionTitleAr} onChange={e => setData({...data, aboutMissionTitleAr: e.target.value})} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>العنوان (إنجليزي)</label>
                <input style={inputStyle} value={data.aboutMissionTitleEn} onChange={e => setData({...data, aboutMissionTitleEn: e.target.value})} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>الوصف (عربي)</label>
                <textarea style={{...inputStyle, height: '80px'}} value={data.aboutMissionDescAr} onChange={e => setData({...data, aboutMissionDescAr: e.target.value})} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>الوصف (إنجليزي)</label>
                <textarea style={{...inputStyle, height: '80px'}} value={data.aboutMissionDescEn} onChange={e => setData({...data, aboutMissionDescEn: e.target.value})} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>قائمة المهام (عربي) — سطر لكل عنصر</label>
                <textarea style={{...inputStyle, height: '70px'}} value={(data.aboutMissionChecklistAr || []).join('\n')} onChange={e => setData({...data, aboutMissionChecklistAr: e.target.value.split('\n')})} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>قائمة المهام (إنجليزي) — سطر لكل عنصر</label>
                <textarea style={{...inputStyle, height: '70px'}} value={(data.aboutMissionChecklistEn || []).join('\n')} onChange={e => setData({...data, aboutMissionChecklistEn: e.target.value.split('\n')})} />
              </div>
            </div>
          </div>

          {/* Vision */}
          <div style={{ ...cardStyle, borderColor: 'rgba(139,92,246,0.15)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#a78bfa', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiEye size={16} /> الرؤية
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>العنوان (عربي)</label>
                <input style={inputStyle} value={data.aboutVisionTitleAr} onChange={e => setData({...data, aboutVisionTitleAr: e.target.value})} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>العنوان (إنجليزي)</label>
                <input style={inputStyle} value={data.aboutVisionTitleEn} onChange={e => setData({...data, aboutVisionTitleEn: e.target.value})} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>الوصف (عربي)</label>
                <textarea style={{...inputStyle, height: '80px'}} value={data.aboutVisionDescAr} onChange={e => setData({...data, aboutVisionDescAr: e.target.value})} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>الوصف (إنجليزي)</label>
                <textarea style={{...inputStyle, height: '80px'}} value={data.aboutVisionDescEn} onChange={e => setData({...data, aboutVisionDescEn: e.target.value})} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>قائمة الأهداف (عربي) — سطر لكل عنصر</label>
                <textarea style={{...inputStyle, height: '70px'}} value={(data.aboutVisionChecklistAr || []).join('\n')} onChange={e => setData({...data, aboutVisionChecklistAr: e.target.value.split('\n')})} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>قائمة الأهداف (إنجليزي) — سطر لكل عنصر</label>
                <textarea style={{...inputStyle, height: '70px'}} value={(data.aboutVisionChecklistEn || []).join('\n')} onChange={e => setData({...data, aboutVisionChecklistEn: e.target.value.split('\n')})} />
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Pillars */}
      <CollapsibleSection title="ركائز القوة (Pillars)" icon={FiStar} defaultOpen={false}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {(data.aboutPillars || []).map((pillar, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, fontSize: '11px' }}>عنوان عربي</label>
                  <input style={inputStyle} value={pillar.titleAr} onChange={e => {
                    const newP = [...data.aboutPillars]; newP[i] = {...newP[i], titleAr: e.target.value}; setData({...data, aboutPillars: newP});
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, fontSize: '11px' }}>عنوان إنجليزي</label>
                  <input style={inputStyle} value={pillar.titleEn} onChange={e => {
                    const newP = [...data.aboutPillars]; newP[i] = {...newP[i], titleEn: e.target.value}; setData({...data, aboutPillars: newP});
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, fontSize: '11px' }}>وصف عربي</label>
                  <textarea style={{...inputStyle, height: '50px'}} value={pillar.descAr} onChange={e => {
                    const newP = [...data.aboutPillars]; newP[i] = {...newP[i], descAr: e.target.value}; setData({...data, aboutPillars: newP});
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, fontSize: '11px' }}>وصف إنجليزي</label>
                  <textarea style={{...inputStyle, height: '50px'}} value={pillar.descEn} onChange={e => {
                    const newP = [...data.aboutPillars]; newP[i] = {...newP[i], descEn: e.target.value}; setData({...data, aboutPillars: newP});
                  }} />
                </div>
              </div>
              <input style={{...inputStyle}} placeholder="الأيقونة (مثل: Cpu, Shield)" value={pillar.iconKey} onChange={e => {
                const newP = [...data.aboutPillars]; newP[i] = {...newP[i], iconKey: e.target.value}; setData({...data, aboutPillars: newP});
              }} />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* About CTA */}
      <CollapsibleSection title="دعوة الإجراء (CTA)" icon={FiLayout} defaultOpen={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={labelStyle}>العنوان (عربي)</label>
            <input style={inputStyle} value={data.aboutCtaTitleAr} onChange={e => setData({...data, aboutCtaTitleAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>العنوان (إنجليزي)</label>
            <input style={inputStyle} value={data.aboutCtaTitleEn} onChange={e => setData({...data, aboutCtaTitleEn: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>الوصف (عربي)</label>
            <input style={inputStyle} value={data.aboutCtaSubtitleAr} onChange={e => setData({...data, aboutCtaSubtitleAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>الوصف (إنجليزي)</label>
            <input style={inputStyle} value={data.aboutCtaSubtitleEn} onChange={e => setData({...data, aboutCtaSubtitleEn: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>نص الزر (عربي)</label>
            <input style={inputStyle} value={data.aboutCtaBtnAr} onChange={e => setData({...data, aboutCtaBtnAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>نص الزر (إنجليزي)</label>
            <input style={inputStyle} value={data.aboutCtaBtnEn} onChange={e => setData({...data, aboutCtaBtnEn: e.target.value})} />
          </div>
        </div>
      </CollapsibleSection>

      <SaveButton onClick={saveChanges} processing={processing} />
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// PRICING PAGE CMS
// ═══════════════════════════════════════════════════════════
function PricingCMS() {
  const { settings, syncSettings } = useCMSStore();
  const [data, setData] = useState({ ...settings });
  const [processing, setProcessing] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);

  const saveChanges = async () => {
    setProcessing(true);
    const res = await syncSettings(data);
    if (res?.success) {
      toast.success('✅ تم تحديث صفحة الأسعار بنجاح', {
        style: { background: '#0f172a', color: '#fff', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)' },
      });
    } else {
      toast.error(res?.error === 'Unauthorized' ? '❌ خطأ: غير مصرح لك' : '❌ فشل الاتصال بالخادم');
    }
    setProcessing(false);
  };

  const planColors = { free: '#6366f1', pro: '#f59e0b', business: '#10b981' };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '8px' }}>

      {/* Pricing Hero */}
      <CollapsibleSection title="عنوان صفحة الأسعار (Hero)" icon={FiLayout}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={labelStyle}>التسمية (عربي)</label>
            <input style={inputStyle} value={data.pricingHeroLabelAr} onChange={e => setData({...data, pricingHeroLabelAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>التسمية (إنجليزي)</label>
            <input style={inputStyle} value={data.pricingHeroLabelEn} onChange={e => setData({...data, pricingHeroLabelEn: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>العنوان (عربي) - يدعم HTML</label>
            <textarea style={{...inputStyle, height: '70px'}} value={data.pricingHeroTitleAr} onChange={e => setData({...data, pricingHeroTitleAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>العنوان (إنجليزي) - يدعم HTML</label>
            <textarea style={{...inputStyle, height: '70px'}} value={data.pricingHeroTitleEn} onChange={e => setData({...data, pricingHeroTitleEn: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>الوصف (عربي)</label>
            <textarea style={{...inputStyle, height: '70px'}} value={data.pricingHeroSubtitleAr} onChange={e => setData({...data, pricingHeroSubtitleAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>الوصف (إنجليزي)</label>
            <textarea style={{...inputStyle, height: '70px'}} value={data.pricingHeroSubtitleEn} onChange={e => setData({...data, pricingHeroSubtitleEn: e.target.value})} />
          </div>
        </div>
      </CollapsibleSection>

      {/* Pricing Plans */}
      <CollapsibleSection title="خطط الأسعار" icon={FiDollarSign}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(data.pricingPlans || []).map((plan, i) => {
            const isExpanded = expandedPlan === i;
            const planColor = planColors[plan.id] || '#6366f1';
            return (
              <div key={plan.id} style={{
                ...cardStyle,
                borderColor: isExpanded ? `${planColor}40` : 'rgba(255,255,255,0.04)',
                transition: 'border-color 0.3s',
              }}>
                {/* Plan Header */}
                <button
                  onClick={() => setExpandedPlan(isExpanded ? null : i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
                    fontFamily: 'inherit', textAlign: 'right',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: `${planColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FiDollarSign size={18} color={planColor} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>{plan.nameAr} / {plan.nameEn}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                      {plan.currencyEn}{plan.price} {plan.periodEn}
                      {plan.popular && <span style={{ marginRight: '8px', color: '#f59e0b', fontWeight: 700 }}>⭐ الأكثر شعبية</span>}
                    </div>
                  </div>
                  {isExpanded ? <FiChevronUp size={18} color="#64748b" /> : <FiChevronDown size={18} color="#64748b" />}
                </button>

                {/* Plan Details */}
                {isExpanded && (
                  <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>اسم الخطة (عربي)</label>
                        <input style={inputStyle} value={plan.nameAr} onChange={e => {
                          const newP = [...data.pricingPlans]; newP[i] = {...newP[i], nameAr: e.target.value}; setData({...data, pricingPlans: newP});
                        }} />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>اسم الخطة (إنجليزي)</label>
                        <input style={inputStyle} value={plan.nameEn} onChange={e => {
                          const newP = [...data.pricingPlans]; newP[i] = {...newP[i], nameEn: e.target.value}; setData({...data, pricingPlans: newP});
                        }} />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>السعر</label>
                        <input style={inputStyle} value={plan.price} onChange={e => {
                          const newP = [...data.pricingPlans]; newP[i] = {...newP[i], price: e.target.value}; setData({...data, pricingPlans: newP});
                        }} />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>العملة (إنجليزي)</label>
                        <input style={inputStyle} value={plan.currencyEn} onChange={e => {
                          const newP = [...data.pricingPlans]; newP[i] = {...newP[i], currencyEn: e.target.value}; setData({...data, pricingPlans: newP});
                        }} />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>الوصف (عربي)</label>
                        <input style={inputStyle} value={plan.descriptionAr} onChange={e => {
                          const newP = [...data.pricingPlans]; newP[i] = {...newP[i], descriptionAr: e.target.value}; setData({...data, pricingPlans: newP});
                        }} />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>الوصف (إنجليزي)</label>
                        <input style={inputStyle} value={plan.descriptionEn} onChange={e => {
                          const newP = [...data.pricingPlans]; newP[i] = {...newP[i], descriptionEn: e.target.value}; setData({...data, pricingPlans: newP});
                        }} />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>نص الزر (عربي)</label>
                        <input style={inputStyle} value={plan.ctaAr} onChange={e => {
                          const newP = [...data.pricingPlans]; newP[i] = {...newP[i], ctaAr: e.target.value}; setData({...data, pricingPlans: newP});
                        }} />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>نص الزر (إنجليزي)</label>
                        <input style={inputStyle} value={plan.ctaEn} onChange={e => {
                          const newP = [...data.pricingPlans]; newP[i] = {...newP[i], ctaEn: e.target.value}; setData({...data, pricingPlans: newP});
                        }} />
                      </div>
                    </div>

                    {/* Features List */}
                    <div>
                      <label style={{ ...labelStyle, marginBottom: '12px' }}>المميزات</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {plan.features.map((feat, fi) => (
                          <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                              onClick={() => {
                                const newP = [...data.pricingPlans];
                                const newFeats = [...newP[i].features];
                                newFeats[fi] = {...newFeats[fi], included: !newFeats[fi].included};
                                newP[i] = {...newP[i], features: newFeats};
                                setData({...data, pricingPlans: newP});
                              }}
                              style={{
                                width: '28px', height: '28px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: feat.included ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)',
                                color: feat.included ? '#34d399' : '#f87171',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}
                            >
                              {feat.included ? <FiCheck size={14} /> : <FiX size={14} />}
                            </button>
                            <input style={{...inputStyle, flex: 1}} placeholder="عربي" value={feat.textAr} onChange={e => {
                              const newP = [...data.pricingPlans];
                              const newFeats = [...newP[i].features];
                              newFeats[fi] = {...newFeats[fi], textAr: e.target.value};
                              newP[i] = {...newP[i], features: newFeats};
                              setData({...data, pricingPlans: newP});
                            }} />
                            <input style={{...inputStyle, flex: 1}} placeholder="إنجليزي" value={feat.textEn} onChange={e => {
                              const newP = [...data.pricingPlans];
                              const newFeats = [...newP[i].features];
                              newFeats[fi] = {...newFeats[fi], textEn: e.target.value};
                              newP[i] = {...newP[i], features: newFeats};
                              setData({...data, pricingPlans: newP});
                            }} />
                            <button onClick={() => {
                              const newP = [...data.pricingPlans];
                              const newFeats = newP[i].features.filter((_, idx) => idx !== fi);
                              newP[i] = {...newP[i], features: newFeats};
                              setData({...data, pricingPlans: newP});
                            }} style={{ background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#f87171' }}>
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => {
                          const newP = [...data.pricingPlans];
                          const newFeats = [...newP[i].features, { textAr: '', textEn: '', included: true }];
                          newP[i] = {...newP[i], features: newFeats};
                          setData({...data, pricingPlans: newP});
                        }} style={{
                          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                          borderRadius: '8px', border: '1px dashed rgba(99,102,241,0.2)',
                          background: 'rgba(99,102,241,0.03)', color: '#a5b4fc', cursor: 'pointer',
                          fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
                        }}>
                          <FiPlus size={14} /> إضافة ميزة
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* FAQ */}
      <CollapsibleSection title="الأسئلة الشائعة (FAQ)" icon={FiHelpCircle} defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(data.pricingFAQ || []).map((faq, i) => (
            <div key={i} style={{ ...cardStyle, display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input style={inputStyle} placeholder="السؤال (عربي)" value={faq.questionAr} onChange={e => {
                  const newF = [...data.pricingFAQ]; newF[i] = {...newF[i], questionAr: e.target.value}; setData({...data, pricingFAQ: newF});
                }} />
                <input style={inputStyle} placeholder="السؤال (إنجليزي)" value={faq.questionEn} onChange={e => {
                  const newF = [...data.pricingFAQ]; newF[i] = {...newF[i], questionEn: e.target.value}; setData({...data, pricingFAQ: newF});
                }} />
                <textarea style={{...inputStyle, height: '60px'}} placeholder="الجواب (عربي)" value={faq.answerAr} onChange={e => {
                  const newF = [...data.pricingFAQ]; newF[i] = {...newF[i], answerAr: e.target.value}; setData({...data, pricingFAQ: newF});
                }} />
                <textarea style={{...inputStyle, height: '60px'}} placeholder="الجواب (إنجليزي)" value={faq.answerEn} onChange={e => {
                  const newF = [...data.pricingFAQ]; newF[i] = {...newF[i], answerEn: e.target.value}; setData({...data, pricingFAQ: newF});
                }} />
              </div>
              <button onClick={() => {
                const newF = data.pricingFAQ.filter((_, idx) => idx !== i);
                setData({...data, pricingFAQ: newF});
              }} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#f87171', flexShrink: 0 }}>
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
          <button onClick={() => {
            setData({...data, pricingFAQ: [...(data.pricingFAQ || []), { questionAr: '', questionEn: '', answerAr: '', answerEn: '' }]});
          }} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
            borderRadius: '10px', border: '1px dashed rgba(16,185,129,0.3)',
            background: 'rgba(16,185,129,0.05)', color: '#6ee7b7', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
          }}>
            <FiPlus size={16} /> إضافة سؤال جديد
          </button>
        </div>
      </CollapsibleSection>

      {/* Pricing CTA */}
      <CollapsibleSection title="دعوة الإجراء (CTA)" icon={FiLayout} defaultOpen={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={labelStyle}>العنوان (عربي)</label>
            <input style={inputStyle} value={data.pricingCtaTitleAr} onChange={e => setData({...data, pricingCtaTitleAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>العنوان (إنجليزي)</label>
            <input style={inputStyle} value={data.pricingCtaTitleEn} onChange={e => setData({...data, pricingCtaTitleEn: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>الوصف (عربي)</label>
            <input style={inputStyle} value={data.pricingCtaSubtitleAr} onChange={e => setData({...data, pricingCtaSubtitleAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>الوصف (إنجليزي)</label>
            <input style={inputStyle} value={data.pricingCtaSubtitleEn} onChange={e => setData({...data, pricingCtaSubtitleEn: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>نص الزر (عربي)</label>
            <input style={inputStyle} value={data.pricingCtaBtnAr} onChange={e => setData({...data, pricingCtaBtnAr: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>نص الزر (إنجليزي)</label>
            <input style={inputStyle} value={data.pricingCtaBtnEn} onChange={e => setData({...data, pricingCtaBtnEn: e.target.value})} />
          </div>
        </div>
      </CollapsibleSection>

      <SaveButton onClick={saveChanges} processing={processing} />
    </div>
  );
}
