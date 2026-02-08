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
    main: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
    tabBar: {
      display: 'flex',
      height: 52,
      minHeight: 52,
      background: tabBarBg,
      borderTop: '1px solid rgba(255,255,255,.06)',
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
    },
    tab: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: '6px 4px',
      fontSize: 11,
      fontWeight: 500,
      minWidth: 0,
      color: theme.textMuted,
    },
    tabIconWrap: { width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      width: 68,
      minWidth: 68,
      background: theme.sidebarBg,
      padding: '10px 0',
      alignItems: 'center',
      gap: 2,
    },
    navBtn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      width: 44,
      height: 44,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      borderRadius: 10,
      fontSize: 10,
      color: theme.textMuted,
    },
    navBtnActive: { color: accent, background: 'rgba(255,255,255,.08)' },
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
