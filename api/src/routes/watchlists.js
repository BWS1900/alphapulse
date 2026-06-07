const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const SYMBOL_REGEX = /^[a-zA-Z0-9]{1,10}$/;

function validateWatchlistName(name) {
  return typeof name === 'string' && name.trim().length >= 1 && name.length <= 50;
}

function validateSymbol(symbol) {
  return typeof symbol === 'string' && SYMBOL_REGEX.test(symbol);
}

function runAsync(query, params) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

function allAsync(query, params) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getAsync(query, params) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Get all watchlists
router.get('/', authMiddleware, async (req, res) => {
  try {
    const watchlists = await allAsync('SELECT * FROM watchlists WHERE user_id = ?', [req.userId]);

    const watchlistsWithAssets = await Promise.all(
      watchlists.map(async (wl) => {
        const assets = await allAsync('SELECT symbol FROM watchlist_assets WHERE watchlist_id = ?', [wl.id]);
        return {
          id: wl.id,
          name: wl.name,
          assets: assets.map(a => ({ symbol: a.symbol })),
          createdAt: wl.created_at,
          updatedAt: wl.updated_at
        };
      })
    );

    res.json(watchlistsWithAssets);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create watchlist
router.post('/', authMiddleware, (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Watchlist name is required' });
  }

  if (!validateWatchlistName(name)) {
    return res.status(400).json({ message: 'Watchlist name must be between 1 and 50 characters' });
  }

  const id = uuidv4();
  const createdAt = new Date().toISOString();

  db.run(
    'INSERT INTO watchlists (id, user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [id, req.userId, name.trim(), createdAt, createdAt],
    function(err) {
      if (err) return res.status(500).json({ message: 'Failed to create watchlist' });
      res.status(201).json({ id, name: name.trim(), assets: [], createdAt, updatedAt: createdAt });
    }
  );
});

// Update watchlist
router.patch('/:id', authMiddleware, (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Watchlist name is required' });
  }

  if (!validateWatchlistName(name)) {
    return res.status(400).json({ message: 'Watchlist name must be between 1 and 50 characters' });
  }

  const updatedAt = new Date().toISOString();

  db.run(
    'UPDATE watchlists SET name = ?, updated_at = ? WHERE id = ? AND user_id = ?',
    [name.trim(), updatedAt, req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (this.changes === 0) return res.status(404).json({ message: 'Watchlist not found' });
      res.json({ id: req.params.id, name: name.trim(), updatedAt });
    }
  );
});

// Delete watchlist
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const wl = await getAsync('SELECT id FROM watchlists WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (!wl) return res.status(404).json({ message: 'Watchlist not found' });

    await runAsync('DELETE FROM watchlist_assets WHERE watchlist_id = ?', [req.params.id]);
    await runAsync('DELETE FROM watchlists WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add asset to watchlist
router.post('/:id/assets', authMiddleware, (req, res) => {
  const { symbol } = req.body;

  if (!symbol) {
    return res.status(400).json({ message: 'Symbol is required' });
  }

  if (!validateSymbol(symbol)) {
    return res.status(400).json({ message: 'Invalid symbol format (1-10 alphanumeric characters)' });
  }

  db.get('SELECT id FROM watchlists WHERE id = ? AND user_id = ?', [req.params.id, req.userId], (err, wl) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!wl) return res.status(404).json({ message: 'Watchlist not found' });

    const id = uuidv4();
    db.run(
      'INSERT INTO watchlist_assets (id, watchlist_id, symbol) VALUES (?, ?, ?)',
      [id, req.params.id, symbol.toLowerCase()],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'Symbol already in watchlist' });
          }
          return res.status(500).json({ message: 'Failed to add asset' });
        }
        res.status(201).json({ symbol: symbol.toLowerCase() });
      }
    );
  });
});

// Remove asset from watchlist
router.delete('/:id/assets/:symbol', authMiddleware, (req, res) => {
  db.get('SELECT id FROM watchlists WHERE id = ? AND user_id = ?', [req.params.id, req.userId], (err, wl) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!wl) return res.status(404).json({ message: 'Watchlist not found' });

    db.run(
      'DELETE FROM watchlist_assets WHERE watchlist_id = ? AND symbol = ?',
      [req.params.id, req.params.symbol.toLowerCase()],
      function(err) {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.status(204).send();
      }
    );
  });
});

module.exports = router;
