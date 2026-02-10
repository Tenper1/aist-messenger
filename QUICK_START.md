# Быстрый старт — E2E + Liquid Glass

## ✅ Что готово

### Frontend
- ✅ `.env` создан с `REACT_APP_API_URL=http://localhost:3001`
- ✅ Дизайн чатов обновлён (Liquid Glass)
- ✅ Сборка прошла успешно

### Backend
- ✅ `server.js` обновлён с E2E endpoints
- ✅ `add_public_key.sql` готов к миграции
- ✅ Файлы скопированы на рабочий стол

---

## 🚀 Действия на сервере (45.150.10.220)

### Шаг 1: Загрузить файлы (PowerShell на локальном ПК)

```powershell
scp C:\Users\Vladislav\Desktop\aist-messenger\aist-backend\server.js root@45.150.10.220:/root/aist-messenger/aist-backend/
scp C:\Users\Vladislav\Desktop\aist-messenger\aist-backend\add_public_key.sql root@45.150.10.220:/root/aist-messenger/aist-backend/
```

### Шаг 2: Подключиться к серверу

```bash
ssh root@45.150.10.220
```

### Шаг 3: Применить миграцию и перезапустить

```bash
cd /root/aist-messenger/aist-backend
sudo -u postgres psql aist_messenger -f add_public_key.sql
pm2 restart aist-backend
pm2 logs aist-backend --lines 50
```

### Шаг 4: Проверить

```bash
curl http://localhost:3001/api/health
```

---

## 🎨 Проверка фронтенда

### Локально

```powershell
cd C:\Users\Vladislav\Documents\GitHub\aist-messenger
npm start
```

Откройте http://localhost:3000

### Production сборка

```powershell
npm run build
```

---

## 🔐 Настройка E2E в приложении

1. Откройте приложение
2. Авторизуйтесь
3. Перейдите в **Настройки**
4. Нажмите **«Настроить E2E шифрование»**
5. Создайте пароль для ключей
6. Готово!

---

## 📚 Полная документация

- `SUMMARY.md` — полная сводка изменений
- `DEPLOYMENT_GUIDE.md` — руководство по развертыванию
- `SERVER_COMMANDS.txt` — все команды для сервера
- `UPLOAD_TO_SERVER.md` — инструкции по загрузке файлов

---

## ⚡ Быстрые ссылки

**Frontend:** `C:\Users\Vladislav\Documents\GitHub\aist-messenger`
**Backend:** `C:\Users\Vladislav\Desktop\aist-messenger\aist-backend`
**Server:** 45.150.10.220

---

## ✨ Готово к работе!

Все изменения готовы к развертыванию. Следуйте инструкциям выше.
