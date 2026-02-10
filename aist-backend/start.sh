#!/bin/bash
# Запуск бэкенда: установка зависимостей (если нужно) и старт сервера.
# Запуск: ./start.sh  или  bash start.sh
# Для автозапуска при загрузке сервера используйте systemd (см. aist-backend.service).

cd "$(dirname "$0")"

if [ ! -d "node_modules" ] || [ ! -f "node_modules/express/package.json" ]; then
  echo "Установка зависимостей..."
  npm install --no-audit --no-fund
fi

echo "Запуск server.js (PORT=${PORT:-3001})..."
exec node server.js
