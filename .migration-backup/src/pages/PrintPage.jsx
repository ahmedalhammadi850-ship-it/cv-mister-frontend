import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useResumeStore from '../store/useResumeStore';
import A4PageWrapper from '../components/Resume/A4PageWrapper';
import useStyleStore from '../store/useStyleStore';
import { API_ROUTES } from '../api/config';

export default function PrintPage() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);

  const data = useResumeStore((state) => state.data);
  const getCssVars = useStyleStore((state) => state.getCssVars);
  const cssVars = getCssVars();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cvId = params.get('id');

    if (cvId) {
      // Fetch CV data from the public backend endpoint
      fetch(`${API_ROUTES.RESUMES}/${cvId}/public`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch public resume');
          return res.json();
        })
        .then(result => {
          const metadata = result.metadata || {};
          const styleConfig = result.styleConfig || {};
          
          // 1. Sync Style Store
          useStyleStore.setState({
            template: result.templateId || 'professional',
            category: result.category || 'chronological',
            language: result.language || 'en',
            accentColor: styleConfig.accentColor || '#1E3A5F',
            nameFontSize: styleConfig.nameFontSize || 22,
            headingFontSize: styleConfig.headingFontSize || 14,
            bodyFontSize: styleConfig.bodyFontSize || 12,
            lineHeight: styleConfig.lineHeight || 1.5,
            headerAlign: styleConfig.headerAlign || 'left',
            marginTop: styleConfig.marginTop || 7,
            marginBottom: styleConfig.marginBottom || 20,
            marginSides: styleConfig.marginSides || 6,
            sectionGap: styleConfig.sectionGap || 16,
            columnFlowEnabled: styleConfig.columnFlowEnabled || false,
          });

          // 2. Sync Resume Store
          const loadedData = result.content || result.data || {};
          useResumeStore.setState({
            resumeId: result._id || result.id,
            data: loadedData,
            layoutColumns: metadata.layoutColumns || {
              columnSide: ['skills', 'languages', 'certificates', 'awards', 'references'],
              columnMain: ['header', 'summary', 'experience', 'education', 'projects', 'volunteering']
            },
            customTitles: metadata.customTitles || {},
            alignments: metadata.alignments || {},
            sectionsStyles: metadata.sectionsStyles || {},
            pageBreaks: metadata.pageBreaks || [],
            saveStatus: 'saved',
          });

          setLoading(false);
          setLoading(false);
          // تأخير بسيط للتأكد من أن React أنهى الرسم بالكامل وتحميل الخطوط
          setTimeout(() => setDataReady(true), 1000);
        })
        .catch(err => {
          console.error('Error loading public resume:', err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [location.search]);

  if (loading) {
    return null;
  }

  return (
    <div className="print-container" style={{ ...cssVars, background: '#fff', margin: 0, padding: 0 }}>
      <A4PageWrapper deferredData={data} />
      {/* هذا العنصر يظهر فقط بعد تحميل البيانات بالكامل — Puppeteer ينتظره */}
      {dataReady && <div id="pdf-ready" style={{ display: 'none' }} />}
    </div>
  );
}
