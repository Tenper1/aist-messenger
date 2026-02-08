import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { IconBack } from './Icons';

export default function CallScreen({ peerName, isVideo, onEnd }) {
  const { theme } = useTheme();
  const [localStream, setLocalStream] = useState(null);
  const [error, setError] = useState(null);
  const localRef = useRef(null);

  useEffect(() => {
    if (!isVideo) return;
    let stream = null;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        stream = s;
        setLocalStream(s);
      })
      .catch((e) => setError('Нет доступа к камере или микрофону'));
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [isVideo]);

  useEffect(() => {
    if (!localRef.current || !localStream) return;
    localRef.current.srcObject = localStream;
  }, [localStream]);

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: theme.pageBg,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      color: theme.text,
    },
    header: {
      padding: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${theme.border}`,
    },
    remote: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme.sidebarBg || 'rgba(0,0,0,.2)',
      position: 'relative',
    },
    remotePlaceholder: { fontSize: 48, color: theme.textMuted },
    local: {
      position: 'absolute',
      bottom: 80,
      right: 16,
      width: 120,
      height: 160,
      borderRadius: 12,
      overflow: 'hidden',
      background: '#000',
      border: `2px solid ${theme.border}`,
    },
    localVideo: { width: '100%', height: '100%', objectFit: 'cover' },
    controls: {
      padding: 24,
      display: 'flex',
      justifyContent: 'center',
      gap: 24,
    },
    btn: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },
    endBtn: { background: '#e53935', color: '#fff' },
  };

  return (
    <div style={styles.overlay}>
      <header style={styles.header}>
        <button type="button" style={{ border: 'none', background: 'transparent', color: theme.accent, padding: 8 }} onClick={onEnd}>
          <IconBack width={24} height={24} />
        </button>
        <span style={{ fontSize: 17, fontWeight: 600 }}>{isVideo ? 'Видеозвонок' : 'Голосовой звонок'} — {peerName}</span>
        <span style={{ width: 40 }} />
      </header>
      <div style={styles.remote}>
        {error && <div style={{ color: '#e53935', padding: 16 }}>{error}</div>}
        {!error && <div style={styles.remotePlaceholder}>📞</div>}
        {isVideo && localStream && (
          <div style={styles.local}>
            <video ref={localRef} autoPlay muted playsInline style={styles.localVideo} />
          </div>
        )}
      </div>
      <div style={styles.controls}>
        <button type="button" style={{ ...styles.btn, ...styles.endBtn }} onClick={onEnd} title="Завершить">
          ✕
        </button>
      </div>
    </div>
  );
}
