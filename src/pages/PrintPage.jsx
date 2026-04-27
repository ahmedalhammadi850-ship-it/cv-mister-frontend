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
  const setData = useResumeStore((state) => state.setData);
  const getCssVars = useStyleStore((state) => state.getCssVars);
  const cssVars = getCssVars();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cvId = params.get('id');

    if (cvId) {
      fetch(`${API_ROUTES.RESUMES}/${cvId}/public`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch public resume');
          return res.json();
        })
        .then(result => {
          const loadedData = result.content || result.data || {};
          setData(loadedData);
          setLoading(false);
          // تأخير بسيط للتأكد من أن React أنهى الرسم بالكامل
          setTimeout(() => setDataReady(true), 500);
        })
        .catch(err => {
          console.error('Error loading public resume:', err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [location.search, setData]);

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
