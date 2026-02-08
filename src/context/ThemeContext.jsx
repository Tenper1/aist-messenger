import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';

const STORAGE_KEY = 'aist_theme';
const CHAT_BG_KEY = 'aist_chat_bg';

// Liquid Glass: мягкие градиенты, полупрозрачные карточки, размытие
const glassLight = {
  pageBg: 'linear-gradient(165deg, #e8eef7 0%, #f0f4fb 40%, #e2eaf5 100%)',
  text: 'rgba(15, 25, 45, .94)',
  textMuted: 'rgba(55, 70, 100, .82)',
  cardBg: 'rgba(255,255,255,.82)',
  cardBorder: 'rgba(255,255,255,.9)',
  inputBg: 'rgba(255,255,255,.92)',
  inputBorder: 'rgba(140, 180, 220, .28)',
  accent: '#0088cc',
  accentText: '#ffffff',
  headerBg: 'rgba(255,255,255,.9)',
  sidebarBg: 'rgba(248, 252, 255, .92)',
  border: 'rgba(160, 190, 230, .22)',
  bubbleIn: 'rgba(255,255,255,.98)',
  bubbleOut: 'rgba(0, 136, 204, .92)',
  tabBarBg: 'rgba(255,255,255,.92)',
};

const glassDark = {
  pageBg: 'linear-gradient(165deg, #0e1218 0%, #151b24 50%, #0f141a 100%)',
  text: 'rgba(255,255,255,.94)',
  textMuted: 'rgba(165, 180, 210, .75)',
  cardBg: 'rgba(26, 34, 48, .92)',
  cardBorder: 'rgba(255,255,255,.06)',
  inputBg: 'rgba(22, 30, 44, .95)',
  inputBorder: 'rgba(255,255,255,.1)',
  accent: '#6ab3f3',
  accentText: '#ffffff',
  headerBg: 'rgba(20, 28, 40, .95)',
  sidebarBg: 'rgba(18, 25, 36, .98)',
  border: 'rgba(255,255,255,.08)',
  bubbleIn: 'rgba(38, 48, 68, .95)',
  bubbleOut: 'rgba(70, 130, 200, .92)',
  tabBarBg: 'rgba(20, 28, 40, .98)',
};

const themes = {
  system: { id: 'system', label: 'Как в системе' },
  light: { id: 'light', label: 'Светлая', ...glassLight },
  dark: { id: 'dark', label: 'Тёмная', ...glassDark },
};

const CHAT_BG_PRESETS = [
  { id: 'default', name: 'По умолчанию', value: '' },
  { id: 'gradient1', name: 'Мягкий градиент', value: 'linear-gradient(180deg, rgba(200,230,255,.15) 0%, transparent 50%)' },
  { id: 'gradient2', name: 'Тёплый', value: 'linear-gradient(180deg, rgba(255,230,200,.12) 0%, transparent 50%)' },
  { id: 'dots', name: 'Точки', value: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,.04) 1px, transparent 0); background-size: 24px 24px' },
  { id: 'telegram', name: 'Как в Telegram', value: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,.03) 1.5px, transparent 0); background-size: 28px 28px; background-color: rgba(0,0,0,.08)' },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeIdState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'light';
    } catch {
      return 'light';
    }
  });
  const [chatBg, setChatBgState] = useState(() => {
    try {
      return localStorage.getItem(CHAT_BG_KEY) || '';
    } catch {
      return '';
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
  const theme = { ...(themes[effectiveId] || themes.light), isDark: effectiveId === 'dark' };

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

  const setChatBg = (v) => {
    setChatBgState(v || '');
    try {
      if (v) localStorage.setItem(CHAT_BG_KEY, v);
      else localStorage.removeItem(CHAT_BG_KEY);
    } catch {}
  };

  const themeList = useMemo(() => [
    { id: 'system', label: 'Как в системе' },
    { id: 'light', label: 'Светлая' },
    { id: 'dark', label: 'Тёмная' },
  ], []);

  const value = useMemo(
    () => ({
      themeId,
      setThemeId,
      theme,
      themeList,
      isDark: theme.isDark,
      chatBg,
      setChatBg,
      chatBgPresets: CHAT_BG_PRESETS,
    }),
    [themeId, theme, themeList, chatBg]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
