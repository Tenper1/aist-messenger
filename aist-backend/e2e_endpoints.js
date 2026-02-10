// ——— E2E Encryption API ———
// Добавьте этот код в server.js ПЕРЕД app.listen(...)

// Получить публичный ключ пользователя
app.get('/api/users/:userId/public-key', auth, async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT public_key FROM users WHERE id = $1',
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ publicKey: rows[0].public_key || null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get public key' });
  }
});

// Сохранить свой публичный ключ
app.post('/api/profile/public-key', auth, async (req, res) => {
  const { publicKey } = req.body;
  if (!publicKey || typeof publicKey !== 'string') {
    return res.status(400).json({ error: 'publicKey required' });
  }
  try {
    await pool.query(
      'UPDATE users SET public_key = $1, updated_at = NOW() WHERE id = $2',
      [publicKey, req.userId]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to save public key' });
  }
});
