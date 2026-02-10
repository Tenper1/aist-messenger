const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const redis = require('redis');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(err => {
  console.error('Redis connection failed:', err);
  process.exit(1);
});

const RESERVED_USERNAMES = new Set([
  'aist', 'admin', 'administrator', 'support', 'help', 'info', 'service', 'bot',
  'telegram', 'system', 'null', 'undefined', 'moderator', 'mod', 'official', 'root',
  'staff', 'team', 'aist_support', 'aist_admin', 'aist_team', 'aist_official',
  'moderation', 'service_aist', 'official_aist', 'manager', 'owner', 'creator', 'founder',
  'security', 'pr', 'press', 'news', 'media', 'contact', 'feedback',
  'noreply', 'no-reply', 'mail', 'email', 'api', 'www', 'ftp', 'test',
  'demo', 'guest', 'anonymous', 'user', 'username', 'account',
]);

function normalizeUsername(s) {
  if (!s || typeof s !== 'string') return '';
  return s.replace(/^@/, '').toLowerCase().trim().replace(/[^a-z0-9_]/g, '').slice(0, 32);
}

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ——— Привязка номера к Telegram (бот вызывает этот endpoint после /start и отправки номера пользователем) ———
const TELEGRAM_LINK_SECRET = process.env.TELEGRAM_LINK_SECRET || process.env.INTERNAL_LINK_SECRET;
app.post('/api/internal/link-telegram', async (req, res) => {
  const secret = req.headers['x-link-secret'] || req.body?.secret;
  if (!TELEGRAM_LINK_SECRET || secret !== TELEGRAM_LINK_SECRET) {
    return res.status(403).json({ ok: false, message: 'Forbidden' });
  }
  const phone = req.body?.phone;
  const telegramChatId = req.body?.telegramChatId || req.body?.chat_id;
  const raw = String(phone || '').replace(/\D/g, '');
  const normalized = raw.length === 11 && raw.startsWith('7') ? raw : raw.length === 10 ? '7' + raw : raw.startsWith('8') ? '7' + raw.slice(1) : '';
  const full = normalized.length === 11 && normalized.startsWith('7') ? '+' + normalized : null;
  if (!full || !telegramChatId) {
    return res.status(400).json({ ok: false, message: 'phone and telegramChatId required' });
  }
  await redisClient.setEx(`telegram:${full}`, 86400 * 365, String(telegramChatId)); // 1 год
  res.json({ ok: true });
});

// ——— Auth (Telegram code flow). Отправка кода в Telegram-бот, если номер привязан. ———
app.post('/api/auth/request-code', async (req, res) => {
  const { phone } = req.body;
  const raw = String(phone || '').replace(/\D/g, '');
  const normalized = raw.length === 11 && raw.startsWith('7') ? raw : raw.length === 10 ? '7' + raw : raw.startsWith('8') ? '7' + raw.slice(1) : '';
  const full = normalized.length === 11 && normalized.startsWith('7') ? '+' + normalized : null;
  if (!full) return res.status(400).json({ ok: false, message: 'Некорректный номер' });
  const code = Math.random().toString().slice(2, 8);
  const key = `auth:code:${full}`;
  await redisClient.setEx(key, 300, code);

  const isDev = process.env.NODE_ENV !== 'production' || req.get('host')?.includes('localhost');
  const botToken = process.env.TGBOT || process.env.TELEGRAM_BOT_TOKEN;
  let sentViaTelegram = false;
  if (botToken) {
    const telegramChatId = await redisClient.get(`telegram:${full}`);
    if (telegramChatId) {
      try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await axios.post(url, {
          chat_id: telegramChatId,
          text: `Ваш код для входа в AIST: ${code}\n\nКод действителен 5 минут. Никому не сообщайте код.`,
          parse_mode: 'HTML',
        }, { timeout: 8000 });
        sentViaTelegram = true;
      } catch (err) {
        console.error('Telegram send code error:', err?.response?.data || err.message);
      }
    }
  }

  res.json({
    ok: true,
    masked: full.slice(0, 4) + '***' + full.slice(-2),
    ttlSeconds: 300,
    ...(isDev && !sentViaTelegram && { debugCode: code }),
  });
});

