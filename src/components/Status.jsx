import React, { useMemo } from 'react';

export default function Status() {
  const statuses = useMemo(() => [
    { id: 1, name: 'Анна Иванова', avatar: '👩', time: '2 часа назад', viewed: true },
    { id: 2, name: 'Иван Петров', avatar: '👨', time: '5 часов назад', viewed: false },
    { id: 3, name: 'Мария Сидорова', avatar: '👱‍♀️', time: 'Вчера', viewed: true },
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
    statusList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px',
    },
    statusItem: {
      padding: '20px',
      borderRadius: '20px',
      background: 'rgba(255,255,255,.06)',
      border: '1px solid rgba(255,255,255,.12)',
      backdropFilter: 'blur(16px) saturate(140%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
    },
    statusItemHover: {
      background: 'rgba(255,255,255,.1)',
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 32px rgba(0,0,0,.4)',
    },
    avatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(140,200,255,.5), rgba(210,150,255,.4))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '40px',
      border: '3px solid rgba(255,255,255,.3)',
      position: 'relative',
    },
    newIndicator: {
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(140,200,255,.9), rgba(210,150,255,.7))',
      border: '3px solid rgba(10, 14, 28, .8)',
    },
    statusName: {
      fontSize: '16px',
      fontWeight: 600,
      color: 'rgba(255,255,255,.95)',
      textAlign: 'center',
    },
    statusTime: {
      fontSize: '12px',
      color: 'rgba(255,255,255,.6)',
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

  return (
    <div style={glassStyle.container}>
      <h2 style={glassStyle.title}>Статусы</h2>
      {statuses.length > 0 ? (
        <div style={glassStyle.statusList}>
          {statuses.map(status => (
            <div
              key={status.id}
              style={glassStyle.statusItem}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, glassStyle.statusItemHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = glassStyle.statusItem.background;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={glassStyle.avatar}>
                {status.avatar}
                {!status.viewed && <div style={glassStyle.newIndicator} />}
              </div>
              <div style={glassStyle.statusName}>{status.name}</div>
              <div style={glassStyle.statusTime}>{status.time}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={glassStyle.emptyState}>
          <div style={glassStyle.emptyIcon}>✨</div>
          <div>Нет статусов</div>
        </div>
      )}
    </div>
  );
}
