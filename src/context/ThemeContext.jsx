import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';

const STORAGE_KEY = 'aist_theme';
const CHAT_BG_KEY = 'aist_chat_bg';

// Liquid Glass Light - мягкий, чистый, с эффектом стекла
const liquidLight = {
  pageBg: 'linear-gradient(135deg, #e8f4fc 0%, #f0f7ff 25%, #eef5ff 50%, #f5f9ff 75%, #edf7ff 100%)',
  text: 'rgba(15, 35, 65, .94)',
  textMuted: 'rgba(80, 100, 130, .75)',
  cardBg: 'rgba(255, 255, 255, .75)',
  cardBorder: 'rgba(255, 255, 255, .9)',
  inputBg: 'rgba(255, 255, 255, .8)',
  inputBorder: 'rgba(100, 140, 200, .2)',
  accent: 'linear-gradient(135deg, #0a84ff 0%, #0066cc 50%, #5e5ce6 100%)',
  accentText: '#ffffff',
  headerBg: 'rgba(255, 255, 255, .82)',
  sidebarBg: 'rgba(248, 252, 255, .8)',
  border: 'rgba(120, 160, 210, .15)',
  bubbleIn: 'rgba(255, 255, 255, .92)',
  bubbleOut: 'linear-gradient(135deg, #0a84ff 0%, #0066cc 100%)',
  tabBarBg: 'rgba(255, 255, 255, .85)',
  messageInputBg: 'rgba(255, 255, 255, .88)',
  glassOverlay: 'rgba(255, 255, 255, .4)',
  glow: 'rgba(10, 132, 255, .3)',
};

// Liquid Glass Dark - глубокий, с неоновыми акцентами
const liquidDark = {
  pageBg: 'linear-gradient(135deg, #0a0e16 0%, #0f141d 25%, #0c1119 50%, #0e131b 75%, #0a0e14 100%)',
  text: 'rgba(250, 253, 255, .95)',
  textMuted: 'rgba(140, 160, 190, .7)',
  cardBg: 'rgba(20, 28, 40, .78)',
  cardBorder: 'rgba(255, 255, 255, .06)',
  inputBg: 'rgba(28, 38, 52, .82)',
  inputBorder: 'rgba(255, 255, 255, .1)',
  accent: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
  accentText: '#ffffff',
  headerBg: 'rgba(20, 28, 40, .85)',
  sidebarBg: 'rgba(16, 22, 32, .85)',
  border: 'rgba(255, 255, 255, .07)',
  bubbleIn: 'rgba(32, 42, 58, .82)',
  bubbleOut: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
  tabBarBg: 'rgba(20, 28, 40, .88)',
  messageInputBg: 'rgba(28, 38, 52, .85)',
  glassOverlay: 'rgba(30, 40, 55, .4)',
  glow: 'rgba(10, 132, 255, .25)',
};

// Midnight Blue - глубокий синий
const midnightBlue = {
  pageBg: 'linear-gradient(135deg, #0a1020 0%, #0d1528 25%, #0b1224 50%, #0e162e 75%, #08101c 100%)',
  text: 'rgba(235, 248, 255, .95)',
  textMuted: 'rgba(130, 160, 200, .7)',
  cardBg: 'rgba(16, 26, 48, .8)',
  cardBorder: 'rgba(70, 110, 180, .12)',
  inputBg: 'rgba(24, 38, 62, .82)',
  inputBorder: 'rgba(90, 130, 200, .18)',
  accent: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  accentText: '#ffffff',
  headerBg: 'rgba(16, 26, 48, .86)',
  sidebarBg: 'rgba(12, 20, 38, .86)',
  border: 'rgba(70, 110, 180, .1)',
  bubbleIn: 'rgba(26, 42, 68, .82)',
  bubbleOut: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  tabBarBg: 'rgba(16, 26, 48, .88)',
  messageInputBg: 'rgba(24, 38, 62, .84)',
  glassOverlay: 'rgba(28, 42, 68, .4)',
  glow: 'rgba(59, 130, 246, .28)',
};

// Aurora - северное сияние
const aurora = {
  pageBg: 'linear-gradient(135deg, #0d0820 0%, #1e1a45 25%, #151035 50%, #251f4d 75%, #0a0718 100%)',
  text: 'rgba(245, 248, 255, .95)',
  textMuted: 'rgba(165, 175, 210, .7)',
  cardBg: 'rgba(35, 28, 72, .8)',
  cardBorder: 'rgba(140, 90, 220, .12)',
  inputBg: 'rgba(52, 42, 98, .82)',
  inputBorder: 'rgba(160, 110, 240, .16)',
  accent: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  accentText: '#ffffff',
  headerBg: 'rgba(35, 28, 72, .86)',
  sidebarBg: 'rgba(28, 22, 60, .86)',
  border: 'rgba(140, 90, 220, .1)',
  bubbleIn: 'rgba(48, 38, 88, .82)',
  bubbleOut: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  tabBarBg: 'rgba(35, 28, 72, .88)',
  messageInputBg: 'rgba(52, 42, 98, .84)',
  glassOverlay: 'rgba(55, 42, 95, .4)',
  glow: 'rgba(240, 147, 251, .25)',
};

// Forest Green - лесной зелёный
const forestGreen = {
  pageBg: 'linear-gradient(135deg, #081a14 0%, #122822 25%, #0a1c16 50%, #142426 75%, #06140f 100%)',
  text: 'rgba(240, 255, 250, .95)',
  textMuted: 'rgba(115, 185, 165, .7)',
  cardBg: 'rgba(18, 42, 36, .8)',
  cardBorder: 'rgba(55, 155, 125, .12)',
  inputBg: 'rgba(30, 62, 52, .82)',
  inputBorder: 'rgba(75, 175, 145, .16)',
  accent: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  accentText: '#ffffff',
  headerBg: 'rgba(18, 42, 36, .86)',
  sidebarBg: 'rgba(14, 32, 28, .86)',
  border: 'rgba(55, 155, 125, .1)',
  bubbleIn: 'rgba(28, 60, 50, .82)',
  bubbleOut: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  tabBarBg: 'rgba(18, 42, 36, .88)',
  messageInputBg: 'rgba(30, 62, 52, .84)',
  glassOverlay: 'rgba(35, 65, 55, .4)',
  glow: 'rgba(16, 185, 129, .25)',
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
