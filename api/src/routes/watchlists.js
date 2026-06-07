const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

// Get all watchlists
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM watchlists WHERE user_id = ?', [req.userId], (err, watchlists) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (watchlists.length === 0) return res.json([]);

    const watchlistsWithAssets = [];
    let completed = 0;
    watchlists.forEach(wl => {
      db.all('SELECT symbol FROM watchlist_assets WHERE watchlist_id = ?', [wl.id], (err, assets) => {
        watchlistsWithAssets.push({
          id: wl.id,
          name: wl.name,
          assets: assets.map(a => ({ symbol: a.symbol })),
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
router.post('/', authMiddleware, (req, res) => {
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
router.patch('/:id', authMiddleware, (req, res) => {
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
router.delete('/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM watchlists WHERE id = ? AND user_id = ?', [req.params.id, req.userId], function(err) {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ message: 'Watchlist not found' });
    
    // Clean up assets
    db.run('DELETE FROM watchlist_assets WHERE watchlist_id = ?', [req.params.id]);
    res.status(204).send();
  });
});

// Add asset to watchlist
router.post('/:id/assets', authMiddleware, (req, res) => {
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
router.delete('/:id/assets/:symbol', authMiddleware, (req, res) => {
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

module.exports = router;
