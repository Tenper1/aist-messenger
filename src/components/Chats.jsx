import React, { useState, useMemo } from 'react';

export default function Chats() {
  const [selectedChat, setSelectedChat] = useState(null);

  // Mock data - в реальности будет из API
  const chats = useMemo(() => [
    {
      id: 1,
      name: 'Анна Иванова',
      avatar: '👩',
      lastMessage: 'Привет! Как дела?',
      time: '14:30',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: 'Иван Петров',
      avatar: '👨',
      lastMessage: 'Спасибо за помощь!',
      time: '12:15',
      unread: 0,
      online: false,
    },
    {
      id: 3,
      name: 'Мария Сидорова',
      avatar: '👱‍♀️',
      lastMessage: 'Встречаемся завтра?',
      time: 'Вчера',
      unread: 1,
      online: true,
    },
  ], []);

  const glassStyle = useMemo(() => ({
    container: {
      display: 'flex',
      width: '100%',
      height: '100%',
    },
    sidebar: {
      width: '360px',
      minWidth: '280px',
      borderRight: '1px solid rgba(255,255,255,.12)',
      background: 'rgba(255,255,255,.04)',
      backdropFilter: 'blur(20px) saturate(180%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    search: {
      padding: '12px 16px',
      borderBottom: '1px solid rgba(255,255,255,.08)',
    },
    searchInput: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,.14)',
      background: 'rgba(10, 14, 28, .40)',
      color: 'rgba(255,255,255,.9)',
      fontSize: '14px',
      outline: 'none',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)',
    },
    chatList: {
      flex: 1,
      overflowY: 'auto',
      padding: '8px 0',
    },
    chatItem: {
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderLeft: '3px solid transparent',
    },
    chatItemHover: {
      background: 'rgba(255,255,255,.06)',
      borderLeftColor: 'rgba(140,200,255,.5)',
    },
    chatItemActive: {
      background: 'rgba(255,255,255,.1)',
      borderLeftColor: 'rgba(140,200,255,.8)',
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(140,200,255,.4), rgba(210,150,255,.3))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      border: '2px solid rgba(255,255,255,.2)',
      flexShrink: 0,
      position: 'relative',
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: '2px',
      right: '2px',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      background: '#4ade80',
      border: '2px solid rgba(10, 14, 28, .8)',
    },
    chatInfo: {
      flex: 1,
      minWidth: 0,
    },
    chatHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '4px',
    },
    chatName: {
      fontSize: '15px',
      fontWeight: 600,
      color: 'rgba(255,255,255,.95)',
    },
    chatTime: {
      fontSize: '12px',
      color: 'rgba(255,255,255,.5)',
    },
    lastMessage: {
      fontSize: '13px',
      color: 'rgba(255,255,255,.7)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    unreadBadge: {
      minWidth: '20px',
      height: '20px',
      padding: '0 6px',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, rgba(140,200,255,.9), rgba(210,150,255,.7))',
      color: 'rgba(10, 15, 30, .95)',
      fontSize: '11px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: '8px',
    },
    mainArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255,255,255,.02)',
      backdropFilter: 'blur(20px) saturate(180%)',
    },
    emptyState: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'rgba(255,255,255,.5)',
      padding: '40px',
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '16px',
      opacity: 0.6,
    },
    emptyText: {
      fontSize: '16px',
      textAlign: 'center',
    },
  }), []);

  return (
    <div style={glassStyle.container}>
      <div style={glassStyle.sidebar}>
        <div style={glassStyle.search}>
          <input
            type="text"
            placeholder="Поиск..."
            style={glassStyle.searchInput}
          />
        </div>
        <div style={glassStyle.chatList}>
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              style={{
                ...glassStyle.chatItem,
                ...(selectedChat?.id === chat.id ? glassStyle.chatItemActive : {}),
              }}
              onMouseEnter={(e) => {
                if (selectedChat?.id !== chat.id) {
                  e.currentTarget.style.background = glassStyle.chatItemHover.background;
                  e.currentTarget.style.borderLeftColor = glassStyle.chatItemHover.borderLeftColor;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedChat?.id !== chat.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderLeftColor = 'transparent';
                }
              }}
            >
              <div style={glassStyle.avatar}>
                {chat.avatar}
                {chat.online && <div style={glassStyle.onlineIndicator} />}
              </div>
              <div style={glassStyle.chatInfo}>
                <div style={glassStyle.chatHeader}>
                  <span style={glassStyle.chatName}>{chat.name}</span>
                  <span style={glassStyle.chatTime}>{chat.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={glassStyle.lastMessage}>{chat.lastMessage}</span>
                  {chat.unread > 0 && (
                    <span style={glassStyle.unreadBadge}>{chat.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={glassStyle.mainArea}>
        {selectedChat ? (
          <div style={glassStyle.emptyState}>
            <div style={glassStyle.emptyIcon}>💬</div>
            <div style={glassStyle.emptyText}>
              Чат с {selectedChat.name}
              <br />
              <span style={{ fontSize: '14px', opacity: 0.7 }}>
                Здесь будет интерфейс переписки
              </span>
            </div>
          </div>
        ) : (
          <div style={glassStyle.emptyState}>
            <div style={glassStyle.emptyIcon}>👈</div>
            <div style={glassStyle.emptyText}>
              Выберите чат для начала общения
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
