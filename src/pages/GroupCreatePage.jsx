import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { IconBack } from '../components/Icons';
import { createChat, addOrUpdateChat } from '../lib/chatStorage';
import { apiCreateChat } from '../lib/api';

export default function GroupCreatePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [name, setName] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    const created = await apiCreateChat({ name: name.trim(), type: 'group' });
    let id;
    if (created?.id) {
      id = created.id;
      addOrUpdateChat({ id: created.id, name: created.name || name.trim(), type: 'group', lastMessage: '', lastTime: null, unread: 0 });
    } else {
      id = createChat({ name: name.trim(), type: 'group' });
    }
    navigate('/messenger', { state: { openChatId: id } });
  };

  const base = {
    page: { minHeight: '100%', background: theme.pageBg, color: theme.text },
    header: { height: 56, padding: '0 8px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${theme.border}`, background: theme.headerBg },
    backBtn: { border: 'none', background: 'transparent', color: theme.accent, padding: 8, cursor: 'pointer' },
    title: { flex: 1, fontSize: 17, fontWeight: 600 },
    content: { padding: 16 },
    label: { fontSize: 14, color: theme.textMuted, marginBottom: 8, display: 'block' },
    input: { width: '100%', padding: '12px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: 16, outline: 'none' },
    btn: { marginTop: 24, padding: '12px 24px', borderRadius: 8, border: 'none', background: theme.accent, color: theme.accentText, fontSize: 16, cursor: 'pointer' },
  };

  return (
    <div style={base.page}>
      <header style={base.header}>
        <button type="button" style={base.backBtn} onClick={() => navigate('/messenger')}>
          <IconBack width={24} height={24} />
        </button>
        <span style={base.title}>Новая группа</span>
      </header>
      <div style={base.content}>
        <label style={base.label}>Название группы</label>
        <input style={base.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Введите название" />
        <button type="button" style={base.btn} onClick={handleCreate}>Создать</button>
      </div>
    </div>
  );
}
