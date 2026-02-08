import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import {
  getChatList,
  getMessages,
  appendMessage,
  addOrUpdateChat,
  createChat,
} from '../lib/chatStorage';

function ChatView({ chat, onBack }) {
  const { theme } = useTheme();
  const { displayName } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  useEffect(() => {
    setMessages(getMessages(chat.id));
  }, [chat.id]);

  const sendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;
    const msg = {
      fromMe: true,
      text,
      time: new Date().toISOString(),
      senderName: displayName || 'Вы',
    };
    const next = appendMessage(chat.id, msg);
    setMessages(next);
    setInputValue('');
    addOrUpdateChat({
      ...chat,
      lastMessage: text,
      lastTime: Date.now(),
    });
  }, [inputValue, chat, displayName]);

  const styles = useMemo(
    () => ({
      header: {
        height: 56,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: `1px solid ${theme.border}`,
        background: theme.headerBg,
      },
      backBtn: {
        border: 'none',
        background: 'transparent',
        color: theme.text,
        fontSize: 22,
        cursor: 'pointer',
        padding: '4px 8px',
        display: isMobile ? 'block' : 'none',
      },
      messages: {
        flex: 1,
        overflowY: 'auto',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      },
      bubble: {
        maxWidth: '80%',
        padding: '10px 14px',
        borderRadius: 16,
        fontSize: 14,
        lineHeight: 1.4,
        alignSelf: 'flex-start',
        background: theme.sidebarBg || 'rgba(255,255,255,.1)',
        border: `1px solid ${theme.border}`,
        color: theme.text,
      },
      bubbleMe: {
        alignSelf: 'flex-end',
        background: theme.accent,
        color: theme.accentText,
        border: '1px solid rgba(255,255,255,.2)',
      },
      time: { fontSize: 11, color: theme.textMuted, marginTop: 4 },
      inputRow: {
        padding: 12,
        borderTop: `1px solid ${theme.border}`,
        background: theme.headerBg,
        display: 'flex',
        gap: 10,
        alignItems: 'center',
      },
      input: {
        flex: 1,
        padding: '12px 16px',
        borderRadius: 20,
        border: `1px solid ${theme.inputBorder}`,
        background: theme.inputBg,
        color: theme.text,
        fontSize: 14,
        outline: 'none',
      },
      sendBtn: {
        padding: '12px 20px',
        borderRadius: 20,
        border: 'none',
        background: theme.accent,
        color: theme.accentText,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 14,
      },
    }),
    [theme, isMobile]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={styles.header}>
        <button type="button" style={styles.backBtn} onClick={onBack} aria-label="Назад к списку">
          ←
        </button>
        <span style={{ fontWeight: 600, color: theme.text }}>{chat.name}</span>
      </header>
      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center', padding: 24 }}>
            Нет сообщений. Напишите первым.
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              ...styles.bubble,
              ...(m.fromMe ? styles.bubbleMe : {}),
            }}
          >
            <div>{m.text}</div>
            <div style={styles.time}>
              {new Date(m.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
      <div style={styles.inputRow}>
        <input
          style={styles.input}
          placeholder="Сообщение"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
        />
        <button type="button" style={styles.sendBtn} onClick={sendMessage}>
          Отправить
        </button>
      </div>
    </div>
  );
}

