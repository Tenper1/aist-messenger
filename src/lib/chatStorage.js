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

export function createChat({ id, name, type = 'user', avatar }) {
  const chatId = id || `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  addOrUpdateChat({
    id: chatId,
    name: name || 'Чат',
    type, // 'user' | 'group' | 'channel'
    avatar: avatar || '👤',
    lastMessage: '',
    lastTime: null,
    unread: 0,
  });
  return chatId;
}
