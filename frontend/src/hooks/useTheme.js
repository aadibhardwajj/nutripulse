import { useThemeStore } from '../store/useThemeStore';

export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = useThemeStore((state) => state.isDark);
  const setTheme = useThemeStore((state) => state.setTheme);

  return {
    theme,
    isDark,
    setTheme,
    isLight: !isDark,
  };
};

export default useTheme;