// Проверка кода: один GET в Redis, сравнение, один запрос в БД (find or create), выдача токена. Без лишних запросов.
app.post('/api/auth/verify-code', async (req, res) => {
  const { phone, code } = req.body;
  const digits = String(code || '').replace(/\D/g, '');
  if (!phone || digits.length < 4 || digits.length > 8) {
    return res.status(400).json({ ok: false, message: 'Неверный код или формат' });
  }
  const raw = String(phone || '').replace(/\D/g, '');
  const normalized = raw.length === 11 && raw.startsWith('7') ? raw : raw.length === 10 ? '7' + raw : raw.startsWith('8') ? '7' + raw.slice(1) : '';
  const full = normalized.length === 11 && normalized.startsWith('7') ? '+' + normalized : null;
  if (!full) return res.status(400).json({ ok: false, message: 'Некорректный номер' });
  const key = `auth:code:${full}`;
  const stored = await redisClient.get(key);
  if (stored !== digits) {
    redisClient.del(key).catch(() => {});
    return res.status(400).json({ ok: false, message: 'Неверный код или он истёк' });
  }
  redisClient.del(key).catch(() => {});

  let userId;
  const { rows } = await pool.query('SELECT id FROM users WHERE phone = $1', [full]);
  if (rows.length) {
    userId = rows[0].id;
  } else {
    userId = uuidv4();
    await pool.query(
      'INSERT INTO users (id, phone) VALUES ($1, $2)',
      [userId, full]
    );
  }
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ ok: true, token });
});

// ——— Вход по QR: ПК показывает код, пользователь на телефоне подтверждает ———
function randomQrCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
const QR_TTL = 300;
app.post('/api/auth/qr/request', async (req, res) => {
  const code = randomQrCode();
  await redisClient.setEx(`qr:${code}`, QR_TTL, '');
  res.json({ code, ttlSeconds: QR_TTL });
});
app.get('/api/auth/qr/check', async (req, res) => {
  const code = String(req.query.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  if (!code) return res.status(400).json({ status: 'invalid' });
  const val = await redisClient.get(`qr:${code}`);
  if (val === null) return res.json({ status: 'expired' });
  if (val === '') return res.json({ status: 'pending' });
  const userId = val;
  await redisClient.del(`qr:${code}`);
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ status: 'ready', token });
});
app.post('/api/auth/qr/confirm', auth, async (req, res) => {
  const code = String(req.body?.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  if (!code) return res.status(400).json({ ok: false, message: 'Код не указан' });
  const key = `qr:${code}`;

  // Атомарная проверка и установка через Lua скрипт
  const luaScript = `
    local val = redis.call('GET', KEYS[1])
    if val == false then
      return 0
    end
    if val ~= '' then
      return -1
    end
    redis.call('SETEX', KEYS[1], ARGV[1], ARGV[2])
    return 1
  `;

  const result = await redisClient.eval(luaScript, {
    keys: [key],
    arguments: [QR_TTL.toString(), req.userId]
  });

  if (result === 0) return res.status(400).json({ ok: false, message: 'Код истёк или не найден' });
  if (result === -1) return res.status(400).json({ ok: false, message: 'Код уже подтверждён' });

  res.json({ ok: true });
});

// ——— SMS (заглушка на время разработки) ———
app.post('/api/send-sms', async (req, res) => {
  res.status(503).json({ error: 'SMS временно недоступен' });
});

// ——— Профиль: никнейм и имя ———
app.get('/api/profile', auth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, phone, username, display_name FROM users WHERE id = $1',
    [req.userId]
  );
  const u = rows[0];
  if (!u) return res.status(404).json({ error: 'User not found' });
  res.json({
    userId: u.id,
    phone: u.phone,
    username: u.username || '',
    displayName: u.display_name || '',
  });
});

