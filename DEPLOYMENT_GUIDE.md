# Руководство по развертыванию E2E шифрования на сервере

## Подготовка на сервере (45.150.10.220)

### 1. Подключение к серверу
```bash
ssh root@45.150.10.220
```

### 2. Перейти в директорию бэкенда
```bash
cd /root/aist-messenger/aist-backend
```

### 3. Применить миграцию базы данных
```bash
sudo -u postgres psql aist_messenger -f add_public_key.sql
```

### 4. Установить зависимости (если нужно)
```bash
npm install
```

### 5. Перезапустить бэкенд с помощью PM2
```bash
pm2 restart aist-backend
# или если не запущено:
pm2 start server.js --name aist-backend
```

### 6. Проверить статус
```bash
pm2 status
pm2 logs aist-backend --lines 50
```

### 7. Проверить, что API работает
```bash
curl http://localhost:3001/api/health
```

## Проверка фронтенда

### 1. Сборка фронтенда
```powershell
cd C:\Users\Vladislav\Documents\GitHub\aist-messenger
npm run build
```

### 2. Запуск локально для тестирования
```powershell
npm start
```

## Настройка E2E шифрования в приложении

1. Откройте приложение
2. Перейдите в Настройки
3. Нажмите "Настроить E2E шифрование"
4. Следуйте инструкциям для генерации пары ключей

## Структура файлов

### Backend (C:\Users\Vladislav\Desktop\aist-messenger\aist-backend\)
- `server.js` - главный файл сервера с интегрированными E2E endpoints
- `add_public_key.sql` - миграция БД для публичных ключей
- `.env` - конфигурация окружения
- `package.json` - зависимости

### Frontend (C:\Users\Vladislav\Documents\GitHub\aist-messenger\)
- `.env` - конфигурация (REACT_APP_API_URL=http://localhost:3001)
- `src/lib/e2eCrypto.js` - шифрование RSA-OAEP
- `src/lib/keyStorage.js` - хранение ключей
- `src/lib/api.js` - API клиент с E2E функциями
- `src/components/E2ESetup.jsx` - UI настройки E2E
- `src/components/Chats.jsx` - обновлённый интерфейс чатов (Liquid Glass)
- `src/pages/Messenger.jsx` - страница мессенджера

## Новые API endpoints

- `GET /api/users/:userId/public-key` - получить публичный ключ пользователя
- `POST /api/profile/public-key` - сохранить свой публичный ключ
- `GET /api/users/search?q=<query>` - поиск пользователей для создания чатов

## Стиль Liquid Glass

Обновлённый дизайн включает:
- Полупрозрачные элементы с backdrop-filter: blur()
- Градиентные аватары
- Скруглённые углы (border-radius: 18-22px)
- Тени и свечение для глубины
- Плавные анимации переходов
- Современная типографика
- Цветовая схема в стиле Telegram
