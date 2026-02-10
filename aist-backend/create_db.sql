-- НЕ вводить в bash! Только через psql. На сервере выполнить:
--   cd ~/aist-messenger/backend   &&   sudo -u postgres psql -f create_db.sql
--
-- ВАЖНО: Замените пароль ниже на надёжный перед первым запуском!
-- Или используйте переменную окружения: :DB_PASSWORD (при запуске через psql -v DB_PASSWORD="ваш_пароль")

CREATE USER aist_app WITH PASSWORD :'DB_PASSWORD';

CREATE DATABASE aist_messenger OWNER aist_app ENCODING 'UTF8';

\c aist_messenger

GRANT ALL PRIVILEGES ON DATABASE aist_messenger TO aist_app;
GRANT ALL ON SCHEMA public TO aist_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO aist_app;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (LOWER(username));

CREATE TABLE IF NOT EXISTS message_logs (
  id SERIAL PRIMARY KEY,
  from_user TEXT NOT NULL,
  to_user TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  ip INET
);

CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'user',
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS chat_members (
  chat_id TEXT NOT NULL REFERENCES chats(id),
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (chat_id, user_id)
);

-- Сообщения в чатах (один аккаунт — одни чаты на всех устройствах)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL REFERENCES chats(id),
  sender_id TEXT NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  attachment JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages (chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (chat_id, created_at);

-- Расширение чатов: фото, последнее сообщение, мета для каналов
ALTER TABLE chats ADD COLUMN IF NOT EXISTS photo TEXT;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS last_message TEXT;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS last_time TIMESTAMP;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS meta JSONB;

GRANT ALL ON ALL TABLES IN SCHEMA public TO aist_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO aist_app;
