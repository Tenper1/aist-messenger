# Звонки: пошаговая инструкция (всё в терминале сервера)

Вы храните проект на сервере и отправляете туда файлы из папки бэкенда. **Все команды ниже выполняются в терминале на сервере** (после подключения по SSH).

---

## Шаг 0. Отправить файлы на сервер

На своём компьютере **никаких команд в терминале не нужно**. Просто отправьте на сервер (как вы обычно это делаете — FileZilla, панель хостинга, копирование в папку) обновлённые файлы:

- **server.js** (с WebSocket для звонков в конце файла)
- **package.json** (в `dependencies` должна быть строка `"ws": "^8.18.0"` или аналогичная)

Положить их нужно в ту же папку бэкенда на сервере, где уже лежит проект (заменить старые файлы).

После того как файлы на сервере — подключайтесь по SSH и дальше только команды из этого файла.

---

## Шаг 1. Подключиться к серверу

В терминале (на ПК) выполните:

```bash
ssh user@ваш-сервер
```

Подставьте свой логин вместо `user` и адрес сервера (IP или домен) вместо `ваш-сервер`. Дальше все команды — уже на сервере.

---

## Шаг 2. Перейти в папку бэкенда

```bash
cd /home/user/aist-messenger/backend
```

**Замените путь на свой** — тот каталог на сервере, где лежат `server.js` и `package.json` бэкенда. Например может быть: `/var/www/aist-messenger/backend` или `/root/backend`.

Проверить, что вы в нужной папке:

```bash
ls -la server.js package.json
```

Должны отобразиться оба файла.

---

## Шаг 3. Установить зависимости (в т.ч. `ws`)

```bash
npm install
```

Дождитесь окончания. В конце не должно быть ошибок.

---

## Шаг 4. Проверить JWT_SECRET

```bash
grep JWT_SECRET .env
```

Должна вывестись строка вида `JWT_SECRET=...`. Если `.env` нет или в нём нет `JWT_SECRET`, добавьте (подставьте свой секрет):

```bash
echo "JWT_SECRET=ваш-секретный-ключ" >> .env
```

Или создайте файл:

```bash
nano .env
```

Вставьте строку `JWT_SECRET=ваш-секретный-ключ`, сохраните (Ctrl+O, Enter, Ctrl+X).

---

## Шаг 5. Перезапустить бэкенд

Выберите тот способ, которым вы обычно запускаете бэкенд.

**Если используете PM2:**

```bash
pm2 list
```

Посмотрите имя приложения (например `backend` или `aist-backend`). Затем:

```bash
pm2 restart backend
```

Если имя другое — подставьте его. Или перезапустить все процессы:

```bash
pm2 restart all
```

Проверить логи:

```bash
pm2 logs backend --lines 20
```

В логах при старте должно быть: **`Backend running on port 3001 (HTTP + WebSocket /ws)`**.

---

**Если используете systemd (сервис):**

```bash
sudo systemctl restart aist-backend
```

Замените `aist-backend` на имя вашего сервиса. Проверить статус:

```bash
sudo systemctl status aist-backend
```

---

**Если запускаете вручную (node server.js):**

Найти процесс:

```bash
ps aux | grep node
```

Убить процесс с `server.js` (подставьте номер ПИД вместо `12345`):

```bash
kill 12345
```

Запустить снова в фоне:

```bash
nohup node server.js > server.log 2>&1 &
```

Проверить лог:

```bash
tail -5 server.log
```

Должна быть строка: **`Backend running on port 3001 (HTTP + WebSocket /ws)`**.

---

## Шаг 6. Nginx (если перед Node стоит Nginx)

Только если запросы к API идут через Nginx. Открыть конфиг сайта:

```bash
sudo nano /etc/nginx/sites-available/ваш-сайт
```

(или `sudo nano /etc/nginx/conf.d/ваш-сайт.conf` — как у вас принято.)

Внутрь блока `server { ... }` вставьте:

```nginx
location /ws {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_pass http://127.0.0.1:3001;
}
```

Замените `3001` на порт, на котором слушает ваш Node. Сохраните (Ctrl+O, Enter, Ctrl+X). Проверить и перезагрузить Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Шаг 7. Переменная на фронте

В настройках фронта (Vercel или другой хостинг) добавьте переменную окружения:

- **Имя:** `REACT_APP_WS_URL`
- **Значение:** `wss://ваш-домен-api/ws` (например `wss://api.get-aist.ru/ws`)

Сохраните и сделайте повторный деплой фронта.

---

## Шаг 8. Проверка

В логах бэкенда на сервере при запуске должна быть строка:

```
Backend running on port 3001 (HTTP + WebSocket /ws)
```

Проверка WebSocket с сервера (подставьте свой JWT и домен):

```bash
npm install -g wscat
wscat -c "wss://api.get-aist.ru/ws?token=ВАШ_JWT"
```

Если подключение установилось и сокет не закрылся с ошибкой 4001 — сигнализация для звонков работает.

---

## Краткий чеклист (всё на сервере, кроме отправки файлов)

- [ ] Отправить на сервер обновлённые **server.js** и **package.json** (как вы обычно отправляете файлы)
- [ ] Подключиться по SSH
- [ ] `cd .../backend` (ваш путь к папке бэкенда)
- [ ] `npm install`
- [ ] В `.env` есть `JWT_SECRET`
- [ ] Перезапустить бэкенд (pm2 / systemctl / kill + node server.js)
- [ ] В логах: `Backend running on port ... (HTTP + WebSocket /ws)`
- [ ] Если есть Nginx: добавлен `location /ws`, затем `sudo nginx -t` и `sudo systemctl reload nginx`
- [ ] На фронте задана `REACT_APP_WS_URL` и сделан повторный деплой

После этого бэкенд для звонков развёрнут.
