// AlphaPulse — API Gateway
// Main entry point for the market data & user management API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { setupDatabase, db } = require('./database');
const logger = require('./logger');

if (!process.env.JWT_SECRET) {
  logger.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:8081', 'http://localhost:19006'];

// HTTPS enforcement in production
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https' && !req.secure) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Request logger
app.use(logger.requestLogger);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', limiter);

// Routes
const authRoutes = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlists');
const alertRoutes = require('./routes/alerts');
const assetRoutes = require('./routes/assets');
const subscriptionRoutes = require('./routes/subscription');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/watchlists', watchlistRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, _next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({ message: 'Internal server error' });
});

// Initialize Database then start server
let server;
setupDatabase()
  .then(() => {
    logger.info('Database initialized successfully');
    server = app.listen(PORT, () => {
      logger.info(`AlphaPulse Gateway running on port ${PORT}`, { env: NODE_ENV });
    });
  })
  .catch(err => {
    logger.error('Failed to initialize database', { error: err.message });
    process.exit(1);
  });

// Graceful shutdown
function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');

      db.close((err) => {
        if (err) {
          logger.error('Error closing database', { error: err.message });
        } else {
          logger.info('Database connection closed');
        }
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }

  // Force exit after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message, stack: err.stack });
  shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});
