import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { requestNotificationPermission } from '../lib/notifications';
import { IconBack, IconChevronRight, IconCamera } from './Icons';

const SECTIONS = [
  { id: 'notifications', title: 'Уведомления' },
  { id: 'privacy', title: 'Конфиденциальность' },
  { id: 'appearance', title: 'Внешний вид' },
  { id: 'qr', title: 'QR-код' },
];

export default function Settings() {
  const { theme, themeId, setThemeId, themeList } = useTheme();
  const { displayName, username, usernameFormatted, usernameError, setDisplayName, setUsername, setProfilePhoto, profilePhoto } = useUser();
  const [view, setView] = useState('main');
  const [notifications, setNotifications] = useState(() => localStorage.getItem('aist_notifications') !== 'false');
  const [privacyWrite, setPrivacyWrite] = useState('everyone');
  const [privacyStatus, setPrivacyStatus] = useState('everyone');
  const [privacyStories, setPrivacyStories] = useState('contacts');

  const saveNotifications = async (v) => {
    if (v) {
      const perm = await requestNotificationPermission();
      if (perm !== 'granted') v = false;
    }
    setNotifications(v);
    try { localStorage.setItem('aist_notifications', v ? 'true' : 'false'); } catch {}
  };

  const onPhotoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f?.type.startsWith('image/')) return;
    const r = new FileReader();
    r.onload = () => setProfilePhoto(r.result);
    r.readAsDataURL(f);
  };

  const base = {
    container: { height: '100%', overflowY: 'auto', background: theme.pageBg, color: theme.text },
    header: { height: 56, padding: '0 8px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${theme.border}`, background: theme.headerBg },
    backBtn: { border: 'none', background: 'transparent', color: theme.accent, padding: 8, cursor: 'pointer' },
    headerTitle: { flex: 1, fontSize: 17, fontWeight: 600 },
    profileCard: { padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, borderBottom: `1px solid ${theme.border}` },
    avatarWrap: { width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', background: theme.sidebarBg, position: 'relative', cursor: 'pointer' },
    avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
    avatarPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted },
    nameInput: { padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: 16, width: '100%', maxWidth: 280, outline: 'none', textAlign: 'center' },
    usernameInput: { padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: 15, width: '100%', maxWidth: 280, outline: 'none', textAlign: 'center' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${theme.border}`, background: theme.cardBg, cursor: 'pointer' },
    rowLabel: { fontSize: 16, color: theme.text },
    rowSub: { fontSize: 14, color: theme.textMuted, marginTop: 2 },
    toggle: { width: 50, height: 28, borderRadius: 14, background: notifications ? theme.accent : theme.sidebarBg, position: 'relative', cursor: 'pointer', flexShrink: 0 },
    toggleThumb: { width: 24, height: 24, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: notifications ? 24 : 2, transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' },
    sectionTitle: { padding: '12px 16px', fontSize: 14, color: theme.textMuted, textTransform: 'uppercase' },
    logoutRow: { padding: 14, borderBottom: `1px solid ${theme.border}`, background: theme.cardBg, cursor: 'pointer' },
    logoutText: { fontSize: 16, color: '#e53935', fontWeight: 500 },
  };

  if (view !== 'main') {
    return (
      <div style={base.container}>
        <header style={base.header}>
          <button type="button" style={base.backBtn} onClick={() => setView('main')}><IconBack width={24} height={24} /></button>
          <span style={base.headerTitle}>{SECTIONS.find((s) => s.id === view)?.title || view}</span>
        </header>
        {view === 'notifications' && (
          <div style={{ padding: 16 }}>
            <div style={base.row}>
              <span style={base.rowLabel}>Уведомления</span>
              <div style={base.toggle} onClick={() => saveNotifications(!notifications)}><div style={base.toggleThumb} /></div>
            </div>
          </div>
        )}
        {view === 'privacy' && (
          <div style={{ padding: 16 }}>
            <div style={base.row}>
              <div><div style={base.rowLabel}>Кто может писать</div><div style={base.rowSub}>{privacyWrite === 'everyone' ? 'Все' : privacyWrite === 'contacts' ? 'Контакты' : 'Никто'}</div></div>
              <select value={privacyWrite} onChange={(e) => setPrivacyWrite(e.target.value)} style={{ border: 'none', background: 'transparent', color: theme.accent, fontSize: 15, cursor: 'pointer' }}>
                <option value="everyone">Все</option><option value="contacts">Контакты</option><option value="nobody">Никто</option>
              </select>
            </div>
            <div style={base.row}>
              <div><div style={base.rowLabel}>Кто видит статус</div></div>
              <select value={privacyStatus} onChange={(e) => setPrivacyStatus(e.target.value)} style={{ border: 'none', background: 'transparent', color: theme.accent, fontSize: 15, cursor: 'pointer' }}>
                <option value="everyone">Все</option><option value="contacts">Контакты</option><option value="nobody">Никто</option>
              </select>
            </div>
            <div style={base.row}>
              <div><div style={base.rowLabel}>Кто видит истории</div></div>
              <select value={privacyStories} onChange={(e) => setPrivacyStories(e.target.value)} style={{ border: 'none', background: 'transparent', color: theme.accent, fontSize: 15, cursor: 'pointer' }}>
                <option value="everyone">Все</option><option value="contacts">Контакты</option><option value="nobody">Никто</option>
              </select>
            </div>
          </div>
        )}
        {view === 'appearance' && (
          <div style={{ padding: 16 }}>
            <div style={base.sectionTitle}>Тема</div>
            {themeList.map((t) => (
              <div key={t.id} style={base.row} onClick={() => setThemeId(t.id)}>
                <span style={base.rowLabel}>{t.label}</span>
                {themeId === t.id && <span style={{ color: theme.accent, fontSize: 14 }}>✓</span>}
              </div>
            ))}
          </div>
        )}
        {view === 'qr' && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={base.rowLabel}>Мой QR для контактов</div>
            <div style={{ padding: 16, background: '#fff', borderRadius: 12, marginTop: 12 }}>
              <QRCodeSVG value={username ? `https://get-aist.ru/add/${username}` : 'https://get-aist.ru/me'} size={200} level="M" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={base.container}>
      <header style={base.header}>
        <span style={base.headerTitle}>Настройки</span>
      </header>
      <div style={base.profileCard}>
        <label style={base.avatarWrap}>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onPhotoChange} />
          {profilePhoto ? <img src={profilePhoto} alt="" style={base.avatarImg} /> : <div style={base.avatarPlaceholder}><IconCamera width={40} height={40} /></div>}
        </label>
        <input type="text" style={base.nameInput} placeholder="Имя" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={64} />
        <input type="text" style={{ ...base.usernameInput, ...(usernameError ? { borderColor: '#e53935' } : {}) }} placeholder="Ник для поиска (@ник)" value={username ? `@${username}` : ''} onChange={(e) => setUsername(e.target.value)} maxLength={33} />
        {usernameError && <span style={{ fontSize: 12, color: '#e53935' }}>{usernameError}</span>}
      </div>
      <div style={base.sectionTitle}>Настройки</div>
      {SECTIONS.map((s) => (
        <div key={s.id} style={base.row} onClick={() => setView(s.id)}>
          <span style={base.rowLabel}>{s.title}</span>
          <IconChevronRight width={20} height={20} style={{ color: theme.textMuted }} />
        </div>
      ))}
      <div style={base.sectionTitle}>Аккаунт</div>
      <div style={base.logoutRow} onClick={() => { localStorage.removeItem('aist_token'); window.location.assign('/'); }}>
        <span style={base.logoutText}>Выйти</span>
      </div>
    </div>
  );
}
