// AlphaPulse — Database Initialization
// Sets up SQLite for user data, watchlists, and alerts

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../alphapulse.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  db.run('PRAGMA foreign_keys = ON');
});

const setupDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('PRAGMA foreign_keys = ON');

      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          plan TEXT DEFAULT 'free',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Watchlists table (supports multiple watchlists per user)
      db.run(`
        CREATE TABLE IF NOT EXISTS watchlists (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Watchlist Assets (linking symbols to watchlists)
      db.run(`
        CREATE TABLE IF NOT EXISTS watchlist_assets (
          id TEXT PRIMARY KEY,
          watchlist_id TEXT NOT NULL,
          symbol TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(watchlist_id) REFERENCES watchlists(id) ON DELETE CASCADE,
          UNIQUE(watchlist_id, symbol)
        )
      `);

      // Alerts table
      db.run(`
        CREATE TABLE IF NOT EXISTS alerts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          symbol TEXT NOT NULL,
          type TEXT NOT NULL,
          value REAL NOT NULL,
          enabled INTEGER DEFAULT 1,
          triggered INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

module.exports = {
  db,
  setupDatabase
};