app.patch('/api/profile', auth, async (req, res) => {
  const { username, displayName } = req.body;
  const u = normalizeUsername(username);
  if (u && u.length < 2) {
    return res.status(400).json({ error: 'Никнейм не менее 2 символов' });
  }
  if (u && RESERVED_USERNAMES.has(u)) {
    return res.status(400).json({ error: 'Это имя зарезервировано' });
  }
  const display = typeof displayName === 'string' ? displayName.trim().slice(0, 64) : null;
  if (u) {
    const { rowCount } = await pool.query(
      'UPDATE users SET username = $1, updated_at = NOW() WHERE id = $2 AND NOT EXISTS (SELECT 1 FROM users WHERE LOWER(username) = LOWER($1) AND id != $2)',
      [u, req.userId]
    );
    if (rowCount === 0) {
      const { rows } = await pool.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [u]);
      if (rows.length) return res.status(409).json({ error: 'Никнейм уже занят' });
    }
  }
  if (display !== null) {
    await pool.query(
      'UPDATE users SET display_name = $1, updated_at = NOW() WHERE id = $2',
      [display, req.userId]
    );
  }
  const { rows } = await pool.query('SELECT username, display_name FROM users WHERE id = $1', [req.userId]);
  res.json({ username: rows[0]?.username || '', displayName: rows[0]?.display_name || '' });
});

