import { create } from 'zustand';
import { useEffect } from 'react';

interface AppState {
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  currentSiteFilter: number | null;
  setSiteFilter: (siteId: number | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  setOnline: (online) => set({ isOnline: online }),
  currentSiteFilter: null,
  setSiteFilter: (siteId) => set({ currentSiteFilter: siteId }),
}));

/** Call this hook once in App.tsx to register online/offline listeners */
export function useNetworkStatus() {
  useEffect(() => {
    const setOnline = useAppStore.getState().setOnline;
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
}
