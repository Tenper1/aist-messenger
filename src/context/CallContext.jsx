import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { getWsUrl } from '../lib/api';

const CallContext = createContext(null);

export function useCall() {
  const ctx = useContext(CallContext);
  return ctx;
}

export function CallProvider({ children }) {
  const [wsReady, setWsReady] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const wsRef = useRef(null);
  const messageReceiverRef = useRef(null);

  const wsUrl = getWsUrl();
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('aist_token') : null;

  const send = useCallback((event, payload) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === 1) {
      try {
        ws.send(JSON.stringify({ event, payload: payload || {} }));
      } catch {}
    }
  }, []);

  const rejectCall = useCallback(() => {
    if (incomingCall) {
      send('call:hangup');
      setIncomingCall(null);
    }
  }, [incomingCall, send]);

  const acceptCall = useCallback(() => {
    const data = incomingCall;
    setIncomingCall(null);
    return data;
  }, [incomingCall]);

  useEffect(() => {
    if (!wsUrl || !token) return;
    const base = wsUrl.startsWith('ws') ? wsUrl : wsUrl.replace(/^https?/, (s) => (s === 'https' ? 'wss' : 'ws'));
    const url = `${base}?token=${encodeURIComponent(token)}`;
    let ws = null;
    try {
      ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => setWsReady(true);
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.event === 'call:offer') {
            const p = msg.payload || {};
            setIncomingCall({
              fromUserId: p.fromUserId,
              sdp: p.sdp,
              isVideo: !!p.isVideo,
            });
            return;
          }
          const recv = messageReceiverRef.current;
          if (recv) recv(msg);
        } catch {}
      };
      ws.onclose = () => setWsReady(false);
      ws.onerror = () => setWsReady(false);
    } catch (e) {}
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
      wsRef.current = null;
      setWsReady(false);
    };
  }, [wsUrl, token]);

  const setMessageReceiver = useCallback((fn) => {
    messageReceiverRef.current = fn;
  }, []);

  const value = {
    wsRef,
    wsReady,
    send,
    incomingCall,
    setIncomingCall,
    rejectCall,
    acceptCall,
    setMessageReceiver,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}
