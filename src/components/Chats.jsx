import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { IconBack, IconSearch, IconPen, IconChannel, IconChevronRight, IconPhone, IconVideo, IconAttach } from './Icons';
import CallScreen from './CallScreen';
import {
  getChatList,
  saveChatList,
  getMessages,
  appendMessage,
  addOrUpdateChat,
  createChat,
  getChannelMeta,
  saveChannelMeta,
} from '../lib/chatStorage';
import { apiGetChats, apiGetMessages, apiSendMessage, apiCreateChat } from '../lib/api';

const APP_DOMAIN = 'https://aist-messenger.vercel.app';
const accent = '#0088cc';

function ChatView({ chat, onBack }) {
  const { theme, chatBg } = useTheme();
  const { displayName } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [attachPreview, setAttachPreview] = useState(null);
  const [callMode, setCallMode] = useState(null);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const messagesAreaBg = chatBg || (theme.isDark ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.25)');
  const channelMeta = chat.type === 'channel' ? getChannelMeta(chat.id) : null;
  const channelLink = channelMeta?.shareLink || `${APP_DOMAIN}/c/${chat.id}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fromApi = await apiGetMessages(chat.id);
      if (cancelled) return;
      if (Array.isArray(fromApi) && fromApi.length >= 0) {
        setMessages(fromApi);
        return;
      }
      setMessages(getMessages(chat.id));
    })();
    return () => { cancelled = true; };
  }, [chat.id]);

  const sendMessage = useCallback(async (textOrAttachment) => {
    const isAttach = typeof textOrAttachment === 'object';
    const text = isAttach ? textOrAttachment.caption || '' : (textOrAttachment || '').trim();
    const attachment = isAttach ? textOrAttachment : null;
    if (!text && !attachment) return;
    const fallbackMsg = {
      fromMe: true,
      text: text || (attachment ? (attachment.type === 'image' ? 'Фото' : 'Видео') : ''),
      time: new Date().toISOString(),
      senderName: displayName || 'Вы',
      attachment: attachment ? { type: attachment.type, url: attachment.url } : undefined,
    };
    const fromApi = await apiSendMessage(chat.id, {
      text: fallbackMsg.text,
      attachment: attachment ? { type: attachment.type, url: attachment.url } : null,
    });
    const msg = fromApi
      ? { ...fromApi, senderName: displayName || 'Вы' }
      : { ...fallbackMsg, id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` };
    const next = appendMessage(chat.id, msg);
    setMessages(next);
    setInputValue('');
    setAttachPreview(null);
    addOrUpdateChat({ ...chat, lastMessage: text || 'Медиа', lastTime: Date.now() });
  }, [chat, displayName]);

  const MAX_FILE_MB = 16;
  const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const ALLOWED_VIDEO = ['video/mp4', 'video/webm'];
  const onAttach = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_MB) return;
    if (ALLOWED_IMAGE.includes(f.type)) {
      const r = new FileReader();
      r.onload = () => setAttachPreview({ type: 'image', url: r.result });
      r.readAsDataURL(f);
    } else if (ALLOWED_VIDEO.includes(f.type)) {
      const r = new FileReader();
      r.onload = () => setAttachPreview({ type: 'video', url: r.result });
      r.readAsDataURL(f);
    }
  };

  const bubbleIn = theme.bubbleIn || theme.sidebarBg;
  const bubbleOut = theme.bubbleOut || theme.accent;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ height: 56, padding: '0 8px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${theme.border}`, background: theme.headerBg }}>
        <button type="button" style={{ border: 'none', background: 'transparent', color: theme.accent, padding: 8, cursor: 'pointer', display: isMobile ? 'block' : 'none' }} onClick={onBack}>
          <IconBack width={24} height={24} />
        </button>
        <button
          type="button"
          onClick={() => chat.type === 'channel' && setShowChannelInfo(true)}
          style={{ flex: 1, border: 'none', background: 'transparent', padding: 8, cursor: chat.type === 'channel' ? 'pointer' : 'default', textAlign: 'left' }}
        >
          <span style={{ fontWeight: 600, fontSize: 16, color: theme.text }}>{chat.name}</span>
        </button>
        {chat.type !== 'channel' && (
          <>
            <button type="button" style={{ border: 'none', background: 'transparent', padding: 8, color: theme.text, cursor: 'pointer' }} aria-label="Голосовой звонок" onClick={() => setCallMode('voice')}><IconPhone width={22} height={22} /></button>
            <button type="button" style={{ border: 'none', background: 'transparent', padding: 8, color: theme.text, cursor: 'pointer' }} aria-label="Видеозвонок" onClick={() => setCallMode('video')}><IconVideo width={22} height={22} /></button>
          </>
        )}
      </header>
      {showChannelInfo && channelMeta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Информация о канале"
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,.5)' }}
          onClick={() => setShowChannelInfo(false)}
        >
          <div style={{ background: theme.cardBg, borderRadius: 16, padding: 20, maxWidth: 360, width: '100%', border: `1px solid ${theme.border}`, boxShadow: '0 8px 32px rgba(0,0,0,.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: theme.text }}>{chat.name}</div>
            {channelMeta.description ? <p style={{ fontSize: 14, color: theme.textMuted, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{channelMeta.description}</p> : null}
            <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 8 }}>Ссылка на канал:</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input readOnly value={channelLink} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: 13 }} />
              <button type="button" onClick={() => { navigator.clipboard?.writeText(channelLink); }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: theme.accent, color: theme.accentText, cursor: 'pointer', fontSize: 14 }}>Копировать</button>
            </div>
            <button type="button" onClick={() => setShowChannelInfo(false)} style={{ marginTop: 16, width: '100%', padding: 10, borderRadius: 8, border: 'none', background: theme.sidebarBg, color: theme.text, cursor: 'pointer' }}>Закрыть</button>
          </div>
        </div>
      )}
      {callMode && (
        <CallScreen peerName={chat.name} isVideo={callMode === 'video'} onEnd={() => setCallMode(null)} />
      )}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: messagesAreaBg }}>
        {messages.length === 0 && (
          <div style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center', padding: 24 }}>Нет сообщений</div>
        )}
        {messages.map((m) => (
          <div key={m.id} style={{ alignSelf: m.fromMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            {m.attachment?.url && (
              <div style={{ marginBottom: 4, borderRadius: 12, overflow: 'hidden' }}>
                {m.attachment.type === 'image' ? (
                  <img src={m.attachment.url} alt="" style={{ maxWidth: 260, maxHeight: 260, display: 'block' }} />
                ) : (
                  <video src={m.attachment.url} controls style={{ maxWidth: 260, maxHeight: 200 }} />
                )}
              </div>
            )}
            <div style={{ padding: '8px 12px', borderRadius: 12, background: m.fromMe ? bubbleOut : bubbleIn, color: m.fromMe ? theme.accentText : theme.text, fontSize: 14 }}>
              {m.text}
            </div>
            <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{new Date(m.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        ))}
      </div>
      {attachPreview && (
        <div style={{ padding: 8, borderTop: `1px solid ${theme.border}`, background: theme.headerBg }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {attachPreview.type === 'image' ? <img src={attachPreview.url} alt="" style={{ maxHeight: 120, borderRadius: 8 }} /> : <video src={attachPreview.url} style={{ maxHeight: 120, borderRadius: 8 }} />}
            <button type="button" onClick={() => setAttachPreview(null)} style={{ position: 'absolute', top: 4, right: 4, border: 'none', background: 'rgba(0,0,0,.5)', color: '#fff', borderRadius: 4, padding: 4 }}>×</button>
          </div>
        </div>
      )}
      <div style={{ padding: 10, borderTop: `1px solid ${theme.border}`, background: theme.headerBg, display: 'flex', gap: 10, alignItems: 'center' }}>
        <label style={{ cursor: 'pointer', color: theme.textMuted, padding: 8, flexShrink: 0 }}>
          <input type="file" accept="image/*,video/*,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={onAttach} />
          <IconAttach width={24} height={24} />
        </label>
        <input
          style={{ flex: 1, minWidth: 0, padding: '12px 16px', borderRadius: 24, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: 15, outline: 'none' }}
          placeholder="Сообщение"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (attachPreview) sendMessage({ ...attachPreview, caption: inputValue }); else sendMessage(inputValue); } }}
        />
        <button
          type="button"
          onClick={() => attachPreview ? sendMessage({ ...attachPreview, caption: inputValue }) : sendMessage(inputValue)}
          style={{
            width: 44,
            height: 44,
            minWidth: 44,
            minHeight: 44,
            flexShrink: 0,
            padding: 0,
            borderRadius: '50%',
            border: 'none',
            background: theme.accent,
            color: theme.accentText,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
          aria-label="Отправить"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default function Chats() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [chatList, setChatList] = useState(getChatList);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);

  useEffect(() => {
    const id = location.state?.openChatId;
    if (id) {
      const c = getChatList().find((ch) => ch.id === id);
      if (c) setSelectedChat(c);
      navigate('/messenger', { replace: true, state: {} });
    }
  }, [location.state?.openChatId, navigate]);

  const refreshList = useCallback(async () => {
    const fromApi = await apiGetChats();
    if (Array.isArray(fromApi) && fromApi.length >= 0) {
      try {
        saveChatList(fromApi);
      } catch {}
      setChatList(fromApi);
      return;
    }
    setChatList(getChatList());
  }, []);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const filteredChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace(/^@/, '');
    if (!q) return chatList;
    return chatList.filter((c) => (c.name && c.name.toLowerCase().includes(q)) || (c.username && c.username.toLowerCase().includes(q)));
  }, [chatList, searchQuery]);

  const createNewChat = async (type) => {
    if (type === 'channel') {
      setNewChatOpen(false);
      navigate('/messenger/new-channel');
      return;
    }
    if (type === 'group') {
      setNewChatOpen(false);
      navigate('/messenger/new-group');
      return;
    }
    const name = window.prompt('Введите ник @ или имя');
    if (!name?.trim()) return;
    const created = await apiCreateChat({ name: name.trim(), type: 'user' });
    if (created?.id) {
      addOrUpdateChat({ id: created.id, name: created.name || name.trim(), type: 'user', lastMessage: '', lastTime: null, unread: 0 });
      await refreshList();
      setSelectedChat(created);
    } else {
      const id = createChat({ name: name.trim(), type: 'user' });
      await refreshList();
      setSelectedChat(getChatList().find((c) => c.id === id) || { id, name: name.trim(), type: 'user' });
    }
    setNewChatOpen(false);
  };

  useEffect(() => {
    if (!selectedChat) refreshList();
  }, [selectedChat, refreshList]);

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const showListOnly = isMobile && selectedChat;

  const s = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 },
    header: { height: 56, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, background: theme.headerBg },
    headerTitle: { fontSize: 28, fontWeight: 700, color: theme.text, letterSpacing: -0.5 },
    search: { padding: '8px 12px', borderBottom: `1px solid ${theme.border}` },
    searchInput: { width: '100%', padding: '10px 14px 10px 36px', borderRadius: 20, border: 'none', background: theme.inputBg, color: theme.text, fontSize: 15, outline: 'none' },
    searchWrap: { position: 'relative' },
    searchIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: theme.textMuted },
    sidebar: { width: '100%', maxWidth: 360, minWidth: 280, borderRight: `1px solid ${theme.border}`, background: theme.sidebarBg || theme.headerBg, backdropFilter: 'saturate(180%) blur(12px)', WebkitBackdropFilter: 'saturate(180%) blur(12px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    chatList: { flex: 1, overflowY: 'auto' },
    chatItem: { padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', borderBottom: `1px solid ${theme.border}` },
    chatItemActive: { background: theme.sidebarBg || 'rgba(0,0,0,.05)' },
    avatar: { width: 50, height: 50, borderRadius: '50%', background: theme.accent, color: theme.accentText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600, flexShrink: 0 },
    chatInfo: { flex: 1, minWidth: 0 },
    chatName: { fontSize: 16, fontWeight: 500, color: theme.text, marginBottom: 2 },
    lastMsg: { fontSize: 14, color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    mainArea: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: theme.cardBg, backdropFilter: 'saturate(180%) blur(8px)', WebkitBackdropFilter: 'saturate(180%) blur(8px)', borderLeft: theme.border ? `1px solid ${theme.border}` : undefined },
    empty: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.textMuted,
      padding: 48,
      textAlign: 'center',
    },
    emptyIconWrap: { width: 64, height: 64, borderRadius: 32, background: theme.sidebarBg || 'rgba(0,0,0,.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 17, fontWeight: 600, color: theme.text, marginBottom: 6 },
    emptySub: { fontSize: 15, lineHeight: 1.4 },
  };

  if (newChatOpen) {
    return (
      <div style={s.container}>
        <header style={s.header}>
          <button type="button" style={{ border: 'none', background: 'transparent', color: theme.accent, padding: 8 }} onClick={() => setNewChatOpen(false)}>
            <IconBack width={24} height={24} />
          </button>
          <span style={s.headerTitle}>Новое сообщение</span>
          <span style={{ width: 40 }} />
        </header>
        <div style={s.search}>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}><IconSearch width={20} height={20} /></span>
            <input type="text" style={s.searchInput} placeholder="Поиск по нику или имени" />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ ...s.chatItem, flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => createNewChat('group')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
              <div style={{ ...s.avatar, background: theme.sidebarBg, color: theme.text, fontSize: 24 }}>👥</div>
              <div><div style={s.chatName}>Создать группу</div><div style={s.lastMsg}>Общий чат с несколькими участниками</div></div>
              <IconChevronRight width={20} height={20} style={{ marginLeft: 'auto', color: theme.textMuted }} />
            </div>
          </div>
          <div style={{ ...s.chatItem, flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => createNewChat('channel')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
              <div style={{ ...s.avatar, background: theme.sidebarBg, color: theme.text }}><IconChannel width={24} height={24} /></div>
              <div><div style={s.chatName}>Создать канал</div><div style={s.lastMsg}>Публикация новостей для подписчиков</div></div>
              <IconChevronRight width={20} height={20} style={{ marginLeft: 'auto', color: theme.textMuted }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <div style={{ ...s.sidebar, display: showListOnly ? 'none' : 'flex' }}>
        <header style={s.header}>
          <span style={s.headerTitle}>Чаты</span>
          <button type="button" style={{ border: 'none', background: 'transparent', color: theme.accent, padding: 8 }} onClick={() => setNewChatOpen(true)} aria-label="Новое сообщение">
            <IconPen width={24} height={24} />
          </button>
        </header>
        <div style={s.search}>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}><IconSearch width={20} height={20} /></span>
            <input type="text" style={s.searchInput} placeholder="Поиск" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <div className="scrollable" style={s.chatList}>
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedChat(chat)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedChat(chat)}
              style={{ ...s.chatItem, ...(selectedChat?.id === chat.id ? s.chatItemActive : {}) }}
            >
              <div style={s.avatar}>{chat.photo ? <img src={chat.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : (chat.type === 'channel' ? <IconChannel width={22} height={22} /> : (chat.name?.[0]?.toUpperCase() || '?'))}</div>
              <div style={s.chatInfo}>
                <div style={s.chatName}>{chat.name}</div>
                <div style={s.lastMsg}>{chat.lastMessage || (chat.type === 'channel' ? 'Канал' : 'Нет сообщений')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={s.mainArea}>
        {selectedChat ? <ChatView chat={selectedChat} onBack={() => setSelectedChat(null)} /> : (
          <div style={s.empty}>
            <div style={s.emptyIconWrap}>
              <IconPen width={28} height={28} style={{ color: theme.textMuted }} />
            </div>
            <div style={s.emptyTitle}>Выберите чат</div>
            <div style={s.emptySub}>Или нажмите кнопку с ручкой выше, чтобы начать новый</div>
          </div>
        )}
      </div>
    </div>
  );
}
