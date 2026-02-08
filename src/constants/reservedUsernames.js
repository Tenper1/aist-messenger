/**
 * Зарезервированные никнеймы (без @). Нельзя зарегистрировать для пользователей.
 * @aist — официальный канал/аккаунт сервиса.
 */
const RESERVED_USERNAMES = new Set([
  'aist',
  'admin',
  'support',
  'help',
  'info',
  'service',
  'bot',
  'telegram',
  'system',
  'null',
  'undefined',
  'moderator',
  'mod',
  'official',
  'root',
]);

export function isReservedUsername(username) {
  if (!username || typeof username !== 'string') return true;
  const normalized = username.replace(/^@/, '').toLowerCase().trim();
  if (!normalized || normalized.length < 2) return true;
  return RESERVED_USERNAMES.has(normalized);
}

export function normalizeUsernameInput(value) {
  const s = String(value ?? '').replace(/^@/, '').toLowerCase().trim();
  return s.replace(/[^a-z0-9_]/g, '').slice(0, 32);
}

export { RESERVED_USERNAMES };
