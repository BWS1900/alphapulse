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

const http = require('http');
const { Server } = require('socket.io');
const marketService = require('./services/marketService');
const marketRoutes = require('./routes/marketdata');

const assetConfig = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', type: 'crypto' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', type: 'crypto' },
  { id: 'solana', symbol: 'sol', name: 'Solana', type: 'crypto' },
  { id: 'apple', symbol: 'aapl', name: 'Apple', type: 'stock' },
  { id: 'google', symbol: 'googl', name: 'Google', type: 'stock' },
  { id: 'tesla', symbol: 'tsla', name: 'Tesla', type: 'stock' }
];

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use('/api/v1', marketRoutes);

io.on('connection', (socket) => {
  const interval = setInterval(async () => {
    const updates = await marketService.getAllAssets(assetConfig);
    socket.emit('price_update', updates.map(u => ({ symbol: u.symbol, price: u.price })));
  }, 10000);
  socket.on('disconnect', () => clearInterval(interval));
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

server.listen(PORT, () => {
  console.log(`AlphaPulse Gateway running on port ${PORT}`);
});
