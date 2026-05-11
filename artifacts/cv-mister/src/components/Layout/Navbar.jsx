// ============================================================
// CV-Mister — Navbar
// Premium SaaS navigation with dark mode toggle
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, RotateCcw, Sun, Moon, Menu, X, 
  ChevronLeft, ChevronRight, User, LogOut, Loader2, Globe, MonitorDown
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { saveAs } from 'file-saver';
import { t } from '../../utils/locales';
import useResumeStore from '../../store/useResumeStore';
import useStyleStore from '../../store/useStyleStore';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import { API_ROUTES } from '../../api/config';

export default function Navbar() {
  const { saveStatus, resetData } = useResumeStore();
  const { language, setLanguage, resetStyles } = useStyleStore();
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { canInstall, isInstalling, installApp } = usePWAInstall();
  const location = useLocation();
  const navigate = useNavigate();

  const isBuilder = location.pathname.startsWith('/builder');
  const isAr = language === 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apply dark class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading(isAr ? 'جاري تصدير ملف PDF عالي الجودة...' : 'Generating high-quality PDF...');
    try {
      // 1. Force Save to Backend to ensure metadata is updated
      const styleState = useStyleStore.getState();
      await useResumeStore.getState().saveToBackend(styleState);

      // 2. Capture the actual HTML from the preview
      const previewElement = document.getElementById('resume-preview-root');
      if (!previewElement) throw new Error('Preview element not found');

      // Clone and clean up
      const clone = previewElement.cloneNode(true);
      clone.querySelectorAll('.no-print').forEach(el => el.remove());

      // Get CSS variables to inject them into the HTML wrapper
      const cssVars = styleState.getCssVars();
      const cssVarsString = Object.entries(cssVars)
        .map(([k, v]) => `${k}: ${v};`)
        .join(' ');

      // Collect all internal stylesheets to ensure templates and layout styles are included
      let allStyles = '';
      try {
        for (let sheet of document.styleSheets) {
          try {
            for (let rule of sheet.cssRules) {
              allStyles += rule.cssText + '\n';
            }
          } catch(e) {
            // Ignore CORS issues for external sheets
          }
        }
      } catch (e) {
        console.warn('Could not extract all styles', e);
      }

      // Determine the correct font family for export
      const exportFontFamily = isAr 
        ? "'Readex Pro', 'IBM Plex Sans Arabic', 'Cairo', 'Tajawal', sans-serif"
        : "'Inter', 'Roboto', sans-serif";

      // Prepare the full HTML package with exact CSS and Fonts
      const resumeHtml = `
<!DOCTYPE html>
<html lang="${language}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Cairo:wght@400;600;700&family=Almarai:wght@300;400;700;800&family=Readex+Pro:wght@200;300;400;500;600;700&family=Tajawal:wght@300;400;500;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      ${cssVarsString}
      --global-font: ${exportFontFamily};
    }
    ${allStyles}
    
    /* Print optimizations to ensure exact match */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page { size: A4; margin: 0; }
    html, body {
      margin: 0;
      padding: 0;
      background: white !important;
      font-family: ${exportFontFamily} !important;
      direction: ${isAr ? 'rtl' : 'ltr'};
    }
    .a4-page-wrapper {
      box-shadow: none !important;
      margin: 0 !important;
      border: none !important;
    }
    /* Force correct font on ALL resume elements */
    h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, a, label,
    .resume-heading, .section-title, .resume-name, .resume-body,
    .resume-section, .section-title-text, .experience-item,
    .education-item, .project-item, .skill-bar-bg,
    [data-section], [data-section-key] {
      font-family: ${exportFontFamily} !important;
    }

    /* Cap font-weight for Arabic fonts which usually max out at 700 */
    [dir="rtl"] h1, [dir="rtl"] h2, [dir="rtl"] h3, [dir="rtl"] h4, [dir="rtl"] h5, [dir="rtl"] h6,
    [dir="rtl"] .section-title, [dir="rtl"] .resume-heading, [dir="rtl"] .resume-name {
      font-weight: 700 !important;
    }

    /* 🚨 CRITICAL FIX: Disable letter-spacing for Arabic text */
    /* Letter-spacing causes Arabic characters to disconnect, making them unreadable. */
    [dir="rtl"], [dir="rtl"] * {
      letter-spacing: normal !important;
    }
  </style>
</head>
<body>
  ${clone.innerHTML}
</body>
</html>
      `;
      const response = await fetch(API_ROUTES.GENERATE_PDF, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: resumeHtml }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errText}`);
      }

      const blob = await response.blob();
      saveAs(blob, `Resume-${Date.now()}.pdf`);
      toast.success(isAr ? 'تم التصدير بنجاح!' : 'Exported successfully!', { id: toastId });
    } catch (err) {
      console.error('[PDF Export Error]', err);
      toast.error(isAr ? 'فشل تصدير الملف' : 'Export failed', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm(t('confirm_logout', language))) {
      logout();
    }
  };

  const handleReset = () => {
    if (window.confirm(t('confirm_reset', language))) {
      resetData();
      resetStyles();
    }
  };

  const navLinks = [
    { to: '/', label: isAr ? 'الرئيسية' : 'Home' },
    { to: '/about', label: isAr ? 'من نحن' : 'About' },
    { to: '/pricing', label: isAr ? 'الأسعار' : 'Pricing' },
    { to: '/contact', label: isAr ? 'اتصل بنا' : 'Contact Us' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <motion.nav 
        className={`nav-bar no-print ${scrolled ? 'nav-scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="nav-inner">
          {/* Left: Back + Brand */}
          <div className="nav-left">
            {isBuilder && (
              <button onClick={() => navigate('/dashboard')} className="nav-back-btn">
                {isAr ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                <span className="nav-back-text">{isAr ? 'العودة' : 'Back'}</span>
              </button>
            )}
            <Link to="/" className="nav-brand">
              <motion.div 
                className="nav-logo-icon"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <FileText size={20} />
              </motion.div>
              <span className="nav-brand-text">CV-Mister</span>
            </Link>
          </div>

          {/* Center: Nav Links (desktop only, non-builder) */}
          {!isBuilder && (
            <div className="nav-center">
              {navLinks.map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className={`nav-link ${isActive(link.to) ? 'nav-link-active' : ''}`}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <motion.div 
                      className="nav-link-indicator"
                      layoutId="navIndicator"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Center: Save status (builder only) */}
          {isBuilder && (
            <div className="save-indicator">
              <div className={`save-dot ${saveStatus}`} />
              <span>
                {saveStatus === 'saved' 
                  ? (isAr ? 'تم حفظ التعديلات' : 'All changes saved') 
                  : saveStatus === 'saving' 
                  ? (isAr ? 'جاري الحفظ...' : 'Saving...') 
                  : (isAr ? 'هناك تعديلات غير محفوظة' : 'Unsaved changes')}
              </span>
            </div>
          )}

          {/* Right: Actions */}
          <div className="nav-right">
            {/* Language Picker */}
            <div className="nav-lang-picker">
              <Globe size={16} className="nav-lang-icon" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="nav-lang-select"
              >
                <option value="en">EN</option>
                <option value="ar">عربي</option>
              </select>
            </div>

            {/* PWA Install Button — only shown when browser fires beforeinstallprompt */}
            {canInstall && (
              <motion.button
                className="nav-action-btn nav-action-secondary"
                onClick={installApp}
                disabled={isInstalling}
                whileTap={{ scale: 0.9 }}
                title={isAr ? 'تثبيت التطبيق' : 'Install App'}
                aria-label={isAr ? 'تثبيت التطبيق' : 'Install App'}
              >
                <MonitorDown size={16} />
                <span className="nav-action-label">{isAr ? 'تثبيت' : 'Install'}</span>
              </motion.button>
            )}

            {/* Dark Mode Toggle */}
            <motion.button 
              className="nav-theme-toggle"
              onClick={toggleDarkMode}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              aria-label="Toggle dark mode"
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun size={18} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon size={18} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Builder Actions */}
            {isBuilder && (
              <>
                <button className="nav-action-btn nav-action-secondary" onClick={handleReset}>
                  <RotateCcw size={16} />
                  <span className="nav-action-label">{t('nav_reset', language)}</span>
                </button>
                <button className="nav-action-btn nav-action-primary" onClick={handleExport} disabled={isExporting}>
                  {isExporting ? (
                    <><Loader2 size={16} className="spin-icon" /> <span className="nav-action-label">{isAr ? 'جاري...' : 'Exporting...'}</span></>
                  ) : (
                    <><Download size={16} /> <span className="nav-action-label">{t('nav_export_pdf', language)}</span></>
                  )}
                </button>
              </>
            )}

            {/* Auth */}
            {user ? (
              <div className="nav-user-section">
                <Link 
                  to={user.email?.includes('ahmedyes') || user.fullName?.includes('ahmedyes') || user.username === 'ahmedyes' ? '/admin' : '/dashboard'} 
                  className="nav-user-info"
                  title={isAr ? 'لوحة التحكم' : 'Dashboard'}
                >
                  <User size={16} />
                  <span className="nav-user-name">{user.fullName}</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="nav-logout-btn" 
                  title={isAr ? 'تسجيل الخروج' : 'Logout'} 
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              !isBuilder && (
                <Link to="/login" className="nav-cta-btn">
                  {t('nav_login', language)}
                </Link>
              )
            )}

            {/* Mobile menu toggle */}
            {!isBuilder && (
              <button 
                className="nav-mobile-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && !isBuilder && (
          <motion.div 
            className="nav-mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="nav-mobile-panel"
              initial={{ x: isAr ? -300 : 300 }}
              animate={{ x: 0 }}
              exit={{ x: isAr ? -300 : 300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    to={link.to} 
                    className={`nav-mobile-link ${isActive(link.to) ? 'nav-mobile-link-active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {!user && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link 
                    to="/login" 
                    className="nav-mobile-cta"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav_login', language)}
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
