import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
    background: '#000',
    color: '#f5f5f7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
    overflowX: 'hidden',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 22px',
    background: 'rgba(0,0,0,.72)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,.08)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    color: '#f5f5f7',
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #0a84ff, #5e5ce6)',
  },
  logoText: { fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' },
  cta: {
    padding: '8px 18px',
    borderRadius: 980,
    background: '#fff',
    color: '#000',
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    letterSpacing: '-0.01em',
  },
  hero: {
    paddingTop: 120,
    paddingBottom: 80,
    paddingLeft: 24,
    paddingRight: 24,
    textAlign: 'center',
    maxWidth: 980,
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: 'clamp(40px, 8vw, 64px)',
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: '-0.025em',
    margin: '0 0 16px',
    background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,.85) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSub: {
    fontSize: 'clamp(19px, 2.5vw, 24px)',
    lineHeight: 1.35,
    color: 'rgba(255,255,255,.72)',
    margin: '0 0 40px',
    fontWeight: 400,
  },
  heroCta: {
    display: 'inline-block',
    padding: '16px 32px',
    borderRadius: 980,
    background: '#0a84ff',
    color: '#fff',
    fontSize: 17,
    fontWeight: 600,
    textDecoration: 'none',
    letterSpacing: '-0.02em',
  },
  section: {
    padding: '80px 24px',
    maxWidth: 980,
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 600,
    letterSpacing: '-0.02em',
    margin: '0 0 12px',
    color: '#f5f5f7',
  },
  sectionText: {
    fontSize: 19,
    lineHeight: 1.45,
    color: 'rgba(255,255,255,.7)',
    margin: 0,
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 24,
    marginTop: 48,
  },
  feature: {
    padding: 28,
    borderRadius: 18,
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.08)',
  },
  featureTitle: { fontSize: 17, fontWeight: 600, marginBottom: 8, color: '#f5f5f7' },
  featureText: { fontSize: 15, lineHeight: 1.4, color: 'rgba(255,255,255,.65)', margin: 0 },
  footer: {
    padding: '48px 24px',
    textAlign: 'center',
    borderTop: '1px solid rgba(255,255,255,.08)',
    color: 'rgba(255,255,255,.5)',
    fontSize: 12,
  },
};

export default function Landing() {
  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon} />
          <span style={styles.logoText}>AIST</span>
        </Link>
        <Link to="/login" style={styles.cta}>Войти</Link>
      </nav>

      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Artificial Intelligence Solution Technology</h1>
        <p style={styles.heroSub}>
          Мессенджер для России. Шифрование, чаты на ваших устройствах, звонки и каналы — без лишнего шума.
        </p>
        <Link to="/login" style={styles.heroCta}>Открыть в браузере</Link>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Чаты и звонки</h2>
        <p style={styles.sectionText}>
          Переписка один на один и в группах, голос и видео. Только вы и собеседники — подключиться к звонку нельзя.
        </p>
        <div style={styles.features}>
          <div style={styles.feature}>
            <div style={styles.featureTitle}>Каналы</div>
            <p style={styles.featureText}>Публикация новостей, админы и модераторы, ссылка для подписчиков.</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureTitle}>Поиск по нику</div>
            <p style={styles.featureText}>Найдите человека по нику — ник не отображается в имени.</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureTitle}>Истории</div>
            <p style={styles.featureText}>Фото и видео на вашей странице, как в современных мессенджерах.</p>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        AIST · Россия
      </footer>
    </div>
  );
}
