import React, { useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Status() {
  const { theme } = useTheme();
  const [statuses] = useState(() => [
    { id: 1, name: 'Анна Иванова', avatar: '👩', time: '2 часа назад', viewed: true },
    { id: 2, name: 'Иван Петров', avatar: '👨', time: '5 часов назад', viewed: false },
    { id: 3, name: 'Мария Сидорова', avatar: '👱‍♀️', time: 'Вчера', viewed: true },
  ]);

  const styles = useMemo(
    () => ({
      container: {
        padding: 24,
        height: '100%',
        overflowY: 'auto',
        color: theme.text,
      },
      title: { fontSize: 22, fontWeight: 700, marginBottom: 24, color: theme.text },
      statusList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 16,
      },
      statusItem: {
        padding: 20,
        borderRadius: 20,
        background: theme.sidebarBg || 'rgba(255,255,255,.06)',
        border: `1px solid ${theme.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
      avatar: {
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: theme.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 36,
        color: theme.accentText,
        border: `2px solid ${theme.border}`,
      },
      statusName: { fontSize: 14, fontWeight: 600, color: theme.text, textAlign: 'center' },
      statusTime: { fontSize: 12, color: theme.textMuted },
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

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Статусы</h2>
      {statuses.length > 0 ? (
        <div style={styles.statusList}>
          {statuses.map((s) => (
            <div key={s.id} style={styles.statusItem}>
              <div style={styles.avatar}>{s.avatar}</div>
              <div style={styles.statusName}>{s.name}</div>
              <div style={styles.statusTime}>{s.time}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>✨</div>
          <div>Нет статусов</div>
        </div>
      )}
    </div>
  );
}
