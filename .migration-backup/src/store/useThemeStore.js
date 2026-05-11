// ============================================================
// CV-Mister — Theme Store (Zustand)
// Controls Dark/Light mode with localStorage persistence
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      darkMode: false, // Default to light mode

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (val) => set({ darkMode: val }),
    }),
    {
      name: 'cv-mister-theme',
    }
  )
);

export default useThemeStore;