// ——— Чаты: один аккаунт — одни чаты на всех устройствах. Для личных чатов — peerUserId. ———
app.get('/api/chats', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.type, c.name, c.photo, c.last_message AS "lastMessage", c.last_time AS "lastTime", c.meta
       FROM chats c
       INNER JOIN chat_members m ON m.chat_id = c.id
       WHERE m.user_id = $1
       ORDER BY c.last_time DESC NULLS LAST, c.created_at DESC`,
      [req.userId]
    );
    const out = [];
    for (const r of rows) {
      let peerUserId = null;
      if (r.type === 'user') {
        const other = await pool.query(
          'SELECT user_id FROM chat_members WHERE chat_id = $1 AND user_id != $2',
          [r.id, req.userId]
        );
        if (other.rows.length === 1) peerUserId = other.rows[0].user_id;
      }
      out.push({
        id: r.id,
        type: r.type || 'user',
        name: r.name || 'Чат',
        photo: r.photo || null,
        lastMessage: r.lastMessage || '',
        lastTime: r.lastTime ? new Date(r.lastTime).toISOString() : null,
        unread: 0,
        ...(peerUserId && { peerUserId }),
        ...(r.meta && { meta: r.meta }),
      });
    }
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load chats' });
  }
});

app.post('/api/chats', auth, async (req, res) => {
  const { name, type = 'user', photo, description, shareLink, admins = [], moderators = [], peerUserId, peerUsername } = req.body;
  try {
    // Личный чат с другим пользователем: ищем существующий или создаём
    if (type === 'user' && (peerUserId || peerUsername)) {
      let peerId = peerUserId;
      if (!peerId && peerUsername) {
        const uname = String(peerUsername).replace(/^@/, '').toLowerCase().trim();
        const u = await pool.query('SELECT id FROM users WHERE LOWER(username) = $1', [uname]);
        if (u.rows.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });
        peerId = u.rows[0].id;
      }
      if (peerId === req.userId) return res.status(400).json({ error: 'Нельзя создать чат с собой' });
      const existing = await pool.query(
        `SELECT c.id FROM chats c
         INNER JOIN chat_members m1 ON m1.chat_id = c.id AND m1.user_id = $1
         INNER JOIN chat_members m2 ON m2.chat_id = c.id AND m2.user_id = $2
         WHERE c.type = 'user'`,
        [req.userId, peerId]
      );
      if (existing.rows.length > 0) {
        const { rows } = await pool.query(
          `SELECT c.id, c.type, c.name, c.photo, c.last_message, c.last_time, c.meta FROM chats c WHERE c.id = $1`,
          [existing.rows[0].id]
        );
        const r = rows[0];
        const peerName = await pool.query('SELECT display_name, username FROM users WHERE id = $1', [peerId]);
        const displayName = (peerName.rows[0]?.display_name || peerName.rows[0]?.username || 'Пользователь') || 'Чат';
        return res.json({
          id: r.id,
          type: r.type || 'user',
          name: displayName,
          photo: r.photo || null,
          lastMessage: r.last_message || '',
          lastTime: r.last_time ? new Date(r.last_time).toISOString() : null,
          unread: 0,
          peerUserId: peerId,
        });
      }
      const chatId = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const peerNameRow = await pool.query('SELECT display_name, username FROM users WHERE id = $1', [peerId]);
      const chatName = (peerNameRow.rows[0]?.display_name || peerNameRow.rows[0]?.username || 'Пользователь') || 'Чат';
      await pool.query(
        'INSERT INTO chats (id, type, name, photo, meta) VALUES ($1, $2, $3, $4, $5)',
        [chatId, 'user', chatName, photo || null, null]
      );
      await pool.query('INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, $3), ($1, $4, $3)', [chatId, req.userId, 'member', peerId]);
      const { rows } = await pool.query('SELECT id, type, name, photo, last_message, last_time FROM chats WHERE id = $1', [chatId]);
      const r = rows[0];
      return res.status(201).json({
        id: r.id,
        type: r.type || 'user',
        name: r.name || 'Чат',
        photo: r.photo || null,
        lastMessage: r.last_message || '',
        lastTime: r.last_time ? new Date(r.last_time).toISOString() : null,
        unread: 0,
        peerUserId: peerId,
      });
    }

    const chatId = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await pool.query(
      'INSERT INTO chats (id, type, name, photo, meta) VALUES ($1, $2, $3, $4, $5)',
      [
        chatId,
        type,
        (name || '').trim() || 'Чат',
        photo || null,
        type === 'channel' ? JSON.stringify({ description: description || '', shareLink: shareLink || '', admins, moderators }) : null,
      ]
    );
    await pool.query(
      'INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, $3)',
      [chatId, req.userId, type === 'channel' || type === 'group' ? 'admin' : 'member']
    );
    const { rows } = await pool.query('SELECT id, type, name, photo, last_message, last_time, meta FROM chats WHERE id = $1', [chatId]);
    const r = rows[0];
    res.status(201).json({
      id: r.id,
      type: r.type || 'user',
      name: r.name || 'Чат',
      photo: r.photo || null,
      lastMessage: r.last_message || '',
      lastTime: r.last_time ? new Date(r.last_time).toISOString() : null,
      unread: 0,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

app.get('/api/chats/:id/messages', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const member = await pool.query('SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2', [id, req.userId]);
    if (member.rows.length === 0) return res.status(404).json({ error: 'Chat not found' });
    const { rows } = await pool.query(
      `SELECT id, sender_id AS "senderId", text, attachment, created_at AS "createdAt"
       FROM messages WHERE chat_id = $1 ORDER BY created_at ASC`,
      [id]
    );
    res.json(rows.map((m) => ({
      id: m.id,
      fromMe: m.senderId === req.userId,
      text: m.text || '',
      time: m.createdAt ? new Date(m.createdAt).toISOString() : null,
      attachment: m.attachment || undefined,
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

app.post('/api/chats/:id/messages', auth, async (req, res) => {
  const { id } = req.params;
  const { text, attachment } = req.body;
  const msgId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  try {
    const member = await pool.query('SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2', [id, req.userId]);
    if (member.rows.length === 0) return res.status(404).json({ error: 'Chat not found' });
    const textVal = typeof text === 'string' ? text.trim() : '';
    const att = attachment && typeof attachment === 'object' ? attachment : null;
    await pool.query(
      'INSERT INTO messages (id, chat_id, sender_id, text, attachment) VALUES ($1, $2, $3, $4, $5)',
      [msgId, id, req.userId, textVal || (att ? (att.type === 'image' ? 'Фото' : att.type === 'video' ? 'Видео' : 'Файл') : ''), att ? JSON.stringify(att) : null]
    );
    await pool.query(
      'UPDATE chats SET last_message = $1, last_time = NOW() WHERE id = $2',
      [textVal || (att ? 'Медиа' : ''), id]
    );
    const { rows } = await pool.query('SELECT id, sender_id, text, attachment, created_at FROM messages WHERE id = $1', [msgId]);
    const m = rows[0];
    res.status(201).json({
      id: m.id,
      fromMe: true,
      text: m.text || '',
      time: m.created_at ? new Date(m.created_at).toISOString() : null,
      attachment: m.attachment || undefined,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ——— E2E Encryption API ———

// Получить публичный ключ пользователя
app.get('/api/users/:userId/public-key', auth, async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT public_key FROM users WHERE id = $1',
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ publicKey: rows[0].public_key || null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get public key' });
  }
});

// Сохранить свой публичный ключ
app.post('/api/profile/public-key', auth, async (req, res) => {
  const { publicKey } = req.body;
  if (!publicKey || typeof publicKey !== 'string') {
    return res.status(400).json({ error: 'publicKey required' });
  }
  try {
    await pool.query(
      'UPDATE users SET public_key = $1, updated_at = NOW() WHERE id = $2',
      [publicKey, req.userId]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to save public key' });
  }
});

// Получить список пользователей для поиска (для создания чатов)
app.get('/api/users/search', auth, async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);
  try {
    const { rows } = await pool.query(
      'SELECT id, username, display_name FROM users WHERE (LOWER(username) LIKE LOWER($1) OR LOWER(display_name) LIKE LOWER($1)) AND id != $2 LIMIT 20',
      [`%${q}%`, req.userId]
    );
    res.json(rows.map(u => ({
      id: u.id,
      username: u.username || '',
      displayName: u.display_name || u.username || 'Пользователь'
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: '/ws' });
const users = new Map(); // userId -> { ws, peerUserId }

function parseWsToken(token) {
  if (!process.env.JWT_SECRET || !token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId || null;
  } catch {
    return null;
  }
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '', 'http://' + (req.headers.host || 'localhost'));
  const token = url.searchParams.get('token');
  const userId = parseWsToken(token);
  if (!userId) {
    ws.close(4001, 'Unauthorized');
    return;
  }
  users.set(userId, { ws, peerUserId: null });
  ws.userId = userId;

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      const { event, payload } = msg;
      const me = users.get(userId);
      if (!me) return;

      if (event === 'call:offer') {
        const targetUserId = payload.userId || payload.targetUserId;
        if (!targetUserId) return;
        const target = users.get(targetUserId);
        if (!target?.ws || target.ws.readyState !== WebSocket.OPEN) return;
        me.peerUserId = targetUserId;
        target.peerUserId = userId;
        target.ws.send(JSON.stringify({ event: 'call:offer', payload: { ...payload, fromUserId: userId } }));
      } else if (event === 'call:answer') {
        const peer = me.peerUserId ? users.get(me.peerUserId) : null;
        if (peer?.ws?.readyState === WebSocket.OPEN) {
          const sdp = payload?.sdp || payload;
          peer.ws.send(JSON.stringify({ event: 'call:answer', payload: sdp }));
        }
      } else if (event === 'call:ice') {
        const peer = me.peerUserId ? users.get(me.peerUserId) : null;
        if (peer?.ws?.readyState === WebSocket.OPEN) peer.ws.send(JSON.stringify({ event, payload }));
      } else if (event === 'call:hangup') {
        const peer = me.peerUserId ? users.get(me.peerUserId) : null;
        if (peer?.ws?.readyState === WebSocket.OPEN) peer.ws.send(JSON.stringify({ event: 'call:hangup' }));
        me.peerUserId = null;
        if (peer) {
          const peerData = users.get(peer.ws.userId);
          if (peerData) peerData.peerUserId = null;
        }
      }
    } catch (e) {
      console.error('WS message error', e);
    }
  });

  ws.on('close', () => {
    const me = users.get(userId);
    if (me?.peerUserId) {
      const peer = users.get(me.peerUserId);
      if (peer?.ws?.readyState === WebSocket.OPEN) peer.ws.send(JSON.stringify({ event: 'call:hangup' }));
      const peerData = users.get(me.peerUserId);
      if (peerData) peerData.peerUserId = null;
    }
    users.delete(userId);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT} (HTTP + WebSocket /ws)`);
});
