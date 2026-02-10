#!/bin/bash
# На сервере Ubuntu выполнить из папки backend:
#   chmod +x RUN_DATABASE.sh
#   ./RUN_DATABASE.sh
#
# Для использования переменной окружения:
#   DB_PASSWORD="ваш_пароль" ./RUN_DATABASE.sh

cd "$(dirname "$0")"

if [ -z "$DB_PASSWORD" ]; then
  echo "Введите пароль для пользователя БД aist_app:"
  read -s DB_PASSWORD
fi

sudo -u postgres psql -v DB_PASSWORD="$DB_PASSWORD" -f create_db.sql
echo "Готово. Таблицы созданы. Запуск приложения: node server.js"
