import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
    background: 'linear-gradient(180deg, #000 0%, #0a0a0f 40%, #050508 100%)',
    color: '#f5f5f7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
    overflowX: 'hidden',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    position: 'relative',
  },
  glow: {
    position: 'fixed',
    top: '-40%',
    left: '50%',
    width: '120%',
    height: '80%',
    transform: 'translateX(-50%)',
    background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(10, 132, 255, .18) 0%, transparent 55%)',
    pointerEvents: 'none',
  },
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    background: 'rgba(0,0,0,.4)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,.06)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    textDecoration: 'none',
    color: '#f5f5f7',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
    boxShadow: '0 4px 20px rgba(10, 132, 255, .35)',
  },
  logoText: { fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em' },
  cta: {
    padding: '10px 22px',
    borderRadius: 980,
    background: '#fff',
    color: '#000',
    fontSize: 15,
    fontWeight: 600,
    textDecoration: 'none',
    letterSpacing: '-0.02em',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  hero: {
    paddingTop: 140,
    paddingBottom: 100,
    paddingLeft: 24,
    paddingRight: 24,
    textAlign: 'center',
    maxWidth: 900,
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  heroLabel: {
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: 0.5,
    color: 'rgba(255,255,255,.55)',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 'clamp(48px, 10vw, 72px)',
    fontWeight: 800,
    lineHeight: 1.02,
    letterSpacing: '-0.035em',
    margin: '0 0 20px',
    background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,.88) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSub: {
    fontSize: 'clamp(20px, 2.8vw, 26px)',
    lineHeight: 1.4,
    color: 'rgba(255,255,255,.75)',
    margin: '0 0 12px',
    fontWeight: 400,
    maxWidth: 560,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  heroTagline: {
    fontSize: 'clamp(17px, 2vw, 20px)',
    color: 'rgba(255,255,255,.5)',
    marginBottom: 44,
    fontWeight: 500,
  },
  heroCta: {
    display: 'inline-block',
    padding: '18px 40px',
    borderRadius: 980,
    background: 'linear-gradient(90deg, #0a84ff, #5e5ce6)',
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    textDecoration: 'none',
    letterSpacing: '-0.02em',
    boxShadow: '0 8px 32px rgba(10, 132, 255, .4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  section: {
    padding: '90px 24px',
    maxWidth: 980,
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 700,
    letterSpacing: '-0.03em',
    margin: '0 0 16px',
    color: '#f5f5f7',
  },
  sectionText: {
    fontSize: 20,
    lineHeight: 1.5,
    color: 'rgba(255,255,255,.68)',
    margin: 0,
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 28,
    marginTop: 56,
  },
  feature: {
    padding: 32,
    borderRadius: 20,
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.08)',
    transition: 'transform 0.2s, border-color 0.2s',
  },
  featureTitle: { fontSize: 18, fontWeight: 600, marginBottom: 10, color: '#f5f5f7' },
  featureText: { fontSize: 15, lineHeight: 1.45, color: 'rgba(255,255,255,.6)', margin: 0 },
  footer: {
    padding: '56px 24px',
    textAlign: 'center',
    borderTop: '1px solid rgba(255,255,255,.06)',
    color: 'rgba(255,255,255,.45)',
    fontSize: 13,
    position: 'relative',
    zIndex: 1,
  },
};

export default function Landing() {
  return (
    <div style={styles.page}>
      <div style={styles.glow} aria-hidden="true" />
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon} />
          <span style={styles.logoText}>AIST</span>
        </Link>
        <Link to="/login" style={styles.cta}>Войти</Link>
      </nav>

      <section style={styles.hero}>
        <p style={styles.heroLabel}>Мессенджер</p>
        <h1 style={styles.heroTitle}>AIST</h1>
        <p style={styles.heroSub}>
          Удобный, комфортный и безопасный. Чаты, звонки и каналы — без лишнего шума.
        </p>
        <p style={styles.heroTagline}>
          Шифрование. Только вы и собеседники. Подключиться к звонку невозможно.
        </p>
        <Link to="/login" style={styles.heroCta}>Открыть в браузере</Link>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Чаты и звонки</h2>
        <p style={styles.sectionText}>
          Переписка один на один и в группах, голос и видео. Всё под вашим контролем.
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
        AIST · Удобный. Комфортный. Безопасный.
      </footer>
    </div>
  );
}
