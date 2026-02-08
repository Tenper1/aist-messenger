import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

export default function Status() {
  const { theme } = useTheme();
  const { displayName, profilePhoto } = useUser();

  const styles = useMemo(
    () => ({
      container: { padding: 16, height: '100%', overflowY: 'auto', color: theme.text },
      title: { fontSize: 22, fontWeight: 600, marginBottom: 8 },
      subtitle: { fontSize: 14, color: theme.textMuted, marginBottom: 20 },
      myPage: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        borderRadius: 12,
        background: theme.cardBg,
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
        fontSize: 22,
        fontWeight: 600,
        overflow: 'hidden',
      },
      avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
      myPageTitle: { fontSize: 17, fontWeight: 600, marginBottom: 2 },
      myPageSub: { fontSize: 14, color: theme.textMuted },
      empty: { textAlign: 'center', padding: 32, color: theme.textMuted, fontSize: 15 },
    }),
    [theme]
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Истории</h2>
      <p style={styles.subtitle}>Фото и видео на вашей странице</p>

      <div style={styles.myPage}>
        <div style={styles.avatar}>
          {profilePhoto ? <img src={profilePhoto} alt="" style={styles.avatarImg} /> : (displayName ? displayName[0].toUpperCase() : '?')}
        </div>
        <div>
          <div style={styles.myPageTitle}>Моя страница</div>
          <div style={styles.myPageSub}>Ваши фото и истории</div>
        </div>
      </div>

      <div style={styles.empty}>
        Нет обновлений от контактов. Когда друзья добавят истории, они появятся здесь.
      </div>
    </div>
  );
}
