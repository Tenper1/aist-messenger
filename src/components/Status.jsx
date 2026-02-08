import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { IconPerson } from './Icons';

export default function Status() {
  const { theme } = useTheme();
  const { displayName, profilePhoto } = useUser();

  const styles = useMemo(
    () => ({
      container: { padding: 20, height: '100%', overflowY: 'auto', color: theme.text },
      title: { fontSize: 28, fontWeight: 700, marginBottom: 4, letterSpacing: -0.5 },
      subtitle: { fontSize: 15, color: theme.textMuted, marginBottom: 20 },
      myPage: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        borderRadius: 14,
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        marginBottom: 28,
        boxShadow: theme.isDark ? '0 1px 3px rgba(0,0,0,.2)' : '0 1px 4px rgba(0,0,0,.06)',
      },
      avatar: {
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: profilePhoto ? 'transparent' : (theme.accent || '#0088cc'),
        color: theme.accentText,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        fontWeight: 600,
        overflow: 'hidden',
        flexShrink: 0,
      },
      avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
      myPageTitle: { fontSize: 17, fontWeight: 600, marginBottom: 2 },
      myPageSub: { fontSize: 14, color: theme.textMuted },
      empty: {
        textAlign: 'center',
        padding: '24px 16px',
        color: theme.textMuted,
        fontSize: 15,
        lineHeight: 1.45,
      },
    }),
    [theme, profilePhoto]
  );

  const avatarContent = profilePhoto
    ? <img src={profilePhoto} alt="" style={styles.avatarImg} />
    : (displayName ? displayName[0].toUpperCase() : <IconPerson width={28} height={28} style={{ color: 'inherit' }} />);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Истории</h2>
      <p style={styles.subtitle}>Фото и видео на вашей странице</p>

      <div style={styles.myPage}>
        <div style={styles.avatar}>
          {avatarContent}
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
