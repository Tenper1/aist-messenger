import React, { useState, useMemo } from 'react';
import Chats from '../components/Chats';
import Calls from '../components/Calls';
import Status from '../components/Status';
import Settings from '../components/Settings';

export default function Messenger() {
  const [activeTab, setActiveTab] = useState('chats');

  const glassStyle = useMemo(() => ({
    container: {
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      color: 'rgba(255,255,255,.92)',
      background:
        'radial-gradient(1200px 800px at 20% 10%, rgba(120, 205, 255, .35), transparent 55%),' +
        'radial-gradient(900px 700px at 85% 20%, rgba(200, 120, 255, .30), transparent 55%),' +
        'radial-gradient(900px 700px at 30% 90%, rgba(90, 255, 200, .22), transparent 55%),' +
        'linear-gradient(135deg, #070A12 0%, #090B18 40%, #09091A 100%)',
      backgroundAttachment: 'fixed',
    },
    header: {
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      background: 'rgba(255,255,255,.06)',
      borderBottom: '1px solid rgba(255,255,255,.12)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      position: 'relative',
      zIndex: 10,
    },
    logo: {
      fontSize: '20px',
      fontWeight: 800,
      background: 'linear-gradient(135deg, rgba(140,200,255,.9), rgba(210,150,255,.7))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginRight: '24px',
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      flex: 1,
    },
    tab: {
      padding: '8px 16px',
      borderRadius: '12px',
      background: 'transparent',
      border: 'none',
      color: 'rgba(255,255,255,.6)',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
    },
    tabActive: {
      color: 'rgba(255,255,255,.95)',
      background: 'rgba(255,255,255,.1)',
      boxShadow: '0 2px 8px rgba(0,0,0,.2)',
    },
    content: {
      flex: 1,
      display: 'flex',
      overflow: 'hidden',
      position: 'relative',
    },
  }), []);

  const tabs = [
    { id: 'chats', label: 'Чаты', icon: '💬' },
    { id: 'calls', label: 'Звонки', icon: '📞' },
    { id: 'status', label: 'Статус', icon: '✨' },
    { id: 'settings', label: 'Настройки', icon: '⚙️' },
  ];

  return (
    <div style={glassStyle.container}>
      <header style={glassStyle.header}>
        <div style={glassStyle.logo}>AIST</div>
        <nav style={glassStyle.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...glassStyle.tab,
                ...(activeTab === tab.id ? glassStyle.tabActive : {}),
              }}
            >
              <span style={{ marginRight: '6px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <div style={glassStyle.content}>
        {activeTab === 'chats' && <Chats />}
        {activeTab === 'calls' && <Calls />}
        {activeTab === 'status' && <Status />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
}
