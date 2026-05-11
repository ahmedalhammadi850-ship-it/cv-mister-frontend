// ============================================================
// CV-Mister — PWA Install Hook
// Captures the beforeinstallprompt event and provides
// an installApp() function to trigger the native install prompt.
//
// IMPORTANT — Replit iframe limitation:
//   The beforeinstallprompt event does NOT fire inside Replit's
//   iframe preview (browser security restriction). It WILL work
//   when the app is accessed via its deployed URL directly.
// ============================================================

import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled]     = useState(false);
  const [isInstalling, setIsInstalling]   = useState(false);

  useEffect(() => {
    // Detect if already installed (standalone mode)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    const handlePrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    setIsInstalling(true);
    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  return {
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    isInstalling,
    installApp,
  };
}
