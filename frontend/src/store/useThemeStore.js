import { create } from 'zustand';

const getInitialTheme = () => {
  try {
    return localStorage.getItem('nutripulse_theme') || 'system';
  } catch (e) {
    return 'system';
  }
};

const applyThemeToDOM = (theme) => {
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  return isDark;
};

export const useThemeStore = create((set, get) => {
  const initialTheme = getInitialTheme();
  const initialIsDark = applyThemeToDOM(initialTheme);

  // Set up OS theme change listener
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (get().theme === 'system') {
        const isDark = applyThemeToDOM('system');
        set({ isDark });
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemChange);
    }
  }

  return {
    theme: initialTheme, // 'light' | 'dark' | 'system'
    isDark: initialIsDark,

    setTheme: (newTheme) => {
      try {
        localStorage.setItem('nutripulse_theme', newTheme);
      } catch (e) {}

      const isDark = applyThemeToDOM(newTheme);
      set({ theme: newTheme, isDark });
    },
  };
});
