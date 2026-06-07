const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

// Get alerts
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM alerts WHERE user_id = ?', [req.userId], (err, alerts) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(alerts.map(a => ({
      id: a.id,
      symbol: a.symbol,
      type: a.type,
      value: a.value,
      enabled: !!a.enabled,
      triggered: !!a.triggered,
      createdAt: a.created_at
    })));
  });
});

// Create alert
router.post('/', authMiddleware, (req, res) => {
  const { symbol, type, value } = req.body;
  if (!symbol || !type || value === undefined) {
    return res.status(400).json({ message: 'Symbol, type, and value are required' });
  }

  const id = uuidv4();
  const createdAt = new Date().toISOString();

  db.run(
    'INSERT INTO alerts (id, user_id, symbol, type, value, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, req.userId, symbol.toLowerCase(), type, value, createdAt],
    function(err) {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.status(201).json({ id, symbol, type, value, enabled: true, triggered: false, createdAt });
    }
  );
});

// Update alert
router.patch('/:id', authMiddleware, (req, res) => {
  const { enabled, value, type } = req.body;
  
  if (enabled === undefined && value === undefined && type === undefined) {
    return res.status(400).json({ message: 'At least one field (enabled, value, type) must be provided' });
  }

  let query = 'UPDATE alerts SET ';
  const params = [];
  if (enabled !== undefined) {
    query += 'enabled = ?, ';
    params.push(enabled ? 1 : 0);
  }
  if (value !== undefined) {
    query += 'value = ?, ';
    params.push(value);
  }
  if (type !== undefined) {
    query += 'type = ?, ';
    params.push(type);
  }
  
  query = query.slice(0, -2); // Remove last comma
  query += ' WHERE id = ? AND user_id = ?';
  params.push(req.params.id, req.userId);

  db.run(query, params, function(err) {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ message: 'Alert not found' });
    res.json({ id: req.params.id, ...req.body });
  });
});

// Delete alert
router.delete('/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM alerts WHERE id = ? AND user_id = ?', [req.params.id, req.userId], function(err) {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ message: 'Alert not found' });
    res.status(204).send();
  });
});

module.exports = router;
