import React, { useState, useMemo, useEffect } from 'react';
import Chats from '../components/Chats';
import Calls from '../components/Calls';
import Status from '../components/Status';
import Settings from '../components/Settings';
import CallScreen from '../components/CallScreen';
import { useTheme } from '../context/ThemeContext';
import { useCall } from '../context/CallContext';
import { getChatList } from '../lib/chatStorage';
import { IconChats, IconCalls, IconStatus, IconSettings } from '../components/Icons';

const TABS = [
  { id: 'chats', label: 'Чаты', Icon: IconChats },
  { id: 'calls', label: 'Звонки', Icon: IconCalls },
  { id: 'status', label: 'Истории', Icon: IconStatus },
  { id: 'settings', label: 'Настройки', Icon: IconSettings },
];

export default function Messenger() {
  const { theme, isDark } = useTheme();
  const callCtx = useCall();
  const [activeTab, setActiveTab] = useState('chats');
  const [isDesktop, setIsDesktop] = useState(true);
  const [activeIncomingCall, setActiveIncomingCall] = useState(null);

  useEffect(() => {
    const m = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(m.matches);
    update();
    m.addEventListener('change', update);
    return () => m.removeEventListener('change', update);
  }, []);

  const accent = typeof theme.accent === 'string' ? theme.accent : '#0a84ff';
  const tabBarBg = theme.tabBarBg || theme.headerBg || theme.cardBg;

  const styles = useMemo(() => ({
    container: {
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      color: theme.text,
      background: theme.pageBg,
    },
    main: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
    tabBar: {
      display: 'flex',
      height: 56,
      minHeight: 56,
      background: tabBarBg,
      borderTop: `1px solid ${theme.border}`,
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
    },
    tab: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: '8px 4px',
      fontSize: 11,
      fontWeight: 600,
      minWidth: 0,
      color: theme.textMuted,
      transition: 'color 0.15s',
    },
    tabIconWrap: { width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      width: 72,
      minWidth: 72,
      background: theme.sidebarBg,
      padding: '12px 0',
      alignItems: 'center',
      gap: 4,
      borderRight: `1px solid ${theme.border}`,
    },
    navBtn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      width: 48,
      height: 48,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      borderRadius: 12,
      fontSize: 10,
      color: theme.textMuted,
      transition: 'all 0.2s',
    },
    navBtnActive: {
      color: accent,
      background: `${accent}18`,
    },
    incomingCallModal: {
      position: 'fixed',
      inset: 0,
      zIndex: 999,
      background: 'rgba(0,0,0,.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    incomingCallCard: {
      background: theme.cardBg,
      borderRadius: 24,
      padding: 28,
      maxWidth: 340,
      width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,.3)',
      backdropFilter: 'blur(20px) saturate(140%)',
      WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      border: `1px solid ${theme.cardBorder}`,
    },
  }), [theme, activeTab, accent, tabBarBg, isDark]);

  const incomingCall = callCtx?.incomingCall ?? null;
  const peerNameFromId = (userId) => {
    const list = getChatList();
    const chat = list.find((c) => c.peerUserId === userId || c.otherUserId === userId || String(c.id) === String(userId));
    return chat?.name || 'Пользователь';
  };

  const handleAcceptIncoming = () => {
    const data = callCtx?.acceptCall();
    if (data) setActiveIncomingCall(data);
  };

  return (
    <div style={styles.container}>
      {activeIncomingCall && (
        <CallScreen
          peerName={peerNameFromId(activeIncomingCall.fromUserId)}
          isVideo={activeIncomingCall.isVideo}
          onEnd={() => setActiveIncomingCall(null)}
          peerUserId={activeIncomingCall.fromUserId}
          isIncoming
          remoteOffer={activeIncomingCall.sdp}
        />
      )}
      {incomingCall && !activeIncomingCall && (
        <div style={styles.incomingCallModal}>
          <div style={styles.incomingCallCard}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: theme.text }}>
              Входящий {incomingCall.isVideo ? 'видео' : 'голосовой'} звонок
            </div>
            <div style={{ fontSize: 16, color: theme.textMuted, marginBottom: 24 }}>
              {peerNameFromId(incomingCall.fromUserId)}
            </div>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={callCtx.rejectCall}
                style={{
                  padding: '12px 24px',
                  borderRadius: 14,
                  border: `1px solid ${theme.border}`,
                  background: 'transparent',
                  color: theme.text,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 15,
                  transition: 'all 0.2s',
                }}
              >
                Отклонить
              </button>
              <button
                type="button"
                onClick={handleAcceptIncoming}
                style={{
                  padding: '12px 24px',
                  borderRadius: 14,
                  border: 'none',
                  background: theme.accent,
                  color: theme.accentText || '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 15,
                  boxShadow: '0 6px 20px rgba(10, 132, 255, .35)',
                  transition: 'all 0.2s',
                }}
              >
                Принять
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {isDesktop && (
          <nav style={styles.sidebar} aria-label="Навигация">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{ ...styles.navBtn, ...(activeTab === tab.id ? styles.navBtnActive : {}) }}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <span style={styles.tabIconWrap}>
                  <tab.Icon width={26} height={26} style={{ display: 'block', color: 'inherit' }} />
                </span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        )}
        <main style={styles.main}>
          {activeTab === 'chats' && <Chats />}
          {activeTab === 'calls' && <Calls />}
          {activeTab === 'status' && <Status />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
      {!isDesktop && (
        <nav style={styles.tabBar} aria-label="Навигация">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                color: activeTab === tab.id ? accent : theme.textMuted,
              }}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span style={styles.tabIconWrap}>
                <tab.Icon width={26} height={26} style={{ display: 'block', color: 'inherit' }} />
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
