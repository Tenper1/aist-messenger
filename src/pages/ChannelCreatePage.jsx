import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { IconBack, IconCamera } from '../components/Icons';
import { createChat, saveChannelMeta } from '../lib/chatStorage';

const steps = ['Название и фото', 'Описание', 'Админы и ссылка'];

export default function ChannelCreatePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [channelPhoto, setChannelPhoto] = useState('');
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

  const onPhotoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    const r = new FileReader();
    r.onload = () => setChannelPhoto(r.result);
    r.readAsDataURL(f);
  };

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else createChannel();
  };

  const createChannel = () => {
    if (!name.trim()) return;
    const chatId = createChat({
      name: name.trim(),
      type: 'channel',
      description: description.trim(),
      admins,
      moderators,
    });
    saveChannelMeta(chatId, {
      description: description.trim(),
      shareLink: `https://get-aist.ru/c/${chatId}`,
      admins,
      moderators,
    });
    setCreated(chatId);
  };

  const copyLink = () => {
    const link = `https://get-aist.ru/c/${created}`;
    navigator.clipboard?.writeText(link);
  };

  const base = {
    page: { minHeight: '100%', background: theme.pageBg, color: theme.text },
    header: {
      height: 56,
      padding: '0 8px 0 4px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      borderBottom: `1px solid ${theme.border}`,
      background: theme.headerBg,
    },
    backBtn: { border: 'none', background: 'transparent', color: theme.accent, padding: 8, cursor: 'pointer' },
    title: { flex: 1, fontSize: 17, fontWeight: 600, textAlign: 'center' },
    nextBtn: { border: 'none', background: 'transparent', color: theme.accent, fontSize: 16, padding: '8px 12px', cursor: 'pointer' },
    content: { padding: 16 },
    field: { marginBottom: 20 },
    label: { fontSize: 14, color: theme.textMuted, marginBottom: 8, display: 'block' },
    input: {
      width: '100%',
      padding: '12px 14px',
      borderRadius: 8,
      border: `1px solid ${theme.border}`,
      background: theme.inputBg,
      color: theme.text,
      fontSize: 16,
      outline: 'none',
    },
    textarea: { minHeight: 80, resize: 'vertical' },
    photoWrap: {
      width: 120,
      height: 120,
      borderRadius: '50%',
      background: theme.sidebarBg,
      border: `2px solid ${theme.border}`,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      position: 'relative',
    },
    photoImg: { width: '100%', height: '100%', objectFit: 'cover' },
    tag: { display: 'inline-block', padding: '4px 10px', marginRight: 6, marginBottom: 6, borderRadius: 8, background: theme.sidebarBg, fontSize: 13 },
    linkBox: { padding: 12, borderRadius: 8, background: theme.sidebarBg, fontSize: 13, wordBreak: 'break-all', marginTop: 12 },
  };

  if (created) {
    return (
      <div style={base.page}>
        <header style={base.header}>
          <button type="button" style={base.backBtn} onClick={() => navigate('/messenger')}>
            <IconBack width={24} height={24} />
          </button>
          <span style={base.title}>Канал создан</span>
        </header>
        <div style={base.content}>
          <div style={base.label}>Ссылка для приглашения</div>
          <div style={base.linkBox}>https://get-aist.ru/c/{created}</div>
          <button type="button" onClick={copyLink} style={{ marginTop: 12, padding: '10px 20px', borderRadius: 8, border: 'none', background: theme.accent, color: theme.accentText, cursor: 'pointer' }}>
            Копировать ссылку
          </button>
          <button type="button" onClick={() => navigate('/messenger')} style={{ marginTop: 12, marginLeft: 8, padding: '10px 20px', borderRadius: 8, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.text, cursor: 'pointer' }}>
            В чаты
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={base.page}>
      <header style={base.header}>
        <button type="button" style={base.backBtn} onClick={() => (step === 0 ? navigate('/messenger') : setStep(step - 1))}>
          <IconBack width={24} height={24} />
        </button>
        <span style={base.title}>{steps[step]}</span>
        <button type="button" style={base.nextBtn} onClick={handleNext}>
          {step < 2 ? 'Далее' : 'Создать'}
        </button>
      </header>
      <div style={base.content}>
        {step === 0 && (
          <>
            <div style={base.field}>
              <label style={base.label}>Фото канала</label>
              <label style={base.photoWrap}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onPhotoChange} />
                {channelPhoto ? <img src={channelPhoto} alt="" style={base.photoImg} /> : <IconCamera width={40} height={40} style={{ color: theme.textMuted }} />}
              </label>
            </div>
            <div style={base.field}>
              <label style={base.label}>Название</label>
              <input style={base.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Название канала" />
            </div>
          </>
        )}
        {step === 1 && (
          <div style={base.field}>
            <label style={base.label}>Описание</label>
            <textarea style={{ ...base.input, ...base.textarea }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="О чём канал" />
          </div>
        )}
        {step === 2 && (
          <>
            <div style={base.field}>
              <label style={base.label}>Админы (@ник)</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input style={base.input} value={adminInput} onChange={(e) => setAdminInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addAdmin()} placeholder="@ник" />
                <button type="button" onClick={addAdmin} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: theme.accent, color: theme.accentText, cursor: 'pointer' }}>Добавить</button>
              </div>
              <div>{admins.map((a) => <span key={a} style={base.tag}>@{a}</span>)}</div>
            </div>
            <div style={base.field}>
              <label style={base.label}>Модераторы</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input style={base.input} value={modInput} onChange={(e) => setModInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addMod()} placeholder="@ник" />
                <button type="button" onClick={addMod} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: theme.accent, color: theme.accentText, cursor: 'pointer' }}>Добавить</button>
              </div>
              <div>{moderators.map((m) => <span key={m} style={base.tag}>@{m}</span>)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
