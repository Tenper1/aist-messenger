/**
 * Папки чатов (как в Telegram). Хранение в localStorage.
 */

const KEY = 'aist_chat_folders';

export function getFolders() {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveFolders(folders) {
  try {
    localStorage.setItem(KEY, JSON.stringify(folders));
  } catch {}
}

export function addFolder(name) {
  const folders = getFolders();
  const id = `folder_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  folders.push({ id, name: (name || '').trim() || 'Новая папка', chatIds: [] });
  saveFolders(folders);
  return id;
}

export function updateFolder(id, { name, chatIds }) {
  const folders = getFolders();
  const idx = folders.findIndex((f) => f.id === id);
  if (idx < 0) return;
  if (name !== undefined) folders[idx].name = String(name).trim() || folders[idx].name;
  if (chatIds !== undefined) folders[idx].chatIds = Array.isArray(chatIds) ? chatIds : folders[idx].chatIds;
  saveFolders(folders);
}

export function deleteFolder(id) {
  const folders = getFolders().filter((f) => f.id !== id);
  saveFolders(folders);
}

export function addChatToFolder(folderId, chatId) {
  const folders = getFolders();
  const folder = folders.find((f) => f.id === folderId);
  if (!folder || folder.chatIds.includes(chatId)) return;
  folder.chatIds.push(chatId);
  saveFolders(folders);
}

export function removeChatFromFolder(folderId, chatId) {
  const folders = getFolders();
  const folder = folders.find((f) => f.id === folderId);
  if (!folder) return;
  folder.chatIds = folder.chatIds.filter((id) => id !== chatId);
  saveFolders(folders);
}

export function getChatFolderIds(chatId) {
  return getFolders().filter((f) => f.chatIds && f.chatIds.includes(chatId)).map((f) => f.id);
}
