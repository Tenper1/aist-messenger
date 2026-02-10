# Пошаговая инструкция: развёртывание видео- и аудиозвонков на бэкенде

## Что нужно для работы звонков

- Тот же бэкенд (Node.js + Express), к которому уже подключается фронт.
- WebSocket-сервер для **сигнализации** (обмен offer/answer/ICE между двумя пользователями).
- JWT для проверки пользователя при подключении по WebSocket.

---

## Шаг 1. Установить зависимость

В папке бэкенда:

```bash
cd backend
npm install ws
```

Пакет `ws` — это WebSocket-сервер для Node.js.

---

## Шаг 2. HTTP + WebSocket на одном порту

В этом репозитории код уже добавлен в конец `server.js`: создаётся `http.createServer(app)`, поднимается WebSocket по пути `/ws`, при подключении проверяется JWT из query (`/ws?token=...`), события `call:offer` / `call:answer` / `call:ice` / `call:hangup` пересылаются между двумя пользователями.

Если правите вручную — в конце `server.js` должно быть так (кратко):

```javascript
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3001;

// HTTP-сервер из Express
const server = http.createServer(app);

// WebSocket по пути /ws (токен в query: /ws?token=...)
const wss = new WebSocket.Server({ server, path: '/ws' });

const JWT_SECRET = process.env.JWT_SECRET;
const users = new Map(); // userId -> { ws, peerUserId }

function parseToken(token) {
  if (!JWT_SECRET || !token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId || null;
  } catch {
    return null;
  }
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '', 'http://' + (req.headers.host || 'localhost'));
  const token = url.searchParams.get('token');
  const userId = parseToken(token);
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
      } else if (event === 'call:answer' || event === 'call:ice') {
        const peer = me.peerUserId ? users.get(me.peerUserId) : null;
        if (peer?.ws?.readyState === WebSocket.OPEN) {
          peer.ws.send(JSON.stringify({ event, payload }));
        }
      } else if (event === 'call:hangup') {
        const peer = me.peerUserId ? users.get(me.peerUserId) : null;
        if (peer?.ws?.readyState === WebSocket.OPEN) {
          peer.ws.send(JSON.stringify({ event: 'call:hangup' }));
        }
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
      if (peer?.ws?.readyState === WebSocket.OPEN) {
        peer.ws.send(JSON.stringify({ event: 'call:hangup' }));
      }
      if (peer) {
        const peerData = users.get(me.peerUserId);
        if (peerData) peerData.peerUserId = null;
      }
    }
    users.delete(userId);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT} (HTTP + WebSocket /ws)`);
});
```

Итого: один порт; по нему и REST API, и WebSocket по пути `/ws?token=JWT`.

---

## Шаг 3. Переменные окружения

Убедитесь, что на сервере задано:

- `JWT_SECRET` — тот же секрет, что и для REST API (выдача токена при верификации кода).

Дополнительно для фронта (Vercel или `.env`):

- `REACT_APP_WS_URL` — полный URL WebSocket, например:
  - локально: `ws://localhost:3001/ws`
  - продакшен: `wss://api.get-aist.ru/ws` (обязательно **wss** по HTTPS).

---

## Шаг 4. Деплой бэкенда

1. Закоммитьте изменения в `server.js` и задеплойте бэкенд как обычно (тот же процесс, тот же порт).
2. Прокси/nginx: если перед Node висит nginx, настроить апгрейд для WebSocket:
   ```nginx
   location /ws {
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection "Upgrade";
     proxy_set_header Host $host;
     proxy_pass http://localhost:3001;
   }
   ```
3. На VPS/облаке порт оставить один (например 3001), HTTP и WS работают через один `server`.

---

## Шаг 5. Формат сообщений (для фронтенда)

Клиент подключается так:

```text
wss://ваш-домен/ws?token=JWT_ТОКЕН
```

Сообщения — JSON с полями `event` и опционально `payload`.

| Событие (клиент → сервер) | payload | Действие сервера |
|---------------------------|--------|-------------------|
| `call:offer`              | `{ sdp, userId }` — SDP offer и **userId** того, кому звоним | Записать пару звонящий↔принимающий, переслать offer принимающему с `fromUserId`. |
| `call:answer`             | `{ sdp }` | Переслать ответ противоположной стороне текущего звонка. |
| `call:ice`                | `{ candidate }` | Переслать ICE-кандидат противоположной стороне. |
| `call:hangup`             | — | Очистить пару, переслать hangup собеседнику. |

Сервер клиенту шлёт те же события (`call:offer`, `call:answer`, `call:ice`, `call:hangup`), при необходимости добавляя в payload поля вроде `fromUserId`.

---

## Шаг 6. Проверка

1. Запуск бэкенда: в логе должно быть `Backend running on port 3001 (HTTP + WebSocket /ws)`.
2. Подключение по WebSocket с тестовым JWT (например через Postman или скрипт) к `ws://localhost:3001/ws?token=ВАШ_JWT` — соединение не должно закрываться с 4001.
3. Два пользователя в мессенджере: после доработки фронта (отправка offer/answer/ICE через этот WebSocket) звонок должен устанавливаться.

---

## Краткий чеклист

- [ ] `npm install ws` в backend
- [ ] В `server.js`: `http.createServer(app)`, `new WebSocket.Server({ server, path: '/ws' })`, обработка `connection` и событий, `server.listen(PORT)`
- [ ] Задан `JWT_SECRET`
- [ ] На фронте задан `REACT_APP_WS_URL` (wss в продакшене)
- [ ] Прокси (nginx и т.п.) настроен на апгрейд для `/ws`
- [ ] Во фронте в `CallScreen` подключить WebSocket и обмен offer/answer/ICE по этой схеме

После выполнения этих шагов бэкенд для развёртывания видео- и аудиозвонков готов; остаётся подключить к этому API компонент звонка на фронте.
