import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';

const STORAGE_KEY = 'aist_theme';
const CHAT_BG_KEY = 'aist_chat_bg';

// Liquid Glass Light - мягкий, чистый, с эффектом стекла
const liquidLight = {
  pageBg: 'linear-gradient(135deg, #f5f7fa 0%, #e8eef5 50%, #f0f4fb 100%)',
  text: 'rgba(20, 30, 50, .94)',
  textMuted: 'rgba(60, 75, 100, .75)',
  cardBg: 'rgba(255,255,255,.85)',
  cardBorder: 'rgba(255,255,255,.95)',
  inputBg: 'rgba(255,255,255,.9)',
  inputBorder: 'rgba(120, 160, 200, .25)',
  accent: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
  accentText: '#ffffff',
  headerBg: 'rgba(255,255,255,.88)',
  sidebarBg: 'rgba(250, 253, 255, .88)',
  border: 'rgba(150, 180, 220, .18)',
  bubbleIn: 'rgba(255,255,255,.95)',
  bubbleOut: 'rgba(10, 132, 255, .88)',
  tabBarBg: 'rgba(255,255,255,.88)',
  messageInputBg: 'rgba(255,255,255,.92)',
};

// Liquid Glass Dark - глубокий, с неоновыми акцентами
const liquidDark = {
  pageBg: 'linear-gradient(135deg, #0a0a12 0%, #0d1117 50%, #0a0a10 100%)',
  text: 'rgba(245, 247, 255, .94)',
  textMuted: 'rgba(150, 160, 185, .72)',
  cardBg: 'rgba(22, 27, 38, .82)',
  cardBorder: 'rgba(255,255,255,.08)',
  inputBg: 'rgba(30, 36, 50, .85)',
  inputBorder: 'rgba(255,255,255,.12)',
  accent: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
  accentText: '#ffffff',
  headerBg: 'rgba(22, 27, 38, .88)',
  sidebarBg: 'rgba(18, 22, 32, .88)',
  border: 'rgba(255,255,255,.08)',
  bubbleIn: 'rgba(35, 42, 55, .85)',
  bubbleOut: 'rgba(10, 132, 255, .82)',
  tabBarBg: 'rgba(22, 27, 38, .88)',
  messageInputBg: 'rgba(30, 36, 50, .88)',
};

// Midnight Blue - глубокий синий
const midnightBlue = {
  pageBg: 'linear-gradient(135deg, #0c1221 0%, #0f1629 50%, #0a0f1a 100%)',
  text: 'rgba(235, 245, 255, .94)',
  textMuted: 'rgba(140, 160, 190, .70)',
  cardBg: 'rgba(18, 26, 45, .85)',
  cardBorder: 'rgba(60, 100, 160, .15)',
  inputBg: 'rgba(28, 38, 60, .85)',
  inputBorder: 'rgba(80, 120, 180, .20)',
  accent: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  accentText: '#ffffff',
  headerBg: 'rgba(18, 26, 45, .88)',
  sidebarBg: 'rgba(15, 22, 40, .88)',
  border: 'rgba(60, 100, 160, .12)',
  bubbleIn: 'rgba(30, 42, 65, .85)',
  bubbleOut: 'rgba(59, 130, 246, .85)',
  tabBarBg: 'rgba(18, 26, 45, .88)',
  messageInputBg: 'rgba(28, 38, 60, .88)',
};

// Aurora - северное сияние
const aurora = {
  pageBg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  text: 'rgba(240, 245, 255, .94)',
  textMuted: 'rgba(160, 170, 200, .70)',
  cardBg: 'rgba(40, 35, 75, .82)',
  cardBorder: 'rgba(120, 80, 200, .15)',
  inputBg: 'rgba(55, 48, 95, .82)',
  inputBorder: 'rgba(140, 100, 220, .18)',
  accent: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  accentText: '#ffffff',
  headerBg: 'rgba(40, 35, 75, .88)',
  sidebarBg: 'rgba(35, 30, 65, .88)',
  border: 'rgba(120, 80, 200, .12)',
  bubbleIn: 'rgba(50, 42, 85, .85)',
  bubbleOut: 'rgba(240, 147, 251, .82)',
  tabBarBg: 'rgba(40, 35, 75, .88)',
  messageInputBg: 'rgba(55, 48, 95, .88)',
};

// Forest Green - лесной зелёный
const forestGreen = {
  pageBg: 'linear-gradient(135deg, #0d1f1a 0%, #143a30 50%, #0a1a14 100%)',
  text: 'rgba(235, 250, 245, .94)',
  textMuted: 'rgba(120, 180, 160, .70)',
  cardBg: 'rgba(20, 45, 38, .85)',
  cardBorder: 'rgba(60, 150, 120, .15)',
  inputBg: 'rgba(35, 65, 55, .85)',
  inputBorder: 'rgba(80, 170, 140, .18)',
  accent: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  accentText: '#ffffff',
  headerBg: 'rgba(20, 45, 38, .88)',
  sidebarBg: 'rgba(15, 38, 32, .88)',
  border: 'rgba(60, 150, 120, .12)',
  bubbleIn: 'rgba(32, 68, 58, .85)',
  bubbleOut: 'rgba(16, 185, 129, .85)',
  tabBarBg: 'rgba(20, 45, 38, .88)',
  messageInputBg: 'rgba(35, 65, 55, .88)',
};

const themes = {
  system: { id: 'system', label: 'Как в системе' },
  light: { id: 'light', label: 'Liquid Light', ...liquidLight },
  dark: { id: 'dark', label: 'Liquid Dark', ...liquidDark },
  midnight: { id: 'midnight', label: 'Midnight Blue', ...midnightBlue },
  aurora: { id: 'aurora', label: 'Aurora', ...aurora },
  forest: { id: 'forest', label: 'Forest', ...forestGreen },
};

const CHAT_BG_PRESETS = [
  { id: 'default', name: 'По умолчанию', value: '' },
  { id: 'gradient1', name: 'Мягкий градиент', value: 'linear-gradient(180deg, rgba(200,230,255,.08) 0%, transparent 60%)' },
  { id: 'gradient2', name: 'Тёплый закат', value: 'linear-gradient(180deg, rgba(255,200,150,.07) 0%, transparent 60%)' },
  { id: 'dots', name: 'Точки', value: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,.04) 1px, transparent 0); background-size: 20px 20px' },
  { id: 'grid', name: 'Сетка', value: 'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px); background-size: 30px 30px' },
  { id: 'noise', name: 'Шум', value: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.03%22/%3E%3C/svg%3E")' },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeIdState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'dark';
    } catch {
      return 'dark';
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
    { id: 'light', label: 'Liquid Light' },
    { id: 'dark', label: 'Liquid Dark' },
    { id: 'midnight', label: 'Midnight Blue' },
    { id: 'aurora', label: 'Aurora' },
    { id: 'forest', label: 'Forest' },
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
