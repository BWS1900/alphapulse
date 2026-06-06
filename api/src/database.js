// AlphaPulse — Database Initialization
// Sets up SQLite for user data, watchlists, and alerts

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../alphapulse.db');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        plan TEXT DEFAULT 'free',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Watchlists table (supports multiple watchlists per user)
    db.run(`
      CREATE TABLE IF NOT EXISTS watchlists (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // Watchlist Assets (linking symbols to watchlists)
    db.run(`
      CREATE TABLE IF NOT EXISTS watchlist_assets (
        id TEXT PRIMARY KEY,
        watchlist_id TEXT,
        symbol TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(watchlist_id) REFERENCES watchlists(id),
        UNIQUE(watchlist_id, symbol)
      )
    `);

    // Alerts table
    db.run(`
      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        symbol TEXT,
        type TEXT, -- 'price_above', 'price_below', 'percent_change', 'news_sentiment'
        value REAL,
        enabled INTEGER DEFAULT 1,
        triggered INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);
  });
};

module.exports = {
  db,
  initDb
};
