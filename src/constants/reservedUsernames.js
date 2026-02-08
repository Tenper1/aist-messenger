/**
 * Зарезервированные никнеймы (без @). Нельзя зарегистрировать.
 * Защита от выдачи себя за администрацию и сервис.
 */
const RESERVED_USERNAMES = new Set([
  'aist', 'admin', 'administrator', 'support', 'help', 'info', 'service', 'bot',
  'telegram', 'system', 'null', 'undefined', 'moderator', 'mod', 'official', 'root',
  'staff', 'team', 'aist_support', 'aist_admin', 'aist_team', 'aist_official',
  'moderation', 'service_aist', 'official_aist', 'админ', 'поддержка', 'служба',
  'техподдержка', 'оператор', 'manager', 'owner', 'creator', 'founder',
  'security', 'pr', 'press', 'news', 'media', 'contact', 'feedback',
  'noreply', 'no-reply', 'mail', 'email', 'api', 'www', 'ftp', 'test',
  'demo', 'guest', 'anonymous', 'user', 'username', 'account',
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
