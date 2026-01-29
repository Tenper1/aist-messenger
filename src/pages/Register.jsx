import { useState } from 'react';

export default function Register() {
  const [telegramId, setTelegramId] = useState('');
  const [code, setCode] = useState('');

  const sendCode = async () => {
    if (!telegramId || isNaN(telegramId)) {
      alert('Введите числовой Telegram ID');
      return;
    }
    try {
      const res = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: Number(telegramId) })
      });
      const data = await res.json();
      if (data.ok) {
        alert('Код отправлен в Telegram!');
      } else {
        alert('Ошибка: ' + (data.error || 'неизвестно'));
      }
    } catch (e) {
      alert('Ошибка сети: ' + e.message);
    }
  };

  const verifyCode = async () => {
    if (!telegramId || !code) {
      alert('Заполните все поля');
      return;
    }
    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: Number(telegramId), code })
      });
      const data = await res.json();
      if (data.userId) {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('token', data.token);
        window.location.href = '/profile';
      } else {
        alert('Ошибка: ' + (data.error || 'неверный код'));
      }
    } catch (e) {
      alert('Ошибка сети: ' + e.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>AIST Messenger</h2>
      <p>Введите ваш Telegram ID (число из getUpdates)</p>
      <input
        value={telegramId}
        onChange={e => setTelegramId(e.target.value)}
        placeholder="410797157"
        type="number"
        style={{ display: 'block', margin: '10px 0', padding: 8, width: '100%' }}
      />
      <button onClick={sendCode} style={{ marginRight: 10, padding: '8px 16px' }}>
        Получить код
      </button>

      <input
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Код из Telegram"
        style={{ display: 'block', margin: '10px 0', padding: 8, width: '100%' }}
      />
      <button onClick={verifyCode} style={{ padding: '8px 16px' }}>
        Войти
      </button>
    </div>
  );
}