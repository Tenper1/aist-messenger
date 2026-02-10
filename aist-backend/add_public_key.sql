-- Добавление поля для хранения публичного ключа E2E шифрования
-- Выполнить на сервере: sudo -u postgres psql aist_messenger -f add_public_key.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS public_key TEXT;

-- Создать индекс для быстрого поиска по публичному ключу
CREATE INDEX IF NOT EXISTS idx_users_public_key ON users (public_key) WHERE public_key IS NOT NULL;