export default function Chats() {
  const { theme } = useTheme();
  const { usernameFormatted } = useUser();
  const [chatList, setChatList] = useState(getChatList);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMenu, setShowNewMenu] = useState(false);

  const refreshList = useCallback(() => setChatList(getChatList()), []);

  const filteredChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace(/^@/, '');
    if (!q) return chatList;
    return chatList.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.username && c.username.toLowerCase().includes(q))
    );
  }, [chatList, searchQuery]);

  const styles = useMemo(
    () => ({
      container: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 },
      sidebar: {
        width: '100%',
        maxWidth: 360,
        minWidth: 280,
        borderRight: `1px solid ${theme.border}`,
        background: theme.sidebarBg || 'transparent',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      },
      search: { padding: '12px 16px', borderBottom: `1px solid ${theme.border}` },
      searchInput: {
        width: '100%',
        padding: '10px 14px 10px 36px',
        borderRadius: 20,
        border: `1px solid ${theme.inputBorder}`,
        background: theme.inputBg,
        color: theme.text,
        fontSize: 14,
        outline: 'none',
      },
      searchWrap: { position: 'relative' },
      atIcon: {
        position: 'absolute',
        left: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        color: theme.textMuted,
        fontSize: 14,
        pointerEvents: 'none',
      },
      newChatRow: {
        padding: '8px 16px',
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
      },
      newBtn: {
        padding: '8px 14px',
        borderRadius: 12,
        border: `1px solid ${theme.border}`,
        background: theme.sidebarBg || 'rgba(255,255,255,.06)',
        color: theme.text,
        fontSize: 13,
        cursor: 'pointer',
      },
      chatList: { flex: 1, overflowY: 'auto', padding: '8px 0' },
      chatItem: {
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        borderLeft: '3px solid transparent',
        transition: 'background 0.15s ease',
      },
      chatItemActive: {
        background: theme.sidebarBg || 'rgba(255,255,255,.1)',
        borderLeftColor: 'rgba(100, 180, 255, .8)',
      },
      avatar: {
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: theme.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
      },
      chatInfo: { flex: 1, minWidth: 0 },
      chatName: { fontSize: 15, fontWeight: 600, color: theme.text, marginBottom: 2 },
      lastMsg: { fontSize: 13, color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      mainArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        background: theme.cardBg || 'transparent',
      },
      empty: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.textMuted,
        padding: 40,
        textAlign: 'center',
      },
    }),
    [theme]
  );

  useEffect(() => {
    if (!selectedChat) refreshList();
  }, [selectedChat, refreshList]);

  const createNewChat = (type) => {
    const name = window.prompt(type === 'user' ? 'Введите ник @ или имя' : type === 'group' ? 'Название группы' : 'Название канала');
    if (!name || !name.trim()) return;
    const id = createChat({
      name: name.trim(),
      type: type === 'user' ? 'user' : type === 'group' ? 'group' : 'channel',
    });
    refreshList();
    setSelectedChat(getChatList().find((c) => c.id === id) || { id, name: name.trim(), type, avatar: type === 'channel' ? '📢' : type === 'group' ? '👥' : '👤' });
    setShowNewMenu(false);
  };

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const showListOnly = isMobile && selectedChat;

  return (
    <div style={styles.container}>
      <div style={{ ...styles.sidebar, display: showListOnly ? 'none' : 'flex' }}>
        <div style={styles.search}>
          <div style={styles.searchWrap}>
            <span style={styles.atIcon}>@</span>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Поиск по нику @ или каналу"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div style={styles.newChatRow}>
          <button type="button" style={styles.newBtn} onClick={() => createNewChat('user')}>
            Новый чат
          </button>
          <button type="button" style={styles.newBtn} onClick={() => createNewChat('group')}>
            Группа
          </button>
          <button type="button" style={styles.newBtn} onClick={() => createNewChat('channel')}>
            Канал
          </button>
        </div>
        <div style={styles.chatList}>
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedChat(chat)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedChat(chat)}
              style={{
                ...styles.chatItem,
                ...(selectedChat?.id === chat.id ? styles.chatItemActive : {}),
              }}
            >
              <div style={styles.avatar}>{chat.avatar || '👤'}</div>
              <div style={styles.chatInfo}>
                <div style={styles.chatName}>{chat.name}</div>
                <div style={styles.lastMsg}>
                  {chat.lastMessage || (chat.type === 'channel' ? 'Канал' : 'Нет сообщений')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.mainArea}>
        {selectedChat ? (
          <ChatView chat={selectedChat} onBack={() => setSelectedChat(null)} />
        ) : (
          <div style={styles.empty}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <div style={{ fontSize: 16 }}>Выберите чат или создайте новый</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>
              Поиск по нику {usernameFormatted ? `— ваш ник ${usernameFormatted}` : '@username'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
