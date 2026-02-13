import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  IconChats, IconCalls, IconCamera, IconLock, IconSearch,
  IconPhone, IconVideo, IconChannel, IconGroup, IconStories
} from '../components/Icons';

export default function Landing() {
  const { theme, isDark } = useTheme();

  const accent = typeof theme.accent === 'string' ? theme.accent : '#0a84ff';
  const accentText = theme.accentText || '#ffffff';

  const styles = {
    page: {
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      background: theme.pageBg,
      color: theme.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      position: 'relative',
    },
    // Эффекты свечения и градиентов
    glow1: {
      position: 'fixed',
      top: '-25%',
      right: '-15%',
      width: '700px',
      height: '700px',
      background: 'radial-gradient(circle, rgba(10, 132, 255, .18) 0%, transparent 65%)',
      pointerEvents: 'none',
      filter: 'blur(90px)',
      zIndex: 0,
    },
    glow2: {
      position: 'fixed',
      bottom: '-20%',
      left: '-15%',
      width: '600px',
      height: '600px',
      background: 'radial-gradient(circle, rgba(94, 92, 230, .15) 0%, transparent 65%)',
      pointerEvents: 'none',
      filter: 'blur(80px)',
      zIndex: 0,
    },
    glow3: {
      position: 'fixed',
      top: '40%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '500px',
      height: '500px',
      background: 'radial-gradient(circle, rgba(10, 132, 255, .08) 0%, transparent 60%)',
      pointerEvents: 'none',
      filter: 'blur(100px)',
      zIndex: 0,
    },
    // Навигация с Liquid Glass эффектом
    nav: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      height: 72,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      background: theme.headerBg,
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: `1px solid ${theme.border}`,
      boxShadow: isDark
        ? '0 8px 32px rgba(0, 0, 0, .2), inset 0 1px 0 rgba(255, 255, 255, .05)'
        : '0 8px 32px rgba(0, 0, 0, .06), inset 0 1px 0 rgba(255, 255, 255, .8)',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      textDecoration: 'none',
      color: theme.text,
      transition: 'transform 0.2s',
    },
    logoIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      background: accent,
      boxShadow: `0 8px 28px ${theme.glow || 'rgba(10, 132, 255, .35)'}`,
      display: 'grid',
      placeItems: 'center',
      fontWeight: 800,
      fontSize: 14,
      color: accentText,
    },
    logoText: { fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' },
    cta: {
      padding: '14px 28px',
      borderRadius: 16,
      background: accent,
      color: accentText,
      fontSize: 15,
      fontWeight: 600,
      textDecoration: 'none',
      letterSpacing: '-0.01em',
      boxShadow: `0 8px 24px ${theme.glow || 'rgba(10, 132, 255, .3)'}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    // Hero секция
    hero: {
      paddingTop: 180,
      paddingBottom: 120,
      paddingLeft: 24,
      paddingRight: 24,
      textAlign: 'center',
      maxWidth: 1000,
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    },
    heroBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 20px',
      borderRadius: 30,
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
      backdropFilter: 'blur(20px) saturate(140%)',
      WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      fontSize: 13,
      fontWeight: 600,
      color: theme.textMuted,
      marginBottom: 28,
      boxShadow: isDark
        ? '0 8px 24px rgba(0, 0, 0, .15), inset 0 1px 0 rgba(255, 255, 255, .08)'
        : '0 8px 24px rgba(0, 0, 0, .08), inset 0 1px 0 rgba(255, 255, 255, .8)',
    },
    heroTitle: {
      fontSize: 'clamp(56px, 11vw, 88px)',
      fontWeight: 800,
      lineHeight: 1.02,
      letterSpacing: '-0.04em',
      margin: '0 0 28px',
      background: isDark
        ? 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,.82) 100%)'
        : 'linear-gradient(180deg, #1a1f35 0%, #3a4260 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    heroSub: {
      fontSize: 'clamp(18px, 2.5vw, 22px)',
      lineHeight: 1.6,
      color: theme.textMuted,
      margin: '0 0 20px',
      fontWeight: 400,
      maxWidth: 620,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    heroTagline: {
      fontSize: 'clamp(16px, 2vw, 18px)',
      color: theme.textMuted,
      marginBottom: 52,
      fontWeight: 500,
    },
    heroButtons: {
      display: 'flex',
      gap: 18,
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    heroCta: {
      padding: '18px 48px',
      borderRadius: 18,
      background: accent,
      color: accentText,
      fontSize: 17,
      fontWeight: 600,
      textDecoration: 'none',
      letterSpacing: '-0.01em',
      boxShadow: `0 12px 36px ${theme.glow || 'rgba(10, 132, 255, .4)'}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    heroCtaSecondary: {
      padding: '18px 48px',
      borderRadius: 18,
      background: theme.cardBg,
      color: theme.text,
      fontSize: 17,
      fontWeight: 600,
      textDecoration: 'none',
      letterSpacing: '-0.01em',
      border: `1px solid ${theme.border}`,
      backdropFilter: 'blur(20px) saturate(140%)',
      WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    // Секция возможностей
    section: {
      padding: '120px 24px',
      maxWidth: 1200,
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    },
    sectionHeader: {
      textAlign: 'center',
      marginBottom: 80,
    },
    sectionTitle: {
      fontSize: 42,
      fontWeight: 700,
      letterSpacing: '-0.03em',
      margin: '0 0 20px',
      color: theme.text,
    },
    sectionText: {
      fontSize: 19,
      lineHeight: 1.6,
      color: theme.textMuted,
      margin: 0,
      maxWidth: 600,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    features: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: 28,
    },
    feature: {
      padding: 40,
      borderRadius: 24,
      background: theme.cardBg,
      border: `1px solid ${theme.cardBorder}`,
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      boxShadow: isDark
        ? '0 20px 60px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.06)'
        : '0 20px 60px rgba(80,120,180,.12), inset 0 1px 0 rgba(255,255,255,.9)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    },
    featureIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      background: accent,
      display: 'grid',
      placeItems: 'center',
      marginBottom: 22,
      fontSize: 26,
      color: accentText,
      boxShadow: `0 8px 24px ${theme.glow || 'rgba(10, 132, 255, .3)'}`,
    },
    featureTitle: { fontSize: 20, fontWeight: 700, marginBottom: 12, color: theme.text, letterSpacing: '-0.01em' },
    featureText: { fontSize: 15, lineHeight: 1.6, color: theme.textMuted, margin: 0 },
    // Демонстрация интерфейса
    demo: {
      marginTop: 100,
      borderRadius: 28,
      overflow: 'hidden',
      border: `1px solid ${theme.border}`,
      boxShadow: isDark
        ? '0 32px 96px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.05)'
        : '0 32px 96px rgba(80,120,180,.18), inset 0 1px 0 rgba(255,255,255,.9)',
      background: theme.cardBg,
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    },
    demoHeader: {
      display: 'flex',
      gap: 8,
      padding: 16,
      borderBottom: `1px solid ${theme.border}`,
      background: theme.headerBg,
    },
    demoDot: (color) => ({
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: color,
    }),
    demoContent: {
      display: 'flex',
      minHeight: 400,
    },
    demoSidebar: {
      width: 320,
      borderRight: `1px solid ${theme.border}`,
      padding: 16,
      background: theme.sidebarBg,
    },
    demoChat: {
      flex: 1,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    },
    demoChatItem: {
      display: 'flex',
      gap: 12,
      padding: '12px 16px',
      borderRadius: 16,
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
    },
    demoAvatar: {
      width: 48,
      height: 48,
      borderRadius: '50%',
      background: accent,
      display: 'grid',
      placeItems: 'center',
      color: accentText,
      fontWeight: 600,
    },
    demoBubble: {
      maxWidth: '70%',
      padding: '14px 18px',
      borderRadius: 20,
      fontSize: 14,
      lineHeight: 1.5,
    },
    demoBubbleIn: {
      background: theme.bubbleIn,
      color: theme.text,
      borderRadius: '20px 20px 20px 6px',
    },
    demoBubbleOut: {
      background: theme.bubbleOut,
      color: accentText,
      borderRadius: '20px 20px 6px 20px',
      alignSelf: 'flex-end',
    },
    // Footer
    footer: {
      padding: '80px 24px 40px',
      textAlign: 'center',
      borderTop: `1px solid ${theme.border}`,
      color: theme.textMuted,
      fontSize: 14,
      position: 'relative',
      zIndex: 1,
      background: theme.headerBg,
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
    },
    footerLink: {
      color: accent,
      textDecoration: 'none',
      margin: '0 12px',
      fontWeight: 500,
      transition: 'opacity 0.2s',
    },
    footerLogo: {
      fontSize: 28,
      fontWeight: 800,
      color: theme.text,
      marginBottom: 24,
      letterSpacing: '-0.03em',
    },
  };

  return (
    <div style={styles.page}>
      {/* Фоновые эффекты */}
      <div style={styles.glow1} aria-hidden="true" />
      <div style={styles.glow2} aria-hidden="true" />
      <div style={styles.glow3} aria-hidden="true" />

      {/* Навигация */}
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>AI</div>
          <span style={styles.logoText}>AIST</span>
        </Link>
        <Link to="/login" style={styles.cta}>Войти</Link>
      </nav>

      {/* Hero секция */}
      <section style={styles.hero}>
        <div style={styles.heroBadge}>
          <span>🚀</span>
          <span>Мессенджер нового поколения</span>
        </div>
        <h1 style={styles.heroTitle}>AIST</h1>
        <p style={styles.heroSub}>
          Коммуникация без границ. Чаты, звонки, каналы и истории — всё в одном месте.
        </p>
        <p style={styles.heroTagline}>
          🔒 Сквозное шифрование · ⚡ Мгновенные сообщения · 🌍 Безопасность данных
        </p>
        <div style={styles.heroButtons}>
          <Link to="/login" style={styles.heroCta}>Начать общение</Link>
          <Link to="/login" style={styles.heroCtaSecondary}>Узнать больше</Link>
        </div>
      </section>

      {/* Демонстрация интерфейса */}
      <section style={styles.section}>
        <div style={styles.demo}>
          <div style={styles.demoHeader}>
            <div style={styles.demoDot('#ff5f57')} />
            <div style={styles.demoDot('#febc2e')} />
            <div style={styles.demoDot('#28c840')} />
          </div>
          <div style={styles.demoContent}>
            <div style={styles.demoSidebar}>
              <div style={{ marginBottom: 16, fontSize: 20, fontWeight: 700, color: theme.text }}>
                Чаты
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} style={styles.demoChatItem}>
                  <div style={styles.demoAvatar}>{i}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>
                      Пользователь {i}
                    </div>
                    <div style={{ fontSize: 12, color: theme.textMuted }}>
                      Привет! Как дела?
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: theme.textMuted }}>
                    {12 + i}:{30 + i * 5}
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.demoChat}>
              <div style={styles.demoBubbleIn}>
                Привет! Как твои дела? 👋
              </div>
              <div style={styles.demoBubbleOut}>
                Отлично! Работаю над новым проектом 🚀
              </div>
              <div style={styles.demoBubbleIn}>
                Звучит интересно! Расскажи подробнее
              </div>
              <div style={{ marginTop: 'auto', padding: '16px', borderRadius: 24, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.textMuted }}>
                Написать сообщение...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Возможности */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Возможности</h2>
          <p style={styles.sectionText}>
            Всё необходимое для комфортного общения с друзьями, семьёй и коллегами.
          </p>
        </div>
        <div style={styles.features}>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              <IconChats width={28} height={28} />
            </div>
            <div style={styles.featureTitle}>Чаты</div>
            <p style={styles.featureText}>Личные переписки, групповые чаты с тысячами участников, поиск по сообщениям и файлы.</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              <IconCalls width={28} height={28} />
            </div>
            <div style={styles.featureTitle}>Звонки</div>
            <p style={styles.featureText}>Голосовые и видеозвонки один на один. Кристальный звук и высокое качество видео.</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              <IconChannel width={28} height={28} />
            </div>
            <div style={styles.featureTitle}>Каналы</div>
            <p style={styles.featureText}>Создавайте каналы для новостей и контента. Админы, модераторы и неограниченная аудитория.</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              <IconStories width={28} height={28} />
            </div>
            <div style={styles.featureTitle}>Истории</div>
            <p style={styles.featureText}>Делитесь моментами своей жизни через фото и видео истории. Автоудаление через 24 часа.</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              <IconCamera width={28} height={28} />
            </div>
            <div style={styles.featureTitle}>Медиа</div>
            <p style={styles.featureText}>Отправляйте фото и видео высокого качества. Автоматическое сжатие и быстрая загрузка.</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              <IconLock width={28} height={28} />
            </div>
            <div style={styles.featureTitle}>Шифрование</div>
            <p style={styles.featureText}>Сквозное шифрование (E2E) для максимальной безопасности. Только вы и собеседник.</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              <IconGroup width={28} height={28} />
            </div>
            <div style={styles.featureTitle}>Группы</div>
            <p style={styles.featureText}>Создавайте группы до 200 000 участников. Админы, права доступа и модерация.</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              <IconPhone width={28} height={28} />
            </div>
            <div style={styles.featureTitle}>Голосовые сообщения</div>
            <p style={styles.featureText}>Записывайте и отправляйте голосовые сообщения. Удобно и быстро.</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              <IconVideo width={28} height={28} />
            </div>
            <div style={styles.featureTitle}>Видеозвонки</div>
            <p style={styles.featureText}>Видеозвонки с высоким качеством. Коммуникация как вживую.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>AIST</div>
        <div style={{ marginBottom: 24 }}>
          <Link to="/login" style={styles.footerLink}>Войти</Link>
          <Link to="/login" style={styles.footerLink}>Регистрация</Link>
          <a href="https://t.me/AIST_SMS_BOT" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>Telegram бот</a>
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: theme.text, marginBottom: 8 }}>
          Удобный · Комфортный · Безопасный
        </div>
        <div style={{ marginTop: 16, fontSize: 13, opacity: 0.6 }}>© 2026 AIST Messenger. Все права защищены.</div>
      </footer>
    </div>
  );
}
