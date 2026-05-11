// ============================================================
// CV-Mister — CoverLetterBuilder Page
// Split-screen editor for cover letters
// ============================================================

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useResumeStore from '../store/useResumeStore';
import useCoverLetterStore from '../store/useCoverLetterStore';
import useStyleStore from '../store/useStyleStore';
import useAuthStore from '../store/useAuthStore';
import useCMSStore from '../store/useCMSStore';
import PaymentModal from '../components/Builder/PaymentModal';
import { t } from '../utils/locales';
import { motion } from 'framer-motion';
import { Wand2, Download } from 'lucide-react';

export default function CoverLetterBuilder() {
  const [searchParams] = useSearchParams();
  const resumeData = useResumeStore((s) => s.data);
  const { data, setField, generateDraft, setTemplate, saveToBackend, loadFromBackend, saveStatus } = useCoverLetterStore();
  const { language, accentColor } = useStyleStore();

  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAIFreeGlobally = useCMSStore((s) => s.settings?.isAIFreeGlobally);

  const letterId = searchParams.get('id');

  const checkProStatus = () => {
    if (isAIFreeGlobally || user?.plan === 'pro') return true;
    setPaymentModalOpen(true);
    return false;
  };

  useEffect(() => {
    if (letterId) {
      loadFromBackend(letterId);
    }
  }, [letterId]);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      saveToBackend();
    }, 2000);
    return () => clearTimeout(timer);
  }, [data]);

  const handleGenerate = () => {
    if (!checkProStatus()) return;
    generateDraft(resumeData.personalInfo?.jobTitle, resumeData.personalInfo?.fullName);
  };

  return (
    <div className="builder-layout animate-fade-in" style={{ marginTop: '0' }}>
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
        templateName="توليد مسودة بالذكاء الاصطناعي (AI Cover Letter)" 
      />
      {/* ── Left Side: Form ── */}
      <div className="form-panel">
        <div style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             ✉️ {language === 'ar' ? 'بيانات الرسالة' : 'Cover Letter Details'}
          </h2>

          <div style={{ display: 'grid', gap: '16px' }}>

            <button 
              className="btn-premium" 
              onClick={handleGenerate}
              style={{ width: '100%', marginBottom: '16px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}
            >
              <Wand2 size={16} /> {language === 'ar' ? 'توليد مسودة بالذكاء الاصطناعي' : 'Generate AI Draft'}
            </button>

            <div>
              <label className="form-label">{language === 'ar' ? 'اسم المستلم' : 'Recipient Name'}</label>
              <input 
                className="form-input" 
                value={data.recipientName} 
                onChange={(e) => setField('recipientName', e.target.value)} 
                placeholder="e.g. Hiring Manager"
              />
            </div>
            <div>
              <label className="form-label">{language === 'ar' ? 'اسم الشركة' : 'Company Name'}</label>
              <input 
                className="form-input" 
                value={data.companyName} 
                onChange={(e) => setField('companyName', e.target.value)} 
              />
            </div>
             <div>
              <label className="form-label">{language === 'ar' ? 'الموضوع' : 'Subject'}</label>
              <input 
                className="form-input" 
                value={data.subject} 
                onChange={(e) => setField('subject', e.target.value)} 
              />
            </div>
            <div>
              <label className="form-label">{language === 'ar' ? 'نص الرسالة' : 'Message Body'}</label>
              <textarea 
                className="form-input form-textarea" 
                style={{ minHeight: '300px' }}
                value={data.body} 
                onChange={(e) => setField('body', e.target.value)} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Side: Preview ── */}
      <div className="preview-panel">
        <div className="a4-page-outer">
          <div className="a4-page-content" style={{ padding: '20mm 20mm' }}>
            <div style={{ color: '#111827', fontFamily: language === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
              {/* Header: User Info */}
              <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '20pt', fontWeight: 700, color: accentColor }}>{resumeData.personalInfo?.fullName}</h1>
                <div style={{ fontSize: '10pt', color: '#666', marginTop: '4px' }}>
                  {resumeData.personalInfo?.email} • {resumeData.personalInfo?.phone}
                </div>
              </div>

              {/* Date & Recipient */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '10pt', marginBottom: '16px' }}>{data.date}</div>
                <div style={{ fontSize: '10pt', fontWeight: 600 }}>{data.recipientName}</div>
                <div style={{ fontSize: '10pt' }}>{data.companyName}</div>
              </div>

              {/* Subject */}
              {data.subject && (
                <div style={{ fontSize: '10pt', fontWeight: 700, marginBottom: '24px', textDecoration: 'underline' }}>
                   {language === 'ar' ? 'الموضوع: ' : 'Subject: '}{data.subject}
                </div>
              )}

              {/* Body */}
              <div style={{ 
                fontSize: '10.5pt', 
                lineHeight: 1.6, 
                whiteSpace: 'pre-line',
                color: '#333'
              }}>
                {data.body || (language === 'ar' ? 'نص الرسالة سيظهر هنا...' : 'The letter content will appear here...')}
              </div>

              {/* Sign off */}
              <div style={{ marginTop: '48px', fontSize: '10.5pt' }}>
                {language === 'ar' ? 'مع خالص التقدير،' : 'Sincerely,'}
                <div style={{ marginTop: '12px', fontWeight: 600 }}>{resumeData.personalInfo?.fullName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
