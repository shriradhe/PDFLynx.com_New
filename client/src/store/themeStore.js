import { create } from 'zustand';

const THEME_STORAGE_KEY = 'pdflynx-theme';

const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getStoredTheme = () => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : null;
};

const applyThemeClass = (theme) => {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const useThemeStore = create((set) => ({
  theme: getStoredTheme() || getSystemTheme(),
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyThemeClass(newTheme);

    return { theme: newTheme };
  }),
  initTheme: () => {
    const theme = getStoredTheme() || getSystemTheme();
    applyThemeClass(theme);
    set({ theme });
  }
}));

export default useThemeStore;
