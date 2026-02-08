import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { createChat, saveChannelMeta } from '../lib/chatStorage';

export default function ChannelCreateModal({ onClose, onCreated }) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [admins, setAdmins] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [adminInput, setAdminInput] = useState('');
  const [modInput, setModInput] = useState('');
  const [created, setCreated] = useState(null);

  const addAdmin = () => {
    const n = adminInput.replace(/^@/, '').trim().toLowerCase();
    if (n && !admins.includes(n)) setAdmins([...admins, n]);
    setAdminInput('');
  };
  const addMod = () => {
    const n = modInput.replace(/^@/, '').trim().toLowerCase();
    if (n && !moderators.includes(n)) setModerators([...moderators, n]);
    setModInput('');
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const chatId = createChat({
      name: name.trim(),
      type: 'channel',
      description: description.trim(),
      admins,
      moderators,
    });
    setCreated(chatId);
  };

  const meta = created ? { description, shareLink: `https://get-aist.ru/c/${created}`, admins, moderators } : null;
  if (created) saveChannelMeta(created, meta);

  const copyLink = () => {
    if (meta?.shareLink) {
      navigator.clipboard?.writeText(meta.shareLink);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 24,
    },
    modal: {
      width: '100%',
      maxWidth: 440,
      maxHeight: '90vh',
      overflowY: 'auto',
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
      borderRadius: 16,
      padding: 24,
    },
    title: { fontSize: 20, fontWeight: 600, marginBottom: 20, color: theme.text },
    field: { marginBottom: 16 },
    label: { fontSize: 13, color: theme.textMuted, marginBottom: 6, display: 'block' },
    input: {
      width: '100%',
      padding: '12px 14px',
      borderRadius: 12,
      border: `1px solid ${theme.inputBorder}`,
      background: theme.inputBg,
      color: theme.text,
      fontSize: 14,
      outline: 'none',
    },
    textarea: { minHeight: 80, resize: 'vertical' },
    row: { display: 'flex', gap: 8, marginTop: 8 },
    tag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      borderRadius: 8,
      background: theme.sidebarBg,
      fontSize: 13,
      color: theme.text,
      marginRight: 6,
      marginBottom: 6,
    },
    btn: {
      padding: '10px 18px',
      borderRadius: 10,
      border: 'none',
      background: theme.accent,
      color: theme.accentText,
      fontWeight: 600,
      fontSize: 14,
      cursor: 'pointer',
    },
    btnSecondary: {
      background: theme.sidebarBg,
      color: theme.text,
    },
    linkBox: {
      marginTop: 16,
      padding: 12,
      borderRadius: 12,
      background: theme.sidebarBg,
      fontSize: 13,
      wordBreak: 'break-all',
      color: theme.text,
    },
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>
          {created ? 'Канал создан' : 'Новый канал'}
        </h2>

        {!created ? (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Название канала</label>
              <input
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Новости, блог..."
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Описание</label>
              <textarea
                style={{ ...styles.input, ...styles.textarea }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="О чём канал"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Админы (никнеймы через @)</label>
              <div style={styles.row}>
                <input
                  style={styles.input}
                  value={adminInput}
                  onChange={(e) => setAdminInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAdmin()}
                  placeholder="@ник"
                />
                <button type="button" style={styles.btn} onClick={addAdmin}>Добавить</button>
              </div>
              <div style={{ marginTop: 8 }}>
                {admins.map((a) => (
                  <span key={a} style={styles.tag}>@{a}</span>
                ))}
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Модераторы</label>
              <div style={styles.row}>
                <input
                  style={styles.input}
                  value={modInput}
                  onChange={(e) => setModInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMod()}
                  placeholder="@ник"
                />
                <button type="button" style={styles.btn} onClick={addMod}>Добавить</button>
              </div>
              <div style={{ marginTop: 8 }}>
                {moderators.map((m) => (
                  <span key={m} style={styles.tag}>@{m}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button type="button" style={styles.btn} onClick={handleCreate}>Создать канал</button>
              <button type="button" style={{ ...styles.btn, ...styles.btnSecondary }} onClick={onClose}>Отмена</button>
            </div>
          </>
        ) : (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Ссылка для приглашения в канал</label>
              <div style={styles.linkBox}>{meta?.shareLink}</div>
              <button type="button" style={{ ...styles.btn, marginTop: 10 }} onClick={copyLink}>
                Копировать ссылку
              </button>
            </div>
            <button type="button" style={styles.btn} onClick={() => { onCreated(created); onClose(); }}>
              Перейти в канал
            </button>
          </>
        )}
      </div>
    </div>
  );
}
