# ИНСТРУКЦИЯ ПО НАСТРОЙКЕ E2E ШИФРОВАНИЯ

## Шаг 1: Загрузите файлы на сервер

Загрузите эти файлы из папки backend в папку /root/aist-backend на сервере:
- add_public_key.sql
- e2e_endpoints.js

Используйте SCP или любой другой способ:
```bash
# С вашего компьютера
scp add_public_key.sql e2e_endpoints.js root@45.150.10.220:/root/aist-backend/
```

## Шаг 2: Применить изменения к базе данных

Подключитесь к серверу и выполните:
```bash
ssh root@45.150.10.220
cd /root/aist-backend
sudo -u postgres psql aist_messenger -f add_public_key.sql
```

## Шаг 3: Добавить E2E endpoints в server.js

Откройте server.js:
```bash
nano server.js
```

Найдите строку:
```javascript
app.listen(PORT, () => {
```

ПЕРЕД этой строкой вставьте содержимое файла e2e_endpoints.js.

Сохраните файл (Ctrl+O, Enter, Ctrl+X).

## Шаг 4: Перезапустить backend

```bash
sudo systemctl restart aist-backend
sudo systemctl status aist-backend
```

## Шаг 5: Проверить работу

```bash
# Проверить, что backend отвечает
curl http://localhost:3001/api/auth/request-code -X POST -H "Content-Type: application/json" -d '{"phone":"+79991234567"}'
```

## Шаг 6: Настроить фронтенд

1. Откройте файл .env в папке frontend
2. Убедитесь, что он содержит:
```
REACT_APP_API_URL=http://45.150.10.220:3001
```
3. Перезапустите фронтенд:
```bash
npm start
```

## Шаг 7: Включить шифрование

1. Откройте приложение в браузере
2. Зайдите в Настройки → Шифрование (E2E)
3. Включите шифрование для каждого пользователя
4. Сообщения будут автоматически шифроваться

---

## Если возникли проблемы:

### Проверить логи backend:
```bash
sudo journalctl -u aist-backend -n 50
```

### Проверить, что backend запущен:
```bash
ps aux | grep node
netstat -tlnp | grep 3001
```

### Проверить соединение с сервером:
```bash
# С вашего компьютера
curl http://45.150.10.220:3001/api/auth/request-code -X POST -H "Content-Type: application/json" -d '{"phone":"+79991234567"}'
```
