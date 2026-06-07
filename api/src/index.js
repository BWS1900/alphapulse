// AlphaPulse — API Gateway
// Main entry point for the market data & user management API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { setupDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database
setupDatabase().then(() => {
  console.log('Database initialized successfully');
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', limiter);

// Routes
const authRoutes = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlists');
const alertRoutes = require('./routes/alerts');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/watchlists', watchlistRoutes);
app.use('/api/v1/alerts', alertRoutes);

// --- Market Data (Existing) ---
app.get('/api/v1/assets', (req, res) => {
  // Placeholder
  res.json([]);
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`AlphaPulse Gateway running on port ${PORT}`);
});
