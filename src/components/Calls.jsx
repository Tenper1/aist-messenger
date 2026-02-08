import React, { useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { IconLock } from './Icons';

export default function Calls() {
  const { theme } = useTheme();
  const [calls] = useState(() => [
    { id: 1, name: 'Анна Иванова', avatar: '👩', time: 'Сегодня, 14:30', type: 'outgoing', missed: false },
    { id: 2, name: 'Иван Петров', avatar: '👨', time: 'Вчера, 12:15', type: 'incoming', missed: true },
    { id: 3, name: 'Мария Сидорова', avatar: '👱‍♀️', time: '2 дня назад', type: 'outgoing', missed: false },
  ]);

  const styles = useMemo(
    () => ({
      container: {
        padding: 24,
        height: '100%',
        overflowY: 'auto',
        color: theme.text,
      },
      title: { fontSize: 22, fontWeight: 700, marginBottom: 8, color: theme.text },
      encryptedNote: {
        fontSize: 13,
        color: theme.textMuted,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      },
      callList: { display: 'flex', flexDirection: 'column', gap: 8 },
      callItem: {
        padding: 16,
        borderRadius: 16,
        background: theme.sidebarBg || 'rgba(255,255,255,.06)',
        border: `1px solid ${theme.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
      avatar: {
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: theme.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        color: theme.accentText,
      },
      callInfo: { flex: 1 },
      callName: { fontSize: 16, fontWeight: 600, color: theme.text, marginBottom: 4 },
      callMeta: { fontSize: 13, color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 8 },
      emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: theme.textMuted,
      },
      emptyIcon: { fontSize: 64, marginBottom: 16, opacity: 0.6 },
    }),
    [theme]
  );

  const getCallIcon = (type, missed) => {
    if (missed) return '📞❌';
    return type === 'incoming' ? '📞↓' : '📞↑';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Звонки</h2>
      <div style={styles.encryptedNote}>
        <IconLock width={18} height={18} style={{ flexShrink: 0 }} />
        <span>Звонки зашифрованы. Участники разговора — только вы и собеседник; подключиться к звонку невозможно.</span>
      </div>
      {calls.length > 0 ? (
        <div style={styles.callList}>
          {calls.map((call) => (
            <div key={call.id} style={styles.callItem}>
              <div style={styles.avatar}>{call.avatar}</div>
              <div style={styles.callInfo}>
                <div style={styles.callName}>{call.name}</div>
                <div style={styles.callMeta}>
                  <span>{getCallIcon(call.type, call.missed)}</span>
                  <span>{call.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📞</div>
          <div>Нет истории звонков</div>
        </div>
      )}
    </div>
  );
}
