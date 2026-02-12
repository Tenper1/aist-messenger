import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Landing() {
  const { theme, isDark } = useTheme();

  const styles = {
    page: {
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      background: theme.pageBg,
      color: theme.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      overflowX: 'hidden',
      position: 'relative',
    },
    glow1: {
      position: 'fixed',
      top: '-30%',
      right: '-20%',
      width: '800px',
      height: '800px',
      background: 'radial-gradient(circle, rgba(10, 132, 255, .15) 0%, transparent 70%)',
      pointerEvents: 'none',
      filter: 'blur(80px)',
    },
    glow2: {
      position: 'fixed',
      bottom: '-20%',
      left: '-20%',
      width: '600px',
      height: '600px',
      background: 'radial-gradient(circle, rgba(94, 92, 230, .12) 0%, transparent 70%)',
      pointerEvents: 'none',
      filter: 'blur(80px)',
    },
    nav: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      background: theme.headerBg,
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: `1px solid ${theme.border}`,
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      textDecoration: 'none',
      color: theme.text,
    },
    logoIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      background: theme.accent,
      boxShadow: '0 8px 24px rgba(10, 132, 255, .3)',
      display: 'grid',
      placeItems: 'center',
      fontWeight: 800,
      fontSize: 14,
      color: theme.accentText || '#fff',
    },
    logoText: { fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' },
    cta: {
      padding: '12px 26px',
      borderRadius: 14,
      background: theme.accent,
      color: theme.accentText || '#fff',
      fontSize: 15,
      fontWeight: 600,
      textDecoration: 'none',
      letterSpacing: '-0.01em',
      boxShadow: '0 6px 20px rgba(0, 0, 0, .15)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    hero: {
      paddingTop: 160,
      paddingBottom: 100,
      paddingLeft: 24,
      paddingRight: 24,
      textAlign: 'center',
      maxWidth: 960,
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    },
    heroLabel: {
      fontSize: 14,
      fontWeight: 600,
      letterSpacing: 1,
      color: theme.textMuted,
      marginBottom: 16,
      textTransform: 'uppercase',
    },
    heroTitle: {
      fontSize: 'clamp(52px, 10vw, 80px)',
      fontWeight: 800,
      lineHeight: 1.05,
      letterSpacing: '-0.03em',
      margin: '0 0 24px',
      background: isDark
        ? 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,.85) 100%)'
        : 'linear-gradient(180deg, #1a1f35 0%, #2d3450 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    heroSub: {
      fontSize: 'clamp(18px, 2.5vw, 22px)',
      lineHeight: 1.5,
      color: theme.textMuted,
      margin: '0 0 16px',
      fontWeight: 400,
      maxWidth: 600,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    heroTagline: {
      fontSize: 'clamp(16px, 2vw, 19px)',
      color: theme.textMuted,
      marginBottom: 48,
      fontWeight: 500,
    },
    heroButtons: {
      display: 'flex',
      gap: 16,
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    heroCta: {
      padding: '16px 42px',
      borderRadius: 16,
      background: theme.accent,
      color: theme.accentText || '#fff',
      fontSize: 17,
      fontWeight: 600,
      textDecoration: 'none',
      letterSpacing: '-0.01em',
      boxShadow: '0 10px 30px rgba(10, 132, 255, .35)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    heroCtaSecondary: {
      padding: '16px 42px',
      borderRadius: 16,
      background: theme.cardBg,
      color: theme.text,
      fontSize: 17,
      fontWeight: 600,
      textDecoration: 'none',
      letterSpacing: '-0.01em',
      border: `1px solid ${theme.border}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    section: {
      padding: '100px 24px',
      maxWidth: 1080,
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    },
    sectionTitle: {
      fontSize: 38,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      margin: '0 0 18px',
      color: theme.text,
    },
    sectionText: {
      fontSize: 19,
      lineHeight: 1.6,
      color: theme.textMuted,
      margin: 0,
      maxWidth: 700,
    },
    features: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 24,
      marginTop: 60,
    },
    feature: {
      padding: 36,
      borderRadius: 22,
      background: theme.cardBg,
      border: `1px solid ${theme.cardBorder}`,
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      boxShadow: isDark
        ? '0 16px 48px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.08)'
        : '0 16px 48px rgba(80,120,180,.15), inset 0 1px 0 rgba(255,255,255,.7)',
      transition: 'transform 0.2s, border-color 0.2s',
    },
    featureIcon: {
      width: 52,
      height: 52,
      borderRadius: 14,
      background: theme.accent,
      display: 'grid',
      placeItems: 'center',
      marginBottom: 18,
      fontSize: 24,
      color: theme.accentText || '#fff',
    },
    featureTitle: { fontSize: 19, fontWeight: 600, marginBottom: 10, color: theme.text },
    featureText: { fontSize: 15, lineHeight: 1.5, color: theme.textMuted, margin: 0 },
    footer: {
      padding: '60px 24px',
      textAlign: 'center',
      borderTop: `1px solid ${theme.border}`,
      color: theme.textMuted,
      fontSize: 14,
      position: 'relative',
      zIndex: 1,
      background: theme.headerBg,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    },
    footerLink: {
      color: theme.accent,
      textDecoration: 'none',
      margin: '0 8px',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.glow1} aria-hidden="true" />
      <div style={styles.glow2} aria-hidden="true" />
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>AI</div>
          <span style={styles.logoText}>AIST</span>
        </Link>
        <Link to="/login" style={styles.cta}>Войти</Link>
      </nav>

      <section style={styles.hero}>
        <p style={styles.heroLabel}>Мессенджер нового поколения</p>
        <h1 style={styles.heroTitle}>AIST</h1>
        <p style={styles.heroSub}>
          Коммуникация без границ. Чаты, звонки, каналы и истории — всё в одном месте.
        </p>
        <p style={styles.heroTagline}>
          Сквозное шифрование · Полная приватность · Безопасность данных
        </p>
        <div style={styles.heroButtons}>
          <Link to="/login" style={styles.heroCta}>Начать общение</Link>
          <Link to="/login" style={styles.heroCtaSecondary}>Узнать больше</Link>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Возможности</h2>
        <p style={styles.sectionText}>
          Всё необходимое для комфортного общения с друзьями, семьёй и коллегами.
        </p>
        <div style={styles.features}>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>💬</div>
            <div style={styles.featureTitle}>Чаты</div>
            <p style={styles.featureText}>Личные переписки, групповые чаты с тысячами участников, поиск по сообщениям и файлы.</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>📞</div>
            <div style={styles.featureTitle}>Звонки</div>
            <p style={styles.featureText}>Голосовые и видеозвонки один на один. Кристальный звук и высокое качество видео.</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>📺</div>
            <div style={styles.featureTitle}>Каналы</div>
            <p style={styles.featureText}>Создавайте каналы для новостей и контента. Админы, модераторы и неограниченная аудитория.</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>🔍</div>
            <div style={styles.featureTitle}>Поиск по нику</div>
            <p style={styles.featureText}>Находите друзей по уникальному нику. Ник отображается отдельно от имени.</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>📸</div>
            <div style={styles.featureTitle}>Истории</div>
            <p style={styles.featureText}>Делитесь моментами своей жизни через фото и видео истории. Автоудаление через 24 часа.</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>🔒</div>
            <div style={styles.featureTitle}>Шифрование</div>
            <p style={styles.featureText}>Сквозное шифрование (E2E) для максимальной безопасности. Только вы и собеседник.</p>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <div style={{ marginBottom: 16 }}>
          <Link to="/login" style={styles.footerLink}>Войти</Link>
          ·
          <Link to="/login" style={styles.footerLink}>Регистрация</Link>
          ·
          <a href="https://t.me/AIST_SMS_BOT" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>Telegram бот</a>
        </div>
        <div>AIST · Удобный · Комфортный · Безопасный</div>
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>© 2026 AIST Messenger</div>
      </footer>
    </div>
  );
}
