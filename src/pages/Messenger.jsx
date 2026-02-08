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
  const { theme } = useTheme();
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

  const accent = theme.accent || '#0088cc';
  const tabBarBg = theme.tabBarBg || theme.headerBg || theme.cardBg;
  const iconColor = (id) => (activeTab === id ? accent : (theme.textMuted || '#707579'));

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
    main: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, transition: 'opacity 0.2s ease' },
    tabBar: {
      display: 'flex',
      height: 56,
      minHeight: 56,
      background: tabBarBg,
      borderTop: `1px solid ${theme.border}`,
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
      backdropFilter: 'saturate(180%) blur(12px)',
      WebkitBackdropFilter: 'saturate(180%) blur(12px)',
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
      padding: '8px 6px',
      fontSize: 11,
      fontWeight: 500,
      minWidth: 0,
      color: theme.textMuted,
      letterSpacing: 0.2,
    },
    tabIconWrap: {
      width: 26,
      height: 26,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      width: 72,
      minWidth: 72,
      background: theme.headerBg,
      borderRight: `1px solid ${theme.border}`,
      padding: '12px 0',
      alignItems: 'center',
      gap: 4,
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
    },
    navBtnActive: { color: accent, background: theme.sidebarBg || 'rgba(0,0,0,.06)' },
  }), [theme, activeTab, accent, tabBarBg]);

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
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: theme.cardBg || theme.headerBg, borderRadius: 16, padding: 24, maxWidth: 320, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,.3)' }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Входящий {incomingCall.isVideo ? 'видео' : 'голосовой'} звонок</div>
            <div style={{ fontSize: 15, color: theme.textMuted, marginBottom: 20 }}>{peerNameFromId(incomingCall.fromUserId)}</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" onClick={callCtx.rejectCall} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: theme.sidebarBg, color: theme.text, cursor: 'pointer', fontWeight: 500 }}>Отклонить</button>
              <button type="button" onClick={handleAcceptIncoming} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: theme.accent, color: theme.accentText || '#fff', cursor: 'pointer', fontWeight: 500 }}>Принять</button>
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
                  <tab.Icon width={24} height={24} style={{ display: 'block', color: 'inherit' }} />
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
                color: iconColor(tab.id),
              }}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span style={styles.tabIconWrap}>
                <tab.Icon width={24} height={24} style={{ display: 'block', color: 'inherit' }} />
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
