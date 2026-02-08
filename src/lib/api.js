/**
 * API для синхронизации чатов и сообщений. Один аккаунт (телефон) — одни чаты на всех устройствах.
 */

const API_BASE = process.env.REACT_APP_API_URL || (typeof window !== 'undefined' && window.location?.hostname === 'localhost' ? 'http://localhost:3001' : 'https://api.get-aist.ru');

/** URL WebSocket для звонков: тот же хост что и API, путь /ws */
export function getWsUrl() {
  if (process.env.REACT_APP_WS_URL) return process.env.REACT_APP_WS_URL;
  const base = API_BASE.replace(/^https?/, (s) => (s === 'https' ? 'wss' : 'ws'));
  return `${base.replace(/\/$/, '')}/ws`;
}

function getToken() {
  try {
    return localStorage.getItem('aist_token') || null;
  } catch {
    return null;
  }
}

async function request(method, path, body = null) {
  const token = getToken();
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (body != null) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  let json = null;
  try {
    const text = await res.text();
    if (text) json = JSON.parse(text);
  } catch {}
  if (!res.ok) {
    const err = new Error((json && (json.message || json.error)) || res.statusText || 'Request failed');
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  if (res.status === 204) return null;
  return json || {};
}

/** Список чатов с сервера (по userId из токена). При ошибке или без токена — null. */
export async function apiGetChats() {
  if (!getToken()) return null;
  try {
    return await request('GET', '/api/chats');
  } catch {
    return null;
  }
}

/** Сообщения чата с сервера. При ошибке — null. */
export async function apiGetMessages(chatId) {
  if (!getToken() || !chatId) return null;
  try {
    const list = await request('GET', `/api/chats/${encodeURIComponent(chatId)}/messages`);
    return Array.isArray(list) ? list : null;
  } catch {
    return null;
  }
}

/** Отправить сообщение на сервер. Возвращает созданное сообщение или null при ошибке. */
export async function apiSendMessage(chatId, { text, attachment }) {
  if (!getToken() || !chatId) return null;
  try {
    return await request('POST', `/api/chats/${encodeURIComponent(chatId)}/messages`, { text: text || '', attachment: attachment || null });
  } catch (e) {
    if (e?.status === 404) console.warn('Chat not found on server:', chatId);
    return null;
  }
}

/** Создать чат на сервере. Возвращает чат или null. Для личного чата передайте peerUsername или peerUserId. */
export async function apiCreateChat(payload) {
  if (!getToken()) return null;
  try {
    return await request('POST', '/api/chats', {
      name: payload.name || 'Чат',
      type: payload.type || 'user',
      photo: payload.photo || null,
      peerUsername: payload.peerUsername || null,
      peerUserId: payload.peerUserId || null,
      description: payload.description || null,
      shareLink: payload.shareLink || null,
      admins: payload.admins || [],
      moderators: payload.moderators || [],
    });
  } catch {
    return null;
  }
}
