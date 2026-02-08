import React, { useState, useMemo, useEffect } from 'react';
import Chats from '../components/Chats';
import Calls from '../components/Calls';
import Status from '../components/Status';
import Settings from '../components/Settings';
import { useTheme } from '../context/ThemeContext';
import { IconChats, IconCalls, IconStatus, IconSettings } from '../components/Icons';

const TABS = [
  { id: 'chats', label: 'Чаты', Icon: IconChats },
  { id: 'calls', label: 'Звонки', Icon: IconCalls },
  { id: 'status', label: 'Истории', Icon: IconStatus },
  { id: 'settings', label: 'Настройки', Icon: IconSettings },
];

export default function Messenger() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('chats');
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const m = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(m.matches);
    update();
    m.addEventListener('change', update);
    return () => m.removeEventListener('change', update);
  }, []);

  const styles = useMemo(() => ({
    container: {
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: isDesktop ? 'row' : 'column',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      color: theme.text,
      background: theme.pageBg,
      backgroundAttachment: 'fixed',
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      width: isDesktop ? 72 : '100%',
      minWidth: isDesktop ? 72 : undefined,
      maxWidth: isDesktop ? 72 : undefined,
      height: isDesktop ? '100%' : 'auto',
      background: theme.headerBg,
      borderRight: isDesktop ? `1px solid ${theme.border}` : 'none',
      borderTop: !isDesktop ? `1px solid ${theme.border}` : 'none',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      zIndex: 10,
      padding: isDesktop ? '12px 0' : '8px 0',
      alignItems: 'center',
      gap: isDesktop ? 8 : 0,
      flexDirection: isDesktop ? 'column' : 'row',
      justifyContent: isDesktop ? 'flex-start' : 'space-around',
    },
    navButton: {
      display: 'flex',
      flexDirection: isDesktop ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      width: isDesktop ? 48 : 'auto',
      minWidth: isDesktop ? 48 : 56,
      height: 48,
      padding: '0 12px',
      borderRadius: 14,
      border: 'none',
      background: 'transparent',
      color: theme.textMuted,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    navButtonActive: {
      background: theme.sidebarBg || 'rgba(255,255,255,.1)',
      color: theme.text,
      fontWeight: 600,
    },
    navLabel: {
      fontSize: 11,
      fontWeight: 500,
    },
    content: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      minHeight: 0,
    },
  }), [theme, isDesktop]);

  return (
    <div style={styles.container}>
      <nav style={styles.sidebar} aria-label="Навигация">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.navButton,
              ...(activeTab === tab.id ? styles.navButtonActive : {}),
            }}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <tab.Icon width={22} height={22} aria-hidden />
            <span style={styles.navLabel}>{tab.label}</span>
          </button>
        ))}
      </nav>

      <main style={styles.content} role="main">
        {activeTab === 'chats' && <Chats />}
        {activeTab === 'calls' && <Calls />}
        {activeTab === 'status' && <Status />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}
