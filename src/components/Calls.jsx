import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { IconLock, IconPhone, IconPhoneIncoming, IconPhoneOutgoing, IconPhoneMissed } from './Icons';

export default function Calls() {
  const { theme } = useTheme();
  // История звонков будет подгружаться с сервера (API /api/calls)
  const calls = [];

  const styles = useMemo(
    () => ({
      container: {
        padding: 20,
        height: '100%',
        overflowY: 'auto',
        color: theme.text,
      },
      title: { fontSize: 28, fontWeight: 700, marginBottom: 6, color: theme.text, letterSpacing: -0.5 },
      encryptedNote: {
        fontSize: 13,
        color: theme.textMuted,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        lineHeight: 1.4,
      },
      callList: { display: 'flex', flexDirection: 'column', gap: 2 },
      callItem: {
        padding: '14px 16px',
        borderRadius: 12,
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'pointer',
        transition: 'background 0.15s ease',
      },
      callItemHover: { background: theme.sidebarBg || 'rgba(0,0,0,.04)' },
      avatar: {
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: theme.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 600,
        color: theme.accentText,
        flexShrink: 0,
      },
      callInfo: { flex: 1, minWidth: 0 },
      callName: { fontSize: 17, fontWeight: 600, color: theme.text, marginBottom: 2 },
      callMeta: { fontSize: 15, color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 8 },
      emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 240,
        color: theme.textMuted,
        padding: 24,
      },
      emptyIconWrap: { width: 56, height: 56, borderRadius: 28, background: theme.sidebarBg || 'rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
      emptyText: { fontSize: 17, fontWeight: 500, color: theme.text },
    }),
    [theme]
  );

  const CallTypeIcon = ({ type, missed }) => {
    if (missed) return <IconPhoneMissed width={16} height={16} style={{ color: '#e53935' }} />;
    return type === 'incoming'
      ? <IconPhoneIncoming width={16} height={16} />
      : <IconPhoneOutgoing width={16} height={16} />;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Звонки</h2>
      <div style={styles.encryptedNote}>
        <IconLock width={16} height={16} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>Звонки зашифрованы. Участники разговора — только вы и собеседник; подключиться к звонку невозможно.</span>
      </div>
      {calls.length > 0 ? (
        <div style={styles.callList}>
          {calls.map((call) => (
            <div key={call.id} style={styles.callItem} onMouseEnter={(e) => { e.currentTarget.style.background = styles.callItemHover.background; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              <div style={styles.avatar}>{call.name ? call.name[0].toUpperCase() : '?'}</div>
              <div style={styles.callInfo}>
                <div style={styles.callName}>{call.name}</div>
                <div style={styles.callMeta}>
                  <CallTypeIcon type={call.type} missed={call.missed} />
                  <span>{call.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIconWrap}>
            <IconPhone width={26} height={26} style={{ color: theme.textMuted }} />
          </div>
          <div style={styles.emptyText}>Нет истории звонков</div>
          <div style={{ fontSize: 14, color: theme.textMuted, marginTop: 8 }}>Звонки через мессенджер будут отображаться здесь</div>
        </div>
      )}
    </div>
  );
}
