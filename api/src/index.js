// AlphaPulse — API Gateway
// Main entry point for the market data & user management API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db, initDb } = require('./database');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'alphapulse_secret_key';

// Initialize Database
initDb();

app.use(cors());
app.use(express.json());

// --- Auth Endpoints ---

// Register
app.post('/api/v1/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const plan = 'free';
    const createdAt = new Date().toISOString();

    db.run(
      'INSERT INTO users (id, email, password, name, plan, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, name, plan, createdAt],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Email already exists' });
          }
          return res.status(500).json({ message: 'Database error', error: err.message });
        }

        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({
          token,
          user: { id: userId, email, name, plan, createdAt }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        createdAt: user.created_at
      }
    });
  });
});

// Profile
app.get('/api/v1/auth/profile', authMiddleware, (req, res) => {
  db.get('SELECT id, email, name, plan, created_at FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      createdAt: user.created_at
    });
  });
});

// --- Watchlist Endpoints ---

// Get all watchlists
app.get('/api/v1/watchlists', authMiddleware, (req, res) => {
  db.all('SELECT * FROM watchlists WHERE user_id = ?', [req.userId], (err, watchlists) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    // For each watchlist, get its assets
    const watchlistsWithAssets = [];
    if (watchlists.length === 0) return res.json([]);

    let completed = 0;
    watchlists.forEach(wl => {
      db.all('SELECT symbol FROM watchlist_assets WHERE watchlist_id = ?', [wl.id], (err, assets) => {
        watchlistsWithAssets.push({
          id: wl.id,
          name: wl.name,
          assets: assets.map(a => ({ symbol: a.symbol })), // In a real app, you'd join with market data
          createdAt: wl.created_at,
          updatedAt: wl.updated_at
        });

        completed++;
        if (completed === watchlists.length) {
          res.json(watchlistsWithAssets);
        }
      });
    });
  });
});

// Create watchlist
app.post('/api/v1/watchlists', authMiddleware, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Watchlist name is required' });

  const id = uuidv4();
  const createdAt = new Date().toISOString();

  db.run(
    'INSERT INTO watchlists (id, user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [id, req.userId, name, createdAt, createdAt],
    function(err) {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.status(201).json({ id, name, assets: [], createdAt, updatedAt: createdAt });
    }
  );
});

// Update watchlist
app.patch('/api/v1/watchlists/:id', authMiddleware, (req, res) => {
  const { name } = req.body;
  const updatedAt = new Date().toISOString();

  db.run(
    'UPDATE watchlists SET name = ?, updated_at = ? WHERE id = ? AND user_id = ?',
    [name, updatedAt, req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ message: 'Watchlist not found' });
      res.json({ id: req.params.id, name, updatedAt });
    }
  );
});

// Delete watchlist
app.delete('/api/v1/watchlists/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM watchlists WHERE id = ? AND user_id = ?', [req.params.id, req.userId], function(err) {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ message: 'Watchlist not found' });
    
    // Clean up assets
    db.run('DELETE FROM watchlist_assets WHERE watchlist_id = ?', [req.params.id]);
    res.status(204).send();
  });
});

// Add asset to watchlist
app.post('/api/v1/watchlists/:id/assets', authMiddleware, (req, res) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ message: 'Symbol is required' });

  // Verify ownership
  db.get('SELECT id FROM watchlists WHERE id = ? AND user_id = ?', [req.params.id, req.userId], (err, wl) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!wl) return res.status(404).json({ message: 'Watchlist not found' });

    const id = uuidv4();
    db.run(
      'INSERT INTO watchlist_assets (id, watchlist_id, symbol) VALUES (?, ?, ?)',
      [id, req.params.id, symbol.toLowerCase()],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Symbol already in watchlist' });
          }
          return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({ symbol: symbol.toLowerCase() });
      }
    );
  });
});

// Remove asset from watchlist
app.delete('/api/v1/watchlists/:id/assets/:symbol', authMiddleware, (req, res) => {
  // Verify ownership
  db.get('SELECT id FROM watchlists WHERE id = ? AND user_id = ?', [req.params.id, req.userId], (err, wl) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!wl) return res.status(404).json({ message: 'Watchlist not found' });

    db.run(
      'DELETE FROM watchlist_assets WHERE watchlist_id = ? AND symbol = ?',
      [req.params.id, req.params.symbol.toLowerCase()],
      function(err) {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.status(204).send();
      }
    );
  });
});

// --- Alert Endpoints ---

// Get alerts
app.get('/api/v1/alerts', authMiddleware, (req, res) => {
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
app.post('/api/v1/alerts', authMiddleware, (req, res) => {
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
app.patch('/api/v1/alerts/:id', authMiddleware, (req, res) => {
  const { enabled, value, type } = req.body;
  
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
app.delete('/api/v1/alerts/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM alerts WHERE id = ? AND user_id = ?', [req.params.id, req.userId], function(err) {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ message: 'Alert not found' });
    res.status(204).send();
  });
});

// --- Market Data (Existing) ---
// Note: These would usually be in separate route files

app.get('/api/v1/assets', (req, res) => {
  // Placeholder
  res.json([]);
});

app.listen(PORT, () => {
  console.log(`AlphaPulse Gateway running on port ${PORT}`);
});
