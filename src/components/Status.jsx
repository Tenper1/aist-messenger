import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

export default function Status() {
  const { theme } = useTheme();
  const { displayName } = useUser();

  const stories = useMemo(() => [
    { id: '1', name: 'Анна', time: '2 ч', viewed: true },
    { id: '2', name: 'Иван', time: '5 ч', viewed: false },
    { id: '3', name: 'Мария', time: 'Вчера', viewed: true },
  ], []);

  const styles = useMemo(
    () => ({
      container: {
        padding: 20,
        height: '100%',
        overflowY: 'auto',
        color: theme.text,
      },
      title: { fontSize: 22, fontWeight: 600, marginBottom: 8, color: theme.text },
      subtitle: { fontSize: 14, color: theme.textMuted, marginBottom: 24 },
      myPage: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        borderRadius: 14,
        background: theme.sidebarBg || 'rgba(255,255,255,.06)',
        border: `1px solid ${theme.border}`,
        marginBottom: 24,
      },
      avatar: {
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: theme.accent,
        color: theme.accentText,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        fontWeight: 600,
      },
      myPageText: { flex: 1 },
      myPageTitle: { fontSize: 16, fontWeight: 600, marginBottom: 2, color: theme.text },
      myPageSub: { fontSize: 13, color: theme.textMuted },
      sectionTitle: { fontSize: 15, fontWeight: 600, marginBottom: 12, color: theme.text },
      list: { display: 'flex', flexDirection: 'column', gap: 8 },
      item: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: 12,
        borderRadius: 12,
        background: theme.sidebarBg || 'rgba(255,255,255,.06)',
        border: `1px solid ${theme.border}`,
        cursor: 'pointer',
      },
      itemAvatar: {
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: theme.accent,
        color: theme.accentText,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 600,
      },
      itemNew: { borderColor: 'rgba(100, 180, 255, .5)', boxShadow: '0 0 0 2px rgba(100, 180, 255, .2)' },
    }),
    [theme]
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Истории</h2>
      <p style={styles.subtitle}>Фото и видео на странице, как в современных мессенджерах</p>

      <div style={styles.myPage}>
        <div style={styles.avatar}>{displayName ? displayName[0].toUpperCase() : '?'}</div>
        <div style={styles.myPageText}>
          <div style={styles.myPageTitle}>Моя страница</div>
          <div style={styles.myPageSub}>Ваши фото, видео и истории видны здесь</div>
        </div>
      </div>

      <div style={styles.sectionTitle}>Истории контактов</div>
      <div style={styles.list}>
        {stories.map((s) => (
          <div
            key={s.id}
            style={{
              ...styles.item,
              ...(s.viewed ? {} : styles.itemNew),
            }}
          >
            <div style={styles.itemAvatar}>{s.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: theme.text }}>{s.name}</div>
              <div style={{ fontSize: 13, color: theme.textMuted }}>{s.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
