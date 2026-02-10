# Загрузка файлов на сервер

## С локального компьютера (Windows PowerShell)

### 1. Загрузить обновлённый server.js
```powershell
scp C:\Users\Vladislav\Desktop\aist-messenger\aist-backend\server.js root@45.150.10.220:/root/aist-messenger/aist-backend/
```

### 2. Загрузить миграцию базы данных
```powershell
scp C:\Users\Vladislav\Desktop\aist-messenger\aist-backend\add_public_key.sql root@45.150.10.220:/root/aist-messenger/aist-backend/
```

### 3. Загрузить .env файл (если изменён)
```powershell
scp C:\Users\Vladislav\Desktop\aist-messenger\aist-backend\.env root@45.150.10.220:/root/aist-messenger/aist-backend/
```

### 4. Загрузить все файлы бэкенда сразу
```powershell
scp -r C:\Users\Vladislav\Desktop\aist-messenger\aist-backend\* root@45.150.10.220:/root/aist-messenger/aist-backend/
```

## После загрузки - выполните команды на сервере

См. файл `SERVER_COMMANDS.txt` для полного списка команд.

Кратко:
```bash
ssh root@45.150.10.220
cd /root/aist-messenger/aist-backend
sudo -u postgres psql aist_messenger -f add_public_key.sql
pm2 restart aist-backend
pm2 logs aist-backend --lines 50
```

## Проверка

После перезапуска проверьте, что API работает:
```bash
curl http://localhost:3001/api/health
```

И проверьте новые E2E endpoints (нужен токен авторизации):
```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3001/api/users/<USER_ID>/public-key
```
