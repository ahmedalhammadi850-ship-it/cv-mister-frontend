import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useResumeStore from '../store/useResumeStore';
import A4PageWrapper from '../components/Resume/A4PageWrapper';
import useStyleStore from '../store/useStyleStore';

import { API_ROUTES } from '../api/config';

export default function PrintPage() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  
  const data = useResumeStore((state) => state.data);
  const getCssVars = useStyleStore((state) => state.getCssVars);
  const cssVars = getCssVars();

  const setData = useResumeStore((state) => state.setData);

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
          const loadedData = result.content || result.data || {};
          setData(loadedData);
          setLoading(false);
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
    return null; // Return null so nothing is printed while loading
  }

  return (
    <div className="print-container" style={{ ...cssVars, background: '#fff', margin: 0, padding: 0 }}>
      {/* 
        This is a clean page specifically for printing. 
        It has NO Navbar, NO Sidebar, NO Footer. 
      */}
      <A4PageWrapper deferredData={data} />
    </div>
  );
}
