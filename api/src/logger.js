// AlphaPulse — Structured Logger
// Simple structured logger with levels and timestamps

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function formatTimestamp() {
  return new Date().toISOString();
}

function formatMessage(level, message, meta = {}) {
  const timestamp = formatTimestamp();
  const metaStr = Object.keys(meta).length > 0 ? ' ' + JSON.stringify(meta) : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
}

function shouldLog(level) {
  return (LEVELS[level] || 0) <= (LEVELS[LOG_LEVEL] || 0);
}

const logger = {
  error(message, meta = {}) {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, meta));
    }
  },

  warn(message, meta = {}) {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, meta));
    }
  },

  info(message, meta = {}) {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message, meta));
    }
  },

  debug(message, meta = {}) {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', message, meta));
    }
  },

  // HTTP request logger middleware
  requestLogger(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const meta = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
      };

      if (res.statusCode >= 500) {
        logger.error('Request failed', meta);
      } else if (res.statusCode >= 400) {
        logger.warn('Request error', meta);
      } else {
        logger.info('Request completed', meta);
      }
    });

    next();
  },
};

module.exports = logger;
