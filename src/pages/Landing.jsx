import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

/**
 * Landing — оболочка сайта AIST.
 * Полное название: Artificial Intelligence Solution Technology.
 * Кнопка «Войти» ведёт на /login (регистрация/вход).
 */
export default function Landing() {
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  }, []);

  const styles = useMemo(() => ({
    page: {
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      color: 'rgba(20, 25, 45, .92)',
      background:
        'radial-gradient(1400px 900px at 15% 5%, rgba(200, 230, 255, .5), transparent 50%),' +
        'radial-gradient(1000px 700px at 88% 15%, rgba(220, 200, 255, .4), transparent 50%),' +
        'radial-gradient(800px 600px at 40% 95%, rgba(180, 255, 230, .35), transparent 50%),' +
        'linear-gradient(165deg, #e8eef7 0%, #f0f4fb 45%, #e6ecf5 100%)',
      backgroundAttachment: 'fixed',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
    },
    header: {
      width: '100%',
      maxWidth: 1200,
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
    },
    logoWrap: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    logo: {
      width: 44,
      height: 44,
      borderRadius: 14,
      background: 'linear-gradient(135deg, rgba(120, 180, 255, .9), rgba(180, 140, 255, .75))',
      border: '1px solid rgba(255,255,255,.5)',
      boxShadow: '0 8px 24px rgba(100, 140, 220, .35)',
      display: 'grid',
      placeItems: 'center',
      fontWeight: 800,
      fontSize: 16,
      color: 'rgba(255,255,255,.95)',
      userSelect: 'none',
    },
    titleShort: {
      margin: 0,
      fontSize: 22,
      fontWeight: 700,
      color: 'rgba(30, 40, 70, .95)',
      letterSpacing: '-0.02em',
    },
    loginBtn: {
      padding: '12px 24px',
      borderRadius: 14,
      border: '1px solid rgba(100, 150, 255, .35)',
      background: 'linear-gradient(135deg, rgba(140, 200, 255, .85), rgba(180, 160, 255, .8))',
      color: 'rgba(20, 30, 55, .95)',
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer',
      textDecoration: 'none',
      boxShadow: '0 8px 24px rgba(100, 140, 220, .3)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    main: {
      flex: 1,
      width: '100%',
      maxWidth: 800,
      padding: '48px 24px 64px',
      textAlign: 'center',
    },
    fullName: {
      margin: '0 0 12px',
      fontSize: isMobile ? 22 : 28,
      fontWeight: 700,
      color: 'rgba(30, 45, 75, .95)',
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
    },
    tagline: {
      margin: '0 0 32px',
      fontSize: isMobile ? 15 : 17,
      color: 'rgba(50, 65, 100, .85)',
      lineHeight: 1.5,
    },
    card: {
      padding: '28px 24px',
      borderRadius: 22,
      background: 'rgba(255,255,255,.6)',
      border: '1px solid rgba(255,255,255,.8)',
      boxShadow: '0 20px 60px rgba(80, 120, 180, .15), inset 0 1px 0 rgba(255,255,255,.9)',
      backdropFilter: 'blur(20px) saturate(140%)',
      WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      textAlign: 'left',
      marginBottom: 24,
    },
    cardTitle: {
      margin: '0 0 12px',
      fontSize: 18,
      fontWeight: 700,
      color: 'rgba(35, 50, 85, .95)',
    },
    cardText: {
      margin: 0,
      fontSize: 15,
      color: 'rgba(55, 75, 115, .88)',
      lineHeight: 1.55,
    },
    loginBtnCenter: {
      display: 'inline-block',
      marginTop: 8,
      padding: '14px 32px',
      borderRadius: 14,
      border: '1px solid rgba(100, 150, 255, .4)',
      background: 'linear-gradient(135deg, rgba(150, 210, 255, .9), rgba(190, 170, 255, .85))',
      color: 'rgba(20, 35, 60, .95)',
      fontSize: 16,
      fontWeight: 600,
      cursor: 'pointer',
      textDecoration: 'none',
      boxShadow: '0 10px 30px rgba(100, 150, 220, .35)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    footer: {
      padding: '24px 16px',
      fontSize: 13,
      color: 'rgba(70, 90, 130, .8)',
      textAlign: 'center',
    },
  }), [isMobile]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logoWrap}>
          <div style={styles.logo} aria-hidden="true">AI</div>
          <h1 style={styles.titleShort}>AIST</h1>
        </div>
        <Link to="/login" style={styles.loginBtn} className="landing-login-btn">
          Войти
        </Link>
      </header>

      <main style={styles.main}>
        <h2 style={styles.fullName}>Artificial Intelligence Solution Technology</h2>
        <p style={styles.tagline}>
          Безопасный мессенджер с шифрованием. Чаты хранятся на ваших устройствах.
          Звонки и переписка — только между вами и собеседниками.
        </p>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Что можно делать</h3>
          <p style={styles.cardText}>
            • Переписка один на один и в группах<br />
            • Голосовые и видеозвонки (1:1 и в группах)<br />
            • Каналы и групповые чаты по аналогии с мессенджерами<br />
            • Статусы и истории<br />
            • Поиск по нику @ и по каналам<br />
            • Настройки конфиденциальности и темы оформления
          </p>
          <Link to="/login" style={styles.loginBtnCenter}>
            Войти
          </Link>
        </div>
      </main>

      <footer style={styles.footer}>
        AIST Messenger · Liquid Glass · Россия
      </footer>
    </div>
  );
}
