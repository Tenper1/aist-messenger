/**
 * Хранение публичных ключей других пользователей
 * Ключи хранятся локально для шифрования сообщений
 */

const KEY_STORAGE_KEY = 'aist_public_keys';

// Получить все сохранённые публичные ключи
export function getPublicKeys() {
  try {
    const data = localStorage.getItem(KEY_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// Сохранить публичный ключ пользователя
export function savePublicKey(userId, publicKeyPem) {
  const keys = getPublicKeys();
  keys[userId] = {
    publicKey: publicKeyPem,
    updatedAt: Date.now()
  };
  localStorage.setItem(KEY_STORAGE_KEY, JSON.stringify(keys));
}

// Получить публичный ключ пользователя
export function getPublicKey(userId) {
  const keys = getPublicKeys();
  return keys[userId]?.publicKey || null;
}

// Удалить публичный ключ пользователя
export function removePublicKey(userId) {
  const keys = getPublicKeys();
  delete keys[userId];
  localStorage.setItem(KEY_STORAGE_KEY, JSON.stringify(keys));
}

// Очистить все публичные ключи
export function clearPublicKeys() {
  localStorage.removeItem(KEY_STORAGE_KEY);
}
