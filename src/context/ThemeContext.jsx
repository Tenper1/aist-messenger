import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';

const STORAGE_KEY = 'aist_theme';

const themes = {
  system: {
    id: 'system',
    label: 'Как в системе',
    // resolved in effectiveId
  },
  light: {
    id: 'light',
    label: 'Светлая',
    pageBg: '#f4f4f5',
    text: '#000000',
    textMuted: '#707579',
    cardBg: '#ffffff',
    cardBorder: '#e4e4e4',
    inputBg: '#ffffff',
    inputBorder: '#e4e4e4',
    accent: '#0088cc',
    accentText: '#ffffff',
    headerBg: '#ffffff',
    sidebarBg: '#f4f4f5',
    border: '#e4e4e4',
    bubbleIn: '#ffffff',
    bubbleOut: '#effdde',
  },
  dark: {
    id: 'dark',
    label: 'Тёмная',
    pageBg: '#0e1621',
    text: '#ffffff',
    textMuted: '#8b9198',
    cardBg: '#17212b',
    cardBorder: '#242f3d',
    inputBg: '#242f3d',
    inputBorder: '#242f3d',
    accent: '#5288c1',
    accentText: '#ffffff',
    headerBg: '#17212b',
    sidebarBg: '#0e1621',
    border: '#242f3d',
    bubbleIn: '#182533',
    bubbleOut: '#2b5278',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeIdState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'light';
    } catch {
      return 'light';
    }
  });
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const m = window.matchMedia('(prefers-color-scheme: dark)');
    const fn = () => setSystemDark(m.matches);
    m.addEventListener('change', fn);
    return () => m.removeEventListener('change', fn);
  }, []);

  const effectiveId = themeId === 'system' ? (systemDark ? 'dark' : 'light') : themeId;
  const theme = themes[effectiveId] || themes.light;

  useEffect(() => {
    document.body.style.background = theme.pageBg;
    document.body.style.color = theme.text;
  }, [theme.pageBg, theme.text]);

  const setThemeId = (id) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  };

  const themeList = useMemo(
    () => [
      { id: 'system', label: 'Как в системе' },
      { id: 'light', label: 'Светлая' },
      { id: 'dark', label: 'Тёмная' },
    ],
    []
  );

  const value = useMemo(
    () => ({
      themeId,
      setThemeId,
      theme,
      themeList,
      isDark: effectiveId === 'dark',
    }),
    [themeId, theme, themeList, effectiveId]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
