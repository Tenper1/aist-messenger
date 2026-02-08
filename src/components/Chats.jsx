import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
import { getFolders, addChatToFolder, removeChatFromFolder, getChatFolderIds } from '../lib/folderStorage';

const APP_DOMAIN = 'https://aist-messenger.vercel.app';
const FOLDER_ALL = 'all';

function ChatView({ chat, onBack }) {
  const { theme, chatBg } = useTheme();
  const { displayName } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [attachPreview, setAttachPreview] = useState(null);
  const [callMode, setCallMode] = useState(null);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const messagesAreaBg = chatBg || (theme.isDark
    ? '#0e1621'
    : '#e8ecf1');
  const messagesAreaPattern = theme.isDark
    ? 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.03) 1px, transparent 0); background-size: 24px 24px'
    : 'radial-gradient(circle at 1px 1px, rgba(0,0,0,.04) 1px, transparent 0); background-size: 24px 24px';
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
  const bubbleStyleIn = {
    padding: '8px 12px 6px 12px',
    borderRadius: '12px 12px 12px 4px',
    background: bubbleIn,
    color: theme.text,
    fontSize: 15,
    lineHeight: 1.35,
    maxWidth: '100%',
  };
  const bubbleStyleOut = {
    ...bubbleStyleIn,
    borderRadius: '12px 12px 4px 12px',
    background: bubbleOut,
    color: theme.accentText || '#fff',
  };

  const formatDateKey = (t) => new Date(t).toDateString();
  const messagesWithDates = useMemo(() => {
    const out = [];
    let lastDate = null;
    messages.forEach((m) => {
      const d = formatDateKey(m.time);
      if (d !== lastDate) {
        lastDate = d;
        out.push({ type: 'date', key: `date-${d}`, date: m.time });
      }
      out.push(m);
    });
    return out;
  }, [messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ height: 54, padding: '0 8px 0 4px', display: 'flex', alignItems: 'center', gap: 8, background: theme.headerBg, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <button type="button" style={{ border: 'none', background: 'transparent', color: theme.accent, padding: 10, cursor: 'pointer', display: isMobile ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }} onClick={onBack} aria-label="Назад">
          <IconBack width={24} height={24} />
        </button>
        <button type="button" onClick={() => chat.type === 'channel' && setShowChannelInfo(true)} style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px 4px', cursor: chat.type === 'channel' ? 'pointer' : 'default', textAlign: 'left', minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: 16, color: theme.text, display: 'block' }}>{chat.name}</span>
          {chat.type !== 'channel' && <span style={{ fontSize: 13, color: theme.textMuted, fontWeight: 400 }}>был(а) недавно</span>}
        </button>
        {chat.type !== 'channel' && (
          <>
            <button type="button" style={{ border: 'none', background: 'transparent', padding: 10, color: theme.textMuted, cursor: 'pointer' }} aria-label="Голосовой звонок" onClick={() => setCallMode('voice')}><IconPhone width={22} height={22} /></button>
            <button type="button" style={{ border: 'none', background: 'transparent', padding: 10, color: theme.textMuted, cursor: 'pointer' }} aria-label="Видеозвонок" onClick={() => setCallMode('video')}><IconVideo width={22} height={22} /></button>
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
        <CallScreen peerName={chat.name} isVideo={callMode === 'video'} onEnd={() => setCallMode(null)} peerUserId={chat.peerUserId || chat.otherUserId} />
      )}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4, background: messagesAreaBg, backgroundImage: messagesAreaPattern }}>
        {messages.length === 0 && (
          <div style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center', padding: 40 }}>Нет сообщений</div>
        )}
        {messagesWithDates.map((item) => {
          if (item.type === 'date') {
            const label = new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            return (
              <div key={item.key} style={{ alignSelf: 'center', margin: '12px 0 6px', padding: '5px 14px', borderRadius: 8, background: theme.isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)', fontSize: 12, color: theme.textMuted, fontWeight: 500 }}>
                {label}
              </div>
            );
          }
          const m = item;
          const timeStr = new Date(m.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={m.id} style={{ alignSelf: m.fromMe ? 'flex-end' : 'flex-start', maxWidth: '82%', display: 'flex', flexDirection: 'column', alignItems: m.fromMe ? 'flex-end' : 'flex-start' }}>
              {m.attachment?.url && (
                <div style={{ marginBottom: 2, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }}>
                  {m.attachment.type === 'image' ? (
                    <img src={m.attachment.url} alt="" style={{ maxWidth: 260, maxHeight: 260, display: 'block' }} />
                  ) : (
                    <video src={m.attachment.url} controls style={{ maxWidth: 260, maxHeight: 180 }} />
                  )}
                </div>
              )}
              <div style={m.fromMe ? bubbleStyleOut : bubbleStyleIn}>
                {m.text ? <span style={{ display: 'block', marginBottom: 2 }}>{m.text}</span> : null}
                <div style={{ fontSize: 11, opacity: 0.8 }}>{timeStr}</div>
              </div>
            </div>
          );
        })}
      </div>
      {attachPreview && (
        <div style={{ padding: 8, borderTop: `1px solid ${theme.border}`, background: theme.headerBg }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {attachPreview.type === 'image' ? <img src={attachPreview.url} alt="" style={{ maxHeight: 120, borderRadius: 8 }} /> : <video src={attachPreview.url} style={{ maxHeight: 120, borderRadius: 8 }} />}
            <button type="button" onClick={() => setAttachPreview(null)} style={{ position: 'absolute', top: 4, right: 4, border: 'none', background: 'rgba(0,0,0,.5)', color: '#fff', borderRadius: 4, padding: 4 }}>×</button>
          </div>
        </div>
      )}
      <div style={{ padding: '10px 12px 14px', borderTop: '1px solid rgba(255,255,255,.06)', background: theme.headerBg, display: 'flex', gap: 10, alignItems: 'center' }}>
        <label style={{ cursor: 'pointer', color: theme.textMuted, padding: 8, flexShrink: 0 }} aria-label="Прикрепить файл">
          <input type="file" accept="image/*,video/*,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={onAttach} />
          <IconAttach width={24} height={24} />
        </label>
        <input
          style={{ flex: 1, minWidth: 0, padding: '10px 16px', borderRadius: 20, border: 'none', background: theme.inputBg, color: theme.text, fontSize: 15, outline: 'none' }}
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
            color: theme.accentText || '#fff',
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
  const [activeFolderId, setActiveFolderId] = useState(FOLDER_ALL);
  const [foldersRefresh, setFoldersRefresh] = useState(0);
  const [folderMenuChatId, setFolderMenuChatId] = useState(null);
  const folderMenuRef = useRef(null);
  const folders = useMemo(() => getFolders(), [foldersRefresh]);

  useEffect(() => {
    if (!folderMenuChatId) return;
    const onDocClick = (e) => {
      if (folderMenuRef.current?.contains(e.target) || e.target.closest('[data-folder-trigger]')) return;
      setFolderMenuChatId(null);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [folderMenuChatId]);

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

  const chatsByFolder = useMemo(() => {
    if (activeFolderId === FOLDER_ALL) return filteredChats;
    const folder = folders.find((f) => f.id === activeFolderId);
    if (!folder?.chatIds?.length) return [];
    return filteredChats.filter((c) => folder.chatIds.includes(c.id));
  }, [activeFolderId, filteredChats, folders]);

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

  // Стили как в Telegram: сайдбар без тяжёлых границ, компактные строки чатов
  const s = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: theme.sidebarBg },
    header: { height: 54, padding: '0 12px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: theme.headerBg },
    headerTitle: { fontSize: 20, fontWeight: 700, color: theme.text },
    search: { padding: '8px 12px 12px' },
    searchInput: { width: '100%', padding: '10px 12px 10px 36px', borderRadius: 20, border: 'none', background: theme.inputBg, color: theme.text, fontSize: 14, outline: 'none' },
    searchWrap: { position: 'relative' },
    searchIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: theme.textMuted, pointerEvents: 'none' },
    sidebar: { width: '100%', maxWidth: 420, minWidth: 280, flexShrink: 0, background: theme.sidebarBg, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' },
    chatList: { flex: 1, overflowY: 'auto', overflowX: 'hidden' },
    chatItem: { padding: '10px 12px 10px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'background .12s ease', borderBottom: theme.border ? `1px solid ${theme.border}` : '1px solid rgba(255,255,255,.04)' },
    chatItemActive: { background: 'rgba(255,255,255,.08)' },
    avatar: { width: 54, height: 54, borderRadius: '50%', background: theme.accent, color: theme.accentText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 600, flexShrink: 0 },
    chatInfo: { flex: 1, minWidth: 0 },
    chatName: { fontSize: 16, fontWeight: 500, color: theme.text, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    lastMsg: { fontSize: 14, color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    chatMeta: { flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
    chatTime: { fontSize: 12, color: theme.textMuted },
    unreadBadge: { minWidth: 18, height: 18, borderRadius: 9, background: theme.accent, color: theme.accentText || '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' },
    mainArea: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, background: theme.cardBg, transition: 'opacity .2s ease' },
    empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center' },
    emptyIconWrap: { width: 96, height: 96, borderRadius: 48, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    emptyTitle: { fontSize: 22, fontWeight: 600, color: theme.text, marginBottom: 10 },
    emptySub: { fontSize: 15, lineHeight: 1.5, color: theme.textMuted, maxWidth: 260 },
    emptyTagline: { fontSize: 14, color: theme.textMuted, marginTop: 28 },
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
        <div style={{ padding: '6px 12px 10px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
          <button type="button" style={{ padding: '6px 14px', borderRadius: 18, border: 'none', background: activeFolderId === FOLDER_ALL ? theme.accent : 'rgba(255,255,255,.08)', color: activeFolderId === FOLDER_ALL ? '#fff' : theme.textMuted, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => { setFolderMenuChatId(null); setActiveFolderId(FOLDER_ALL); }}>Все чаты</button>
          {folders.map((f) => (
            <button key={f.id} type="button" style={{ padding: '6px 14px', borderRadius: 18, border: 'none', background: activeFolderId === f.id ? theme.accent : 'rgba(255,255,255,.08)', color: activeFolderId === f.id ? '#fff' : theme.textMuted, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => { setFolderMenuChatId(null); setActiveFolderId(f.id); }}>{f.name}</button>
          ))}
        </div>
        <div className="scrollable" style={s.chatList}>
          {chatsByFolder.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: theme.textMuted, fontSize: 15 }}>Нет чатов в этой папке</div>
          )}
          {chatsByFolder.map((chat) => (
            <div
              key={chat.id}
              role="button"
              tabIndex={0}
              onClick={() => { setFolderMenuChatId(null); setSelectedChat(chat); }}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedChat(chat)}
              onMouseEnter={(e) => { if (selectedChat?.id !== chat.id) e.currentTarget.style.background = theme.isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.03)'; }}
              onMouseLeave={(e) => { if (selectedChat?.id !== chat.id) e.currentTarget.style.background = 'transparent'; }}
              style={{ ...s.chatItem, ...(selectedChat?.id === chat.id ? s.chatItemActive : {}), position: 'relative' }}
            >
              <div style={s.avatar}>{chat.photo ? <img src={chat.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : (chat.type === 'channel' ? <IconChannel width={22} height={22} /> : (chat.name?.[0]?.toUpperCase() || '?'))}</div>
              <div style={s.chatInfo}>
                <div style={s.chatName}>{chat.name}</div>
                <div style={{ ...s.lastMsg, ...(chat.unread > 0 ? { fontWeight: 500, color: theme.text } : {}) }}>{chat.lastMessage || (chat.type === 'channel' ? 'Канал' : 'Нет сообщений')}</div>
              </div>
              <div style={s.chatMeta}>
                <span style={s.chatTime}>
                  {chat.lastTime
                    ? (() => {
                        const d = new Date(chat.lastTime);
                        const now = new Date();
                        if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                        if (d.getTime() > now.getTime() - 7 * 86400000) return d.toLocaleDateString('ru-RU', { weekday: 'short' });
                        return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
                      })()
                    : ''}
                </span>
                {chat.unread > 0 && <span style={s.unreadBadge}>{chat.unread > 99 ? '99+' : chat.unread}</span>}
              </div>
              <button type="button" data-folder-trigger aria-label="Папки" style={{ border: 'none', background: 'transparent', color: theme.textMuted, padding: 6, borderRadius: 8, cursor: 'pointer', flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); setFolderMenuChatId(folderMenuChatId === chat.id ? null : chat.id); }}>⋯</button>
              {folderMenuChatId === chat.id && (
                <div ref={folderMenuRef} style={{ position: 'absolute', right: 8, top: '100%', zIndex: 10, marginTop: 2, padding: 8, borderRadius: 12, background: theme.cardBg || theme.sidebarBg, boxShadow: '0 4px 12px rgba(0,0,0,.2)', minWidth: 180 }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 6 }}>Добавить в папку</div>
                  {folders.length === 0 ? <div style={{ fontSize: 13, color: theme.textMuted }}>Создайте папки в Настройках</div> : folders.map((f) => {
                    const inFolder = (f.chatIds || []).includes(chat.id);
                    return (
                      <button key={f.id} type="button" style={{ display: 'block', width: '100%', padding: '8px 10px', border: 'none', background: inFolder ? 'rgba(0,136,204,.15)' : 'transparent', color: theme.text, borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 14 }} onClick={() => { if (inFolder) removeChatFromFolder(f.id, chat.id); else addChatToFolder(f.id, chat.id); setFoldersRefresh((k) => k + 1); }}>
                        {inFolder ? '✓ ' : ''}{f.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          aria-label="Новое сообщение"
          onClick={() => setNewChatOpen(true)}
          style={{
            position: 'absolute',
            bottom: 20,
            right: 16,
            width: 54,
            height: 54,
            borderRadius: 27,
            border: 'none',
            background: theme.accent,
            color: '#fff',
            boxShadow: '0 2px 12px rgba(0,0,0,.35)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconPen width={24} height={24} />
        </button>
      </div>
      <div style={s.mainArea}>
        {selectedChat ? <ChatView chat={selectedChat} onBack={() => setSelectedChat(null)} /> : (
          <div style={s.empty}>
            <div style={s.emptyIconWrap}>
              <IconPen width={36} height={36} style={{ color: theme.textMuted }} />
            </div>
            <div style={s.emptyTitle}>Выберите чат</div>
            <div style={s.emptySub}>Или нажмите кнопку с ручкой выше, чтобы начать новый диалог</div>
            <div style={s.emptyTagline}>AIST — удобный, комфортный и безопасный мессенджер</div>
          </div>
        )}
      </div>
    </div>
  );
}
