import { useState, useEffect } from 'react';

export function useOfflineSync(storageKeyPrefix: string = 'cognitive_draft_') {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [showStatusBanner, setShowStatusBanner] = useState<boolean>(false);
  const [bannerMessage, setBannerMessage] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setBannerMessage('Connection restored — your progress is synchronizing.');
      setShowStatusBanner(true);
      const timer = setTimeout(() => setShowStatusBanner(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setBannerMessage('Connection lost — your code and progress are safely preserved locally.');
      setShowStatusBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveLocalDraft = (key: string, content: string) => {
    try {
      localStorage.setItem(`${storageKeyPrefix}${key}`, content);
      const timeStr = new Date().toLocaleTimeString();
      setLastSaved(timeStr);
    } catch (e) {
      console.warn('Unable to persist draft to localStorage', e);
    }
  };

  const loadLocalDraft = (key: string): string | null => {
    try {
      return localStorage.getItem(`${storageKeyPrefix}${key}`);
    } catch (e) {
      return null;
    }
  };

  const clearLocalDraft = (key: string) => {
    try {
      localStorage.removeItem(`${storageKeyPrefix}${key}`);
    } catch (e) {
      // ignore
    }
  };

  return {
    isOnline,
    showStatusBanner,
    bannerMessage,
    lastSaved,
    saveLocalDraft,
    loadLocalDraft,
    clearLocalDraft
  };
}
