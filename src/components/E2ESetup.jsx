import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { apiSetPublicKey } from '../lib/api';
import {
  hasKeys,
  generateKeyPair,
  storeKeyPair,
  loadKeyPair,
  clearKeys,
} from '../lib/e2eCrypto';

export default function E2ESetup({ onClose }) {
  const { theme } = useTheme();
  const { phone } = useUser();
  const [step, setStep] = useState(hasKeys() ? 'ready' : 'intro');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSetup = async () => {
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsGenerating(true);
    try {
      const keyPair = await generateKeyPair();
      const publicKeyPem = await storeKeyPair(keyPair, password);
      
      // Отправляем публичный ключ на сервер
      await apiSetPublicKey(publicKeyPem);
      
      setSuccess('Ключи сгенерированы и сохранены! Теперь ваши сообщения будут зашифрованы.');
      setStep('ready');
    } catch (e) {
      console.error('E2E setup failed:', e);
      setError('Не удалось сгенерировать ключи. Попробуйте снова.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Вы уверены? Это удалит ваши ключи шифрования. Вы не сможете расшифровать старые сообщения.')) {
      return;
    }
    clearKeys();
    setStep('intro');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const styles = {
    container: {
      padding: '20px 0',
    },
    title: {
      fontSize: 18,
      fontWeight: 600,
      marginBottom: 16,
      color: theme.text,
    },
    text: {
      fontSize: 14,
      color: theme.textMuted,
      marginBottom: 20,
      lineHeight: 1.5,
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: 12,
      border: '1px solid ' + (theme.border || 'rgba(255,255,255,.1)'),
      background: theme.inputBg,
      color: theme.text,
      fontSize: 15,
      marginBottom: 12,
      outline: 'none',
    },
    button: {
      width: '100%',
      padding: '12px',
      borderRadius: 12,
      border: 'none',
      background: theme.accent,
      color: theme.accentText || '#fff',
      fontSize: 15,
      fontWeight: 500,
      cursor: isGenerating ? 'not-allowed' : 'pointer',
      opacity: isGenerating ? 0.6 : 1,
    },
    dangerButton: {
      width: '100%',
      padding: '12px',
      borderRadius: 12,
      border: 'none',
      background: 'rgba(229, 57, 53, 0.15)',
      color: '#e53935',
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
      marginTop: 16,
    },
    error: {
      color: '#e53935',
      fontSize: 13,
      marginBottom: 12,
    },
    success: {
      color: '#4caf50',
      fontSize: 13,
      marginBottom: 12,
    },
    status: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '12px 16px',
      borderRadius: 12,
      background: 'rgba(76, 175, 80, 0.1)',
      color: '#4caf50',
      fontSize: 14,
      marginBottom: 20,
    },
  };

  return (
    <div style={styles.container}>
      {step === 'intro' && (
        <>
          <div style={styles.title}>Сквозное шифрование (E2E)</div>
          <p style={styles.text}>
            Включите сквозное шифрование для защиты ваших сообщений. 
            Сообщения шифруются на вашем устройстве и могут быть расшифрованы только получателем. 
            Сервер не имеет доступа к содержимому сообщений.
          </p>
          <p style={styles.text}>
            <strong>Важно:</strong> запомните пароль для расшифрования. 
            Если вы его забудете, вы не сможете восстановить доступ к своим сообщениям.
          </p>
          <input
            type="password"
            style={styles.input}
            placeholder="Пароль для защиты ключей (минимум 8 символов)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            style={styles.input}
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <div style={styles.error}>{error}</div>}
          <button
            type="button"
            style={styles.button}
            onClick={handleSetup}
            disabled={isGenerating}
          >
            {isGenerating ? 'Генерация ключей...' : 'Включить шифрование'}
          </button>
        </>
      )}

      {step === 'ready' && (
        <>
          <div style={styles.title}>Шифрование включено ✓</div>
          <div style={styles.status}>
            <span>🔒</span>
            <span>Ваши сообщения защищены сквозным шифрованием</span>
          </div>
          <p style={styles.text}>
            Публичный ключ отправлен на сервер. Теперь когда вы общаетесь с пользователями, 
            у которых также включено шифрование, сообщения будут автоматически шифроваться.
          </p>
          {success && <div style={styles.success}>{success}</div>}
          <button
            type="button"
            style={styles.dangerButton}
            onClick={handleReset}
          >
            Отключить шифрование и удалить ключи
          </button>
        </>
      )}
    </div>
  );
}
