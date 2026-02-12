/**
 * WebSocket для получения сообщений в реальном времени
 */
import { getWsUrl } from './api';

let ws = null;
let listeners = [];
let reconnectTimer = null;
let isConnected = false;
let pendingMessages = [];

/**
 * Подключиться к WebSocket
 */
export function connectChatWebSocket(token, onMessage) {
  if (ws) {
    // Если уже подключены, добавляем слушателя
    if (onMessage) listeners.push(onMessage);
    return;
  }

  const url = `${getWsUrl()}?token=${encodeURIComponent(token)}`;

  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('[ChatWS] Connected');
    isConnected = true;
    // Отправляем отложенные сообщения
    pendingMessages.forEach(msg => send(msg));
    pendingMessages = [];
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[ChatWS] Received:', data);

      // Оповещаем всех слушателей
      listeners.forEach(listener => listener(data));
    } catch (e) {
      console.error('[ChatWS] Error parsing message:', e);
    }
  };

  ws.onclose = () => {
    console.log('[ChatWS] Disconnected');
    isConnected = false;
    ws = null;
    // Автоматическое переподключение через 5 секунд
    reconnectTimer = setTimeout(() => {
      const newToken = localStorage.getItem('aist_token');
      if (newToken) connectChatWebSocket(newToken);
    }, 5000);
  };

  ws.onerror = (error) => {
    console.error('[ChatWS] Error:', error);
  };

  if (onMessage) listeners.push(onMessage);
}

/**
 * Отправить сообщение через WebSocket
 */
export function send(data) {
  if (!ws || !isConnected) {
    pendingMessages.push(data);
    return;
  }
  ws.send(JSON.stringify(data));
}

/**
 * Добавить слушателя сообщений
 */
export function addListener(listener) {
  listeners.push(listener);
}

/**
 * Удалить слушателя сообщений
 */
export function removeListener(listener) {
  listeners = listeners.filter(l => l !== listener);
}

/**
 * Отключиться от WebSocket
 */
export function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
  listeners = [];
  isConnected = false;
  pendingMessages = [];
}

/**
 * Проверить, подключен ли WebSocket
 */
export function isWebSocketConnected() {
  return isConnected;
}
