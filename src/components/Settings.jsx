import React, { useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { requestNotificationPermission } from '../lib/notifications';

export default function Settings() {
  const { theme, themeId, setThemeId, themeList } = useTheme();
  const {
    displayName,
    username,
    usernameFormatted,
    usernameError,
    setDisplayName,
    setUsername,
  } = useUser();
  const [notifications, setNotifications] = useState(() => {
    try {
      return localStorage.getItem('aist_notifications') !== 'false';
    } catch {
      return true;
    }
  });
  const [privacyWhoCanWrite, setPrivacyWhoCanWrite] = useState('everyone'); // everyone | contacts | nobody
  const [privacyWhoCanSeeStatus, setPrivacyWhoCanSeeStatus] = useState('everyone');
  const [privacyWhoCanSeeStories, setPrivacyWhoCanSeeStories] = useState('contacts');

  const saveNotifications = async (v) => {
    if (v) {
      const perm = await requestNotificationPermission();
      if (perm !== 'granted') v = false;
    }
    setNotifications(v);
    try {
      localStorage.setItem('aist_notifications', v ? 'true' : 'false');
    } catch {}
  };

  const styles = useMemo(
    () => ({
      container: {
        padding: '24px 20px',
        height: '100%',
        overflowY: 'auto',
        maxWidth: 560,
        margin: '0 auto',
        color: theme.text,
      },
      title: { fontSize: 22, fontWeight: 700, marginBottom: 24, color: theme.text },
      section: { marginBottom: 28 },
      sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 12, color: theme.text },
      settingItem: {
        padding: 14,
        borderRadius: 14,
        background: theme.sidebarBg || 'rgba(255,255,255,.06)',
        border: `1px solid ${theme.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
      },
      settingLabel: { fontSize: 14, color: theme.text },
      input: {
        padding: '10px 12px',
        borderRadius: 12,
        border: `1px solid ${theme.inputBorder}`,
        background: theme.inputBg,
        color: theme.text,
        fontSize: 14,
        width: '100%',
        maxWidth: 220,
        outline: 'none',
      },
      inputError: { borderColor: 'rgba(239, 68, 68, .6)' },
      errorText: { fontSize: 12, color: 'rgba(239, 68, 68, .9)', marginTop: 4 },
      select: {
        padding: '8px 12px',
        borderRadius: 10,
        border: `1px solid ${theme.border}`,
        background: theme.inputBg,
        color: theme.text,
        fontSize: 13,
        cursor: 'pointer',
        outline: 'none',
      },
      toggle: {
        width: 48,
        height: 28,
        borderRadius: 14,
        background: notifications ? 'rgba(100, 180, 255, .5)' : theme.inputBg,
        border: `1px solid ${theme.border}`,
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
      toggleThumb: {
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: 2,
        left: notifications ? 24 : 2,
        transition: 'left 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)',
      },
      logoutButton: {
        padding: '12px 24px',
        borderRadius: 12,
        background: 'rgba(239, 68, 68, .2)',
        border: '1px solid rgba(239, 68, 68, .35)',
        color: theme.text,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        marginTop: 24,
      },
      row: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 },
      label: { fontSize: 13, color: theme.textMuted },
      themeRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
      themeBtn: {
        padding: '8px 14px',
        borderRadius: 10,
        border: `1px solid ${theme.border}`,
        background: theme.sidebarBg || 'transparent',
        color: theme.text,
        fontSize: 13,
        cursor: 'pointer',
      },
      themeBtnActive: { background: theme.accent, color: theme.accentText, borderColor: 'transparent' },
    }),
    [theme, notifications]
  );

  const handleLogout = () => {
    localStorage.removeItem('aist_token');
    window.location.assign('/');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Настройки</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Профиль</h3>
        <div style={styles.row}>
          <label style={styles.label}>Имя (отображаемое)</label>
          <input
            type="text"
            style={styles.input}
            placeholder="Как к вам обращаться"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={64}
          />
        </div>
        <div style={styles.row}>
          <label style={styles.label}>Никнейм (для поиска, например @admin)</label>
          <input
            type="text"
            style={{ ...styles.input, ...(usernameError ? styles.inputError : {}) }}
            placeholder="@username"
            value={username ? `@${username}` : ''}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={33}
          />
          {usernameError && <span style={styles.errorText}>{usernameError}</span>}
          {username && !usernameError && (
            <span style={{ ...styles.label, marginTop: 4 }}>Ваш ник: {usernameFormatted}</span>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Внешний вид</h3>
        <div style={styles.settingItem}>
          <span style={styles.settingLabel}>Тема оформления</span>
          <div style={styles.themeRow}>
            {themeList.map((t) => (
              <button
                key={t.id}
                type="button"
                style={{
                  ...styles.themeBtn,
                  ...(themeId === t.id ? styles.themeBtnActive : {}),
                }}
                onClick={() => setThemeId(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Конфиденциальность</h3>
        <div style={styles.settingItem}>
          <span style={styles.settingLabel}>Кто может писать вам</span>
          <select
            style={styles.select}
            value={privacyWhoCanWrite}
            onChange={(e) => setPrivacyWhoCanWrite(e.target.value)}
          >
            <option value="everyone">Все</option>
            <option value="contacts">Только контакты</option>
            <option value="nobody">Никто</option>
          </select>
        </div>
        <div style={styles.settingItem}>
          <span style={styles.settingLabel}>Кто видит статус</span>
          <select
            style={styles.select}
            value={privacyWhoCanSeeStatus}
            onChange={(e) => setPrivacyWhoCanSeeStatus(e.target.value)}
          >
            <option value="everyone">Все</option>
            <option value="contacts">Только контакты</option>
            <option value="nobody">Никто</option>
          </select>
        </div>
        <div style={styles.settingItem}>
          <span style={styles.settingLabel}>Кто видит истории</span>
          <select
            style={styles.select}
            value={privacyWhoCanSeeStories}
            onChange={(e) => setPrivacyWhoCanSeeStories(e.target.value)}
          >
            <option value="everyone">Все</option>
            <option value="contacts">Только контакты</option>
            <option value="nobody">Никто</option>
          </select>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Уведомления</h3>
        <div style={styles.settingItem}>
          <span style={styles.settingLabel}>Включить уведомления (PWA)</span>
          <div style={styles.toggle} onClick={() => saveNotifications(!notifications)}>
            <div style={styles.toggleThumb} />
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Аккаунт</h3>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Выйти
        </button>
      </div>
    </div>
  );
}
