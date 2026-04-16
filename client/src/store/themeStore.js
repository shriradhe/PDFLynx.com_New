import { create } from 'zustand';

const useThemeStore = create((set) => ({
  theme: localStorage.getItem('pdflynx-theme') || 'dark', // default to dark
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('pdflynx-theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return { theme: newTheme };
  }),
  initTheme: () => {
    const theme = localStorage.getItem('pdflynx-theme') || 'dark';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  }
}));

export default useThemeStore;
