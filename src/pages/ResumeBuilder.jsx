// ============================================================
// CV-Mister — ResumeBuilder Page
// Main builder interface
// ============================================================

import React, { useEffect, useRef, useCallback, useState, useDeferredValue } from 'react';
import FormPanel from '../components/Builder/FormPanel';
import TemplateSwitcher from '../components/Builder/TemplateSwitcher';
import StyleSidebar from '../components/Builder/StyleSidebar';
import A4PageWrapper from '../components/Resume/A4PageWrapper';
import ErrorBoundary from '../components/Common/ErrorBoundary';
import useResumeStore from '../store/useResumeStore';
import useStyleStore from '../store/useStyleStore';
import { t } from '../utils/locales';
import PaymentModal from '../components/Builder/PaymentModal';
import toast from 'react-hot-toast';

export default function ResumeBuilder() {
  const saveToBackend = useResumeStore((s) => s.saveToBackend);
  const saveStatus = useResumeStore((s) => s.saveStatus);
  const data = useResumeStore((s) => s.data);
  const language = useStyleStore((s) => s.language);
  const getCssVars = useStyleStore((s) => s.getCssVars);
  const cssVars = getCssVars();

  // Optimization: useDeferredValue keeps input UI snappy 
  const deferredData = useDeferredValue(data);

  const [activeTab, setActiveTab] = useState('content');

  const debounceRef = useRef(null);
  const handleAutoSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveToBackend();
    }, 5000);
  }, [saveToBackend]);

  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    const handleCreditsExhausted = () => {
      toast.error(language === 'ar' 
        ? 'رصيدك من السير الذاتية قد نفد. يرجى الدفع لإضافة المزيد.' 
        : 'Your resume credits have been exhausted. Please pay to add more.');
      setPaymentModalOpen(true);
    };

    const handleLimitReached = (e) => {
      toast.error(e.detail || (language === 'ar' ? 'تم تجاوز الحد المسموح' : 'Limit reached'));
      setPaymentModalOpen(true);
    };

    window.addEventListener('credits-exhausted', handleCreditsExhausted);
    window.addEventListener('subscription-limit', handleLimitReached);

    return () => {
      window.removeEventListener('credits-exhausted', handleCreditsExhausted);
      window.removeEventListener('subscription-limit', handleLimitReached);
    };
  }, [language]);

  useEffect(() => {
    if (saveStatus === 'unsaved') {
      handleAutoSave();
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [data, saveStatus, handleAutoSave]);

  return (
    <div className="builder-layout animate-fade-in" style={{ marginTop: '0', ...cssVars }}>
      {/* Left Panel: Form + Templates + Style */}
      <div className="form-panel">
        <ErrorBoundary>
          {/* Tabs */}
          <div className="builder-tabs-container">
            {[
              { id: 'content', label: t('tab_content', language), icon: '📝' },
              { id: 'template', label: t('tab_template', language), icon: '🎨' },
              { id: 'style', label: t('tab_style', language), icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`builder-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === 'content' && <FormPanel />}
            {activeTab === 'template' && <TemplateSwitcher />}
            {activeTab === 'style' && <StyleSidebar />}
          </div>
        </ErrorBoundary>
      </div>

      {/* Right Panel: Live Preview */}
      <div className="preview-panel">
        <ErrorBoundary>
          <A4PageWrapper deferredData={deferredData} />
        </ErrorBoundary>
      </div>
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} />
    </div>
  );
}
