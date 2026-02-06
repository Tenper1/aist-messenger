import React, { useMemo, useState } from 'react';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const glassStyle = useMemo(() => ({
    container: {
      padding: '24px',
      height: '100%',
      overflowY: 'auto',
      maxWidth: '800px',
      margin: '0 auto',
    },
    title: {
      fontSize: '24px',
      fontWeight: 700,
      marginBottom: '32px',
      color: 'rgba(255,255,255,.95)',
    },
    section: {
      marginBottom: '32px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '16px',
      color: 'rgba(255,255,255,.9)',
    },
    settingItem: {
      padding: '16px',
      borderRadius: '16px',
      background: 'rgba(255,255,255,.06)',
      border: '1px solid rgba(255,255,255,.12)',
      backdropFilter: 'blur(16px) saturate(140%)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    },
    settingLabel: {
      fontSize: '15px',
      color: 'rgba(255,255,255,.9)',
    },
    toggle: {
      width: '48px',
      height: '28px',
      borderRadius: '14px',
      background: notifications ? 'rgba(140,200,255,.5)' : 'rgba(255,255,255,.2)',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(255,255,255,.2)',
    },
    toggleThumb: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,.95)',
      position: 'absolute',
      top: '1px',
      left: notifications ? '23px' : '1px',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,.2)',
    },
    button: {
      padding: '12px 24px',
      borderRadius: '12px',
      background: 'rgba(255,255,255,.1)',
      border: '1px solid rgba(255,255,255,.2)',
      color: 'rgba(255,255,255,.9)',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    buttonHover: {
      background: 'rgba(255,255,255,.15)',
      transform: 'translateY(-2px)',
    },
    logoutButton: {
      padding: '12px 24px',
      borderRadius: '12px',
      background: 'rgba(239, 68, 68, .2)',
      border: '1px solid rgba(239, 68, 68, .3)',
      color: 'rgba(255,255,255,.9)',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginTop: '24px',
    },
  }), [notifications]);

  const handleLogout = () => {
    localStorage.removeItem('aist_token');
    window.location.assign('/');
  };

  return (
    <div style={glassStyle.container}>
      <h2 style={glassStyle.title}>Настройки</h2>

      <div style={glassStyle.section}>
        <h3 style={glassStyle.sectionTitle}>Уведомления</h3>
        <div style={glassStyle.settingItem}>
          <span style={glassStyle.settingLabel}>Включить уведомления</span>
          <div
            style={glassStyle.toggle}
            onClick={() => setNotifications(!notifications)}
          >
            <div style={glassStyle.toggleThumb} />
          </div>
        </div>
      </div>

      <div style={glassStyle.section}>
        <h3 style={glassStyle.sectionTitle}>Внешний вид</h3>
        <div style={glassStyle.settingItem}>
          <span style={glassStyle.settingLabel}>Тёмная тема</span>
          <div
            style={{ ...glassStyle.toggle, background: darkMode ? 'rgba(140,200,255,.5)' : 'rgba(255,255,255,.2)' }}
            onClick={() => setDarkMode(!darkMode)}
          >
            <div style={{ ...glassStyle.toggleThumb, left: darkMode ? '23px' : '1px' }} />
          </div>
        </div>
      </div>

      <div style={glassStyle.section}>
        <h3 style={glassStyle.sectionTitle}>Аккаунт</h3>
        <button
          style={glassStyle.logoutButton}
          onClick={handleLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, .3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, .2)';
          }}
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
