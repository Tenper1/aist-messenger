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
    pageBg:
      'radial-gradient(1400px 900px at 15% 5%, rgba(200, 230, 255, .5), transparent 50%),' +
      'radial-gradient(1000px 700px at 88% 15%, rgba(220, 200, 255, .4), transparent 50%),' +
      'linear-gradient(165deg, #e8eef7 0%, #f0f4fb 45%, #e6ecf5 100%)',
    text: 'rgba(20, 25, 45, .92)',
    textMuted: 'rgba(55, 75, 115, .85)',
    cardBg: 'rgba(255,255,255,.6)',
    cardBorder: 'rgba(255,255,255,.8)',
    inputBg: 'rgba(240, 248, 255, .7)',
    inputBorder: 'rgba(120, 160, 220, .25)',
    accent: 'linear-gradient(135deg, rgba(140, 200, 255, .9), rgba(180, 160, 255, .85))',
    accentText: 'rgba(20, 30, 55, .95)',
    headerBg: 'rgba(255,255,255,.5)',
    sidebarBg: 'rgba(255,255,255,.35)',
    border: 'rgba(100, 140, 200, .2)',
  },
  dark: {
    id: 'dark',
    label: 'Тёмная',
    pageBg:
      'radial-gradient(1200px 800px at 20% 10%, rgba(80, 140, 200, .25), transparent 55%),' +
      'radial-gradient(900px 700px at 85% 20%, rgba(140, 80, 200, .22), transparent 55%),' +
      'linear-gradient(135deg, #0f1419 0%, #131a24 40%, #0d1117 100%)',
    text: 'rgba(255,255,255,.92)',
    textMuted: 'rgba(255,255,255,.65)',
    cardBg: 'rgba(255,255,255,.08)',
    cardBorder: 'rgba(255,255,255,.14)',
    inputBg: 'rgba(15, 22, 35, .5)',
    inputBorder: 'rgba(255,255,255,.14)',
    accent: 'linear-gradient(135deg, rgba(140, 200, 255, .9), rgba(210, 170, 255, .85))',
    accentText: 'rgba(10, 15, 30, .95)',
    headerBg: 'rgba(255,255,255,.06)',
    sidebarBg: 'rgba(255,255,255,.04)',
    border: 'rgba(255,255,255,.12)',
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
