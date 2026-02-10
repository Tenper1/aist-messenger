# AIST Backend

## Запуск (один процесс — API + звонки)

Запускайте **только** `server.js`. Он поднимает и HTTP API, и WebSocket для звонков на пути `/ws` (тот же порт).

```bash
cd aist-backend
npm install
# Скопировать env.txt в .env и заполнить
npm start
# или: node server.js
```

Порт по умолчанию: **3001**. Фронт подключается к `http://ваш-хост:3001` и к `ws://ваш-хост:3001/ws` для звонков.

**Не запускайте** отдельный `calls-ws.js` — он не нужен.

### Первый запуск на сервере (например ~/aist-backend)

```bash
cd ~/aist-backend
npm install
cp env.txt .env
# отредактировать .env (DB_*, REDIS_URL, JWT_SECRET)
node server.js
```

Либо один скрипт (установит зависимости при первом запуске):

```bash
chmod +x start.sh
./start.sh
```

### Автозапуск при загрузке сервера (systemd)

```bash
# Подставить свой путь в aist-backend.service (WorkingDirectory=)
sudo cp aist-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable aist-backend
sudo systemctl start aist-backend
```

Перед первым `start` один раз выполнить в папке бэкенда: `npm install`.

Для продакшена с БД и Redis (Docker):

```bash
# В корне aist-messenger
docker-compose up -d
# Применить миграции (init.sql) к PostgreSQL
psql -h localhost -U aist -d aist_messenger -f postregeSQL/init.sql
```

## Оптимизация проверки кода (verify)

- В `POST /api/auth/verify-code`: один запрос в Redis (`GET` по ключу кода), сравнение, один запрос в БД (поиск/создание пользователя), выдача JWT. Никаких лишних запросов — так проверка выполняется максимально быстро без потери безопасности.
- Ключ Redis: `auth:code:${phone}`. TTL 300 сек. После успешной проверки ключ удаляется.

## Эндпоинты

- `POST /api/auth/request-code` — запрос кода. Если задан `TGBOT` и номер привязан к Telegram (через бота), код отправляется в чат с пользователем.
- `POST /api/auth/verify-code` — проверка кода, выдача токена
- `POST /api/internal/link-telegram` — привязка номера к Telegram (вызывает бот). Тело: `{ phone, telegramChatId }`, заголовок `X-Link-Secret: <TELEGRAM_LINK_SECRET>`. После привязки при запросе кода он уходит в Telegram.
- `POST /api/auth/qr/request` — выдать код для входа по QR (ПК). Ответ: `{ code, ttlSeconds }`.
- `GET /api/auth/qr/check?code=...` — проверить код (ПК опрашивает). Ответ: `{ status: 'pending'|'ready'|'expired', token? }`.
- `POST /api/auth/qr/confirm` — подтвердить вход по коду (телефон, с Bearer). Тело: `{ code }`.

**Как работает отправка кода в Telegram:** В .env задайте `TGBOT` (токен от BotFather) и `TELEGRAM_LINK_SECRET`. Бот (отдельный скрипт или webhook) при получении от пользователя номера телефона должен вызвать `POST /api/internal/link-telegram` с телом `{ phone: "+79...", telegramChatId: chat.id }` и заголовком `X-Link-Secret: <TELEGRAM_LINK_SECRET>`. После этого при запросе кода на сайте бэкенд отправит код в этот чат через Telegram Bot API.

- `GET /api/profile` — профиль (auth)
- `PATCH /api/profile` — обновление username, displayName (auth). Никнеймы из списка RESERVED_USERNAMES (в т.ч. @aist) запрещены.

## Миграция

В `postregeSQL/init.sql` добавлены поля `username`, `display_name` и таблицы для групповых чатов/каналов. Для существующей БД выполните:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_users_username ON users (LOWER(username));
```
