import { create } from 'zustand';

interface AppState {
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  currentSiteFilter: number | null;
  setSiteFilter: (siteId: number | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: navigator.onLine,
  setOnline: (online) => set({ isOnline: online }),
  currentSiteFilter: null,
  setSiteFilter: (siteId) => set({ currentSiteFilter: siteId }),
}));

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useAppStore.getState().setOnline(true));
  window.addEventListener('offline', () => useAppStore.getState().setOnline(false));
}
