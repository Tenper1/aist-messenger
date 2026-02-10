/**
 * E2E Encryption для AIST Messenger
 * - Сообщения шифруются локально перед отправкой
 * - Сервер только ретранслирует зашифрованные данные
 * - Ключи хранятся только на устройствах пользователей
 */

const KEY_STORAGE_PREFIX = 'aist_e2e_';

// Генерация ключевой пары (RSA-OAEP)
export async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
  return keyPair;
}

// Экспорт публичного ключа в формате для отправки
export async function exportPublicKey(key) {
  const exported = await window.crypto.subtle.exportKey('spki', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Импорт публичного ключа другого пользователя
export async function importPublicKey(pem) {
  const binaryDerString = atob(pem);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }
  return window.crypto.subtle.importKey(
    'spki',
    binaryDer.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt']
  );
}

// Экспорт приватного ключа для хранения (зашифрованный паролем)
export async function exportPrivateKey(key, password) {
  const exported = await window.crypto.subtle.exportKey('pkcs8', key);
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    aesKey,
    exported
  );
  const combined = new Uint8Array(salt.length + iv.length + encrypted.length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(encrypted, salt.length + iv.length);
  return btoa(String.fromCharCode(...combined));
}

// Импорт приватного ключа из хранилища
export async function importPrivateKey(encryptedPem, password) {
  const combined = new Uint8Array(
    atob(encryptedPem).split('').map(c => c.charCodeAt(0))
  );
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encrypted = combined.slice(28);
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    aesKey,
    encrypted
  );
  return window.crypto.subtle.importKey(
    'pkcs8',
    decrypted,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['decrypt']
  );
}

// Шифрование сообщения для получателя
export async function encryptMessage(message, publicKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    data
  );
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

// Расшифрование сообщения от отправителя
export async function decryptMessage(encryptedBase64, privateKey) {
  try {
    const encrypted = new Uint8Array(
      atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
    );
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encrypted
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (e) {
    console.error('Decryption failed:', e);
    return '[Зашифрованное сообщение]';
  }
}

// Сохранение ключевой пары в IndexedDB
export async function storeKeyPair(keyPair, password) {
  const publicKeyPem = await exportPublicKey(keyPair.publicKey);
  const privateKeyPem = await exportPrivateKey(keyPair.privateKey, password);
  
  localStorage.setItem(`${KEY_STORAGE_PREFIX}public`, publicKeyPem);
  localStorage.setItem(`${KEY_STORAGE_PREFIX}private`, privateKeyPem);
  
  return publicKeyPem;
}

// Загрузка ключевой пары из IndexedDB
export async function loadKeyPair(password) {
  const publicKeyPem = localStorage.getItem(`${KEY_STORAGE_PREFIX}public`);
  const privateKeyPem = localStorage.getItem(`${KEY_STORAGE_PREFIX}private`);
  
  if (!publicKeyPem || !privateKeyPem) return null;
  
  try {
    const privateKey = await importPrivateKey(privateKeyPem, password);
    const publicKey = await importPublicKey(publicKeyPem);
    return { publicKey, privateKey };
  } catch (e) {
    console.error('Failed to load key pair:', e);
    return null;
  }
}

// Проверка наличия ключей
export function hasKeys() {
  return !!localStorage.getItem(`${KEY_STORAGE_PREFIX}public`);
}

// Удаление ключей
export function clearKeys() {
  localStorage.removeItem(`${KEY_STORAGE_PREFIX}public`);
  localStorage.removeItem(`${KEY_STORAGE_PREFIX}private`);
}

// Генерация общего ключа для чата (опционально для групповых чатов)
export async function generateSharedKey() {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  return key;
}

// Шифрование через AES-GCM (для групповых чатов)
export async function encryptAES(message, key) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const iv = window.crypto.subtle.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  );
  const combined = new Uint8Array(iv.length + encrypted.length);
  combined.set(iv, 0);
  combined.set(encrypted, iv.length);
  return btoa(String.fromCharCode(...combined));
}

// Расшифрование через AES-GCM
export async function decryptAES(encryptedBase64, key) {
  try {
    const combined = new Uint8Array(
      atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
    );
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (e) {
    console.error('AES decryption failed:', e);
    return '[Зашифрованное сообщение]';
  }
}
