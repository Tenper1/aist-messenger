import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCall } from '../context/CallContext';
import { getWsUrl } from '../lib/api';
import { IconBack, IconMic, IconMicOff, IconSpeaker, IconKeypad } from './Icons';

export default function CallScreen({
  peerName,
  isVideo,
  onEnd,
  peerUserId,
  isIncoming = false,
  remoteOffer = null,
}) {
  const { theme } = useTheme();
  const callCtx = useCall();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(isIncoming ? 'connecting' : 'calling');
  const [wsOpen, setWsOpen] = useState(false);
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const offerSentRef = useRef(false);
  const useSharedWs = isIncoming && !!callCtx;
  const effectiveWsOpen = useSharedWs ? (callCtx?.wsReady ?? false) : wsOpen;

  useEffect(() => {
    const wantVideo = !!isVideo;
    let stream = null;
    navigator.mediaDevices
      .getUserMedia({ video: wantVideo, audio: true })
      .then((s) => {
        stream = s;
        setLocalStream(s);
        if (muted) s.getAudioTracks().forEach((t) => (t.enabled = false));
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

  useEffect(() => {
    if (!remoteRef.current || !remoteStream) return;
    remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (remoteRef.current) remoteRef.current.volume = speaker ? 1 : 0.6;
  }, [speaker, remoteStream]);

  useEffect(() => {
    if (muted && localStream) localStream.getAudioTracks().forEach((t) => (t.enabled = false));
    if (!muted && localStream) localStream.getAudioTracks().forEach((t) => (t.enabled = true));
  }, [muted, localStream]);

  const wsUrl = getWsUrl();
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('aist_token') : null;

  useEffect(() => {
    if (useSharedWs) return;
    if (!peerUserId || !wsUrl || !token) return;
    setWsOpen(false);
    const base = wsUrl.startsWith('ws') ? wsUrl : wsUrl.replace(/^https?/, (s) => (s === 'https' ? 'wss' : 'ws'));
    const url = `${base}?token=${encodeURIComponent(token)}`;
    let ws = null;
    try {
      ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => setWsOpen(true);
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.event === 'call:answer' && (msg.payload?.sdp || msg.payload)) {
            setStatus('connected');
            const desc = msg.payload?.type ? msg.payload : { type: 'answer', sdp: msg.payload?.sdp || msg.payload };
            if (pcRef.current) pcRef.current.setRemoteDescription(new RTCSessionDescription(desc)).catch(() => {});
          }
          if (msg.event === 'call:ice' && msg.payload?.candidate) {
            if (pcRef.current) pcRef.current.addIceCandidate(new RTCIceCandidate(msg.payload.candidate)).catch(() => {});
          }
          if (msg.event === 'call:hangup') onEnd();
        } catch {}
      };
      ws.onerror = () => setError('Ошибка соединения');
      ws.onclose = () => setWsOpen(false);
    } catch (e) {
      setError('WebSocket недоступен');
    }
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
      wsRef.current = null;
      setWsOpen(false);
      offerSentRef.current = false;
    };
  }, [useSharedWs, peerUserId, wsUrl, token, onEnd]);

  useEffect(() => {
    if (useSharedWs && callCtx && isIncoming && remoteOffer && localStream) {
      callCtx.setMessageReceiver((msg) => {
        if (msg.event === 'call:ice' && msg.payload?.candidate && pcRef.current) {
          pcRef.current.addIceCandidate(new RTCIceCandidate(msg.payload.candidate)).catch(() => {});
        }
        if (msg.event === 'call:hangup') onEnd();
      });
      return () => callCtx.setMessageReceiver(null);
    }
  }, [useSharedWs, isIncoming, remoteOffer, localStream, callCtx, onEnd]);

  useEffect(() => {
    if (!localStream || !peerUserId) return;
    if (isIncoming && remoteOffer && callCtx?.wsReady && callCtx.send) {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      pcRef.current = pc;
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
      pc.ontrack = (e) => setRemoteStream(e.streams[0] || e.stream);
      pc.onicecandidate = (e) => {
        if (e.candidate && callCtx?.send) callCtx.send('call:ice', { candidate: e.candidate });
      };
      pc.setRemoteDescription(new RTCSessionDescription(remoteOffer))
        .then(() => pc.createAnswer())
        .then((answer) => pc.setLocalDescription(answer).then(() => answer))
        .then((answer) => {
          callCtx.send('call:answer', { sdp: answer });
          setStatus('connected');
        })
        .catch(() => setError('Ошибка соединения'));
      return () => {
        pc.close();
        pcRef.current = null;
      };
    }
    if (!isIncoming && effectiveWsOpen && !offerSentRef.current && wsRef.current) {
      const ws = wsRef.current;
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      pcRef.current = pc;
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
      pc.ontrack = (e) => setRemoteStream(e.streams[0] || e.stream);
      pc.onicecandidate = (e) => {
        if (e.candidate && wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify({ event: 'call:ice', payload: { candidate: e.candidate } }));
      };
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer).then(() => offer))
        .then((offer) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: 'call:offer', payload: { userId: peerUserId, sdp: offer, isVideo: !!isVideo } }));
            offerSentRef.current = true;
          }
        })
        .catch(() => {});
      return () => {
        if (pcRef.current === pc) {
          pc.close();
          pcRef.current = null;
        }
      };
    }
  }, [localStream, effectiveWsOpen, wsOpen, peerUserId, isIncoming, remoteOffer, callCtx, isVideo]);

  const controlBtn = (Icon, active, onClick, label) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        border: 'none',
        background: active ? theme.accent : (theme.sidebarBg || 'rgba(255,255,255,.12)'),
        color: active ? theme.accentText : theme.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      title={label}
      aria-label={label}
    >
      <Icon width={24} height={24} />
    </button>
  );

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: theme.isDark ? '#0c0c0e' : '#f5f5f7',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      color: theme.text,
    },
    header: {
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderBottom: `1px solid ${theme.border}`,
      background: theme.headerBg,
    },
    center: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: '50%',
      background: theme.accent,
      color: theme.accentText,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 36,
      fontWeight: 600,
      marginBottom: 16,
    },
    name: { fontSize: 22, fontWeight: 600, marginBottom: 4 },
    statusText: { fontSize: 15, color: theme.textMuted },
    remoteVideo: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    localVideo: {
      position: 'absolute',
      bottom: 100,
      right: 16,
      width: 100,
      height: 140,
      borderRadius: 12,
      objectFit: 'cover',
      border: `2px solid ${theme.border}`,
    },
    controls: {
      padding: '24px 16px 32px',
      paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 28,
    },
    endBtn: {
      width: 64,
      height: 64,
      borderRadius: '50%',
      border: 'none',
      background: '#e53935',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.overlay}>
      <header style={styles.header}>
        <button type="button" style={{ border: 'none', background: 'transparent', color: theme.accent, padding: 8 }} onClick={onEnd} aria-label="Назад">
          <IconBack width={24} height={24} />
        </button>
        <span style={{ flex: 1, fontSize: 17, fontWeight: 600 }}>
          {isVideo ? 'Видеозвонок' : 'Голосовой звонок'} — {peerName}
        </span>
      </header>

      <div style={{ flex: 1, position: 'relative' }}>
        {error && (
          <div style={{ padding: 16, textAlign: 'center', color: '#e53935' }}>{error}</div>
        )}
        {!error && isVideo && localStream && (
          <>
            {remoteStream && <video ref={remoteRef} autoPlay playsInline style={styles.remoteVideo} />}
            <video ref={localRef} autoPlay muted playsInline style={styles.localVideo} />
          </>
        )}
        {!error && (!isVideo || !localStream) && (
          <div style={styles.center}>
            <div style={styles.avatar}>{peerName ? peerName[0].toUpperCase() : '?'}</div>
            <div style={styles.name}>{peerName}</div>
            <div style={styles.statusText}>{status === 'connected' ? 'Разговор' : isIncoming ? 'Подключение...' : 'Вызов...'}</div>
          </div>
        )}
      </div>

      <div style={styles.controls}>
        {controlBtn(muted ? IconMicOff : IconMic, muted, () => setMuted(!muted), muted ? 'Включить микрофон' : 'Выключить микрофон')}
        {controlBtn(IconSpeaker, speaker, () => setSpeaker(!speaker), speaker ? 'Телефон' : 'Громкая связь')}
        {controlBtn(IconKeypad, showKeypad, () => setShowKeypad(!showKeypad), 'Клавиатура')}
        <button type="button" style={styles.endBtn} onClick={() => { if (useSharedWs && callCtx) callCtx.send('call:hangup'); onEnd(); }} title="Завершить" aria-label="Завершить звонок">
          <span style={{ fontSize: 28, lineHeight: 1, color: '#fff' }}>✕</span>
        </button>
      </div>
    </div>
  );
}
