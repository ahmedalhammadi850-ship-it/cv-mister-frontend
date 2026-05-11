import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiSend, FiMessageCircle, FiShield } from 'react-icons/fi';
import useStyleStore from '../../store/useStyleStore';
import useCMSStore from '../../store/useCMSStore';

export default function Footer() {
  const language = useStyleStore((s) => s.language);
  const isAr = language === 'ar';
  const cmsSettings = useCMSStore((s) => s.settings);

  // Fallback settings if store is not populated yet
  const footerData = {
    description: isAr 
      ? cmsSettings.heroSubtitleAr || 'أفضل منصة في العالم العربي لإنشاء سير ذاتية احترافية مدعومة بالذكاء الاصطناعي.'
      : cmsSettings.heroSubtitleEn || 'The leading platform in the Arab world for building professional, AI-powered resumes.',
    socials: {
      telegram: cmsSettings.socialTelegram || 'https://t.me/cvmister',
      whatsapp: cmsSettings.socialWhatsapp || 'https://wa.me/1234567890',
      facebook: 'https://facebook.com/cvmister' // Optional: could add this to CMS too if needed
    },
    copyright: isAr ? (cmsSettings.copyrightAr || 'جميع الحقوق محفوظة') : (cmsSettings.copyrightEn || 'All rights reserved'),
    year: new Date().getFullYear()
  };

  return (
    <footer style={{
      background: '#020617', // Slate-950
      borderTop: '1px solid #1e293b', // Slate-800
      padding: '64px 24px 32px',
      color: '#94a3b8',
      fontFamily: "inherit",
      marginTop: 'auto'
    }}>
      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr; gap: 32px; text-align: center; }
          .footer-logo-col { align-items: center; }
          .footer-social-col { justify-content: center; }
        }
        
        .footer-link {
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .footer-link:hover {
          color: #818cf8; /* Indigo-400 */
          transform: translateX(${isAr ? '-4px' : '4px'});
        }
        @media (max-width: 640px) {
          .footer-link { justify-content: center; }
          .footer-link:hover { transform: translateY(-2px); }
        }

        .social-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justifyContent: center;
          color: #94a3b8;
          transition: all 0.2s;
          text-decoration: none;
        }
        .social-icon:hover {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.4);
          color: #818cf8;
          transform: translateY(-3px);
        }
      `}</style>

      <div className="footer-grid">
        {/* Col 1: Brand & Desc */}
        <div className="footer-logo-col" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(99,102,241,0.3)'
            }}>
              <FiShield size={16} color="#fff" />
            </div>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              CV-Mister
            </span>
          </div>
          <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#64748b', textAlign: 'center', maxWidth: '300px' }}>
            {footerData.description}
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
            {isAr ? 'روابط سريعة' : 'Quick Links'}
          </h4>
          <Link to="/" className="footer-link" style={{ justifyContent: 'center' }}>{isAr ? 'الرئيسية' : 'Home'}</Link>
          <Link to="/pricing" className="footer-link" style={{ justifyContent: 'center' }}>{isAr ? 'الأسعار والباقات' : 'Pricing'}</Link>
          <Link to="/about" className="footer-link" style={{ justifyContent: 'center' }}>{isAr ? 'من نحن' : 'About Us'}</Link>
          <Link to="/login" className="footer-link" style={{ justifyContent: 'center' }}>{isAr ? 'تسجيل الدخول' : 'Login'}</Link>
        </div>

        {/* Col 3: Support */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
            {isAr ? 'الدعم الفني' : 'Support'}
          </h4>
          <Link to="/contact" className="footer-link" style={{ justifyContent: 'center' }}>{isAr ? 'اتصل بنا' : 'Contact Us'}</Link>
        </div>

      </div>

      {/* ── Bottom Section (Copyright & Yemen) ─────────────────────── */}
      <div style={{
        maxWidth: '1200px', margin: '64px auto 0', paddingTop: '24px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
      }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.02em' }}>
          صنع بكل حب في اليمن 🇾🇪
        </div>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          &copy; {footerData.year} CV-Mister. {footerData.copyright}.
        </div>
      </div>
    </footer>
  );
}
