import React, { useMemo, useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { IconPerson } from './Icons';
import { apiGetStories, apiViewStory } from '../lib/api';

export default function Status() {
  const { theme } = useTheme();
  const { displayName, profilePhoto } = useUser();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const fetchedStories = await apiGetStories();

        if (!fetchedStories) {
          setStories([]);
          setLoading(false);
          return;
        }

        setStories(fetchedStories);
      } catch (err) {
        console.error('Failed to load stories:', err);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleStoryClick = async (userId, username, userStories) => {
    // Отмечаем все истории как просмотренные
    if (userStories && userStories.stories) {
      for (const story of userStories.stories) {
        if (!story.viewed) {
          await apiViewStory(story.id);
        }
      }
    }

    // TODO: Реализовать просмотр историй в полноэкранном режиме
    console.log('View stories for user:', userId, username);
  };

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
      storiesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: 16,
      },
      storyItem: {
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      },
      storyAvatarWrapper: {
        position: 'relative',
        width: 80,
        height: 80,
        marginBottom: 8,
      },
      storyRing: (allViewed) => ({
        position: 'absolute',
        inset: '-3px',
        borderRadius: '50%',
        padding: '3px',
        background: allViewed
          ? 'rgba(255, 255, 255, 0.2)'
          : 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
        WebkitBackgroundClip: 'padding-box',
        backgroundClip: 'padding-box',
      }),
      storyAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: theme.cardBg,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 24,
        color: theme.text,
        overflow: 'hidden',
      },
      storyCountBadge: {
        position: 'absolute',
        bottom: '-2px',
        right: '-2px',
        background: theme.accent || '#0088cc',
        color: '#fff',
        fontSize: 10,
        fontWeight: 600,
        padding: '2px 6px',
        borderRadius: 10,
        minWidth: 18,
        textAlign: 'center',
      },
      storyUsername: {
        fontSize: 12,
        color: theme.text,
        textAlign: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '100%',
      },
    }),
    [theme, profilePhoto]
  );

  const avatarContent = profilePhoto
    ? <img src={profilePhoto} alt="" style={styles.avatarImg} />
    : (displayName ? displayName[0].toUpperCase() : <IconPerson width={28} height={28} style={{ color: 'inherit' }} />);

  if (loading) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Истории</h2>
        <p style={styles.subtitle}>Фото и видео на вашей странице</p>
        <div style={{ textAlign: 'center', padding: 40, color: theme.textMuted }}>
          Загрузка историй...
        </div>
      </div>
    );
  }

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

      {stories.length === 0 ? (
        <div style={styles.empty}>
          Нет обновлений от контактов. Истории от людей и сообществ, на которых вы подписаны, появятся здесь.
        </div>
      ) : (
        <div style={styles.storiesGrid}>
          {stories.map((userStories) => (
            <div
              key={userStories.userId}
              onClick={() => handleStoryClick(userStories.userId, userStories.username, userStories)}
              style={styles.storyItem}
            >
              <div style={styles.storyAvatarWrapper}>
                <div style={styles.storyRing(userStories.allViewed)}>
                  <div style={styles.storyAvatar}>
                    {userStories.displayName?.charAt(0)?.toUpperCase() || userStories.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                </div>

                {userStories.stories.length > 1 && (
                  <div style={styles.storyCountBadge}>
                    {userStories.stories.length}
                  </div>
                )}
              </div>

              <div style={styles.storyUsername}>
                {userStories.displayName || userStories.username}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
