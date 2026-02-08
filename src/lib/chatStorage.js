/**
 * Хранение чатов и сообщений на устройстве пользователя.
 * Чаты хранятся только локально (localStorage). Синхронизация с сервером — отдельный этап.
 */

const PREFIX = 'aist_chat_';
const LIST_KEY = 'aist_chat_list';

function getChatKey(chatId) {
  return PREFIX + chatId;
}

export function getChatList() {
  try {
    const raw = localStorage.getItem(LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChatList(list) {
  try {
    localStorage.setItem(LIST_KEY, JSON.stringify(list));
  } catch {}
}

export function getMessages(chatId) {
  try {
    const raw = localStorage.getItem(getChatKey(chatId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function appendMessage(chatId, message) {
  const messages = getMessages(chatId);
  const next = [...messages, { ...message, id: message.id || `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` }];
  try {
    localStorage.setItem(getChatKey(chatId), JSON.stringify(next));
    return next;
  } catch {
    return messages;
  }
}

/** Записать сообщения чата (при синхронизации с сервера). Храним только на устройстве. */
export function saveMessages(chatId, list) {
  const arr = Array.isArray(list) ? list : [];
  try {
    localStorage.setItem(getChatKey(chatId), JSON.stringify(arr));
    return arr;
  } catch {
    return getMessages(chatId);
  }
}

export function addOrUpdateChat(chat) {
  const list = getChatList();
  const idx = list.findIndex((c) => c.id === chat.id);
  const next = [...list];
  if (idx >= 0) {
    next[idx] = { ...next[idx], ...chat, updatedAt: Date.now() };
  } else {
    next.unshift({ ...chat, updatedAt: Date.now() });
  }
  saveChatList(next);
  return next;
}

const CHANNEL_META_PREFIX = 'aist_channel_meta_';

export function getChannelMeta(chatId) {
  try {
    const raw = localStorage.getItem(CHANNEL_META_PREFIX + chatId);
    return raw ? JSON.parse(raw) : { description: '', shareLink: '', admins: [], moderators: [] };
  } catch {
    return { description: '', shareLink: '', admins: [], moderators: [] };
  }
}

export function saveChannelMeta(chatId, meta) {
  try {
    localStorage.setItem(CHANNEL_META_PREFIX + chatId, JSON.stringify(meta));
  } catch {}
}

export function createChat({ id, name, type = 'user', avatar, description, shareLink, admins, moderators }) {
  const chatId = id || `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const link = shareLink || (type === 'channel' ? `https://aist-messenger.vercel.app/c/${chatId}` : '');
  addOrUpdateChat({
    id: chatId,
    name: name || 'Чат',
    type,
    avatar: avatar || (type === 'channel' ? 'channel' : 'group'),
    lastMessage: '',
    lastTime: null,
    unread: 0,
  });
  if (type === 'channel') {
    saveChannelMeta(chatId, {
      description: description || '',
      shareLink: link,
      admins: admins || [],
      moderators: moderators || [],
    });
  }
  return chatId;
}
