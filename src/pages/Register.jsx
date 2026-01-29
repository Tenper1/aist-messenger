import { useState } from 'react';

export default function Register() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const sendSMS = async () => {
    await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    alert('SMS отправлено');
  };

  const verifyCode = async () => {
    const res = await fetch('/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code })
    });
    const data = await res.json();
    if (data.userId) {
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('token', data.token);
      window.location.href = '/profile';
    } else {
      alert('Ошибка: ' + (data.error || 'неверный код'));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>AIST Messenger</h2>
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+79991234567" style={{ display: 'block', margin: '10px 0', padding: 8 }} />
      <button onClick={sendSMS} style={{ marginRight: 10 }}>Получить SMS</button>
      <input value={code} onChange={e => setCode(e.target.value)} placeholder="Код" style={{ display: 'block', margin: '10px 0', padding: 8 }} />
      <button onClick={verifyCode}>Войти</button>
    </div>
  );
}