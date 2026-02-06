import React, { useMemo } from 'react';

export default function Calls() {
  const calls = useMemo(() => [
    { id: 1, name: 'Анна Иванова', avatar: '👩', time: 'Сегодня, 14:30', type: 'outgoing', missed: false },
    { id: 2, name: 'Иван Петров', avatar: '👨', time: 'Вчера, 12:15', type: 'incoming', missed: true },
    { id: 3, name: 'Мария Сидорова', avatar: '👱‍♀️', time: '2 дня назад', type: 'outgoing', missed: false },
  ], []);

  const glassStyle = useMemo(() => ({
    container: {
      padding: '24px',
      height: '100%',
      overflowY: 'auto',
    },
    title: {
      fontSize: '24px',
      fontWeight: 700,
      marginBottom: '24px',
      color: 'rgba(255,255,255,.95)',
    },
    callList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    callItem: {
      padding: '16px',
      borderRadius: '16px',
      background: 'rgba(255,255,255,.06)',
      border: '1px solid rgba(255,255,255,.12)',
      backdropFilter: 'blur(16px) saturate(140%)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    callItemHover: {
      background: 'rgba(255,255,255,.1)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0,0,0,.3)',
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
    },
    callInfo: {
      flex: 1,
    },
    callName: {
      fontSize: '16px',
      fontWeight: 600,
      color: 'rgba(255,255,255,.95)',
      marginBottom: '4px',
    },
    callMeta: {
      fontSize: '13px',
      color: 'rgba(255,255,255,.6)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    icon: {
      fontSize: '20px',
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: 'rgba(255,255,255,.5)',
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '16px',
      opacity: 0.6,
    },
  }), []);

  const getCallIcon = (type, missed) => {
    if (missed) return '📞❌';
    return type === 'incoming' ? '📞↓' : '📞↑';
  };

  return (
    <div style={glassStyle.container}>
      <h2 style={glassStyle.title}>Звонки</h2>
      {calls.length > 0 ? (
        <div style={glassStyle.callList}>
          {calls.map(call => (
            <div
              key={call.id}
              style={glassStyle.callItem}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, glassStyle.callItemHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = glassStyle.callItem.background;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={glassStyle.avatar}>{call.avatar}</div>
              <div style={glassStyle.callInfo}>
                <div style={glassStyle.callName}>{call.name}</div>
                <div style={glassStyle.callMeta}>
                  <span style={glassStyle.icon}>{getCallIcon(call.type, call.missed)}</span>
                  <span>{call.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={glassStyle.emptyState}>
          <div style={glassStyle.emptyIcon}>📞</div>
          <div>Нет истории звонков</div>
        </div>
      )}
    </div>
  );
}
