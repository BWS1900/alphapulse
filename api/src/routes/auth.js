const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const blacklist = require('../blacklist');
const logger = require('../logger');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_SECRET = process.env.JWT_SECRET;

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { message: 'Too many authentication attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_PLANS = ['free', 'pro', 'enterprise'];

function validateEmail(email) {
  return typeof email === 'string' && email.length <= 255 && EMAIL_REGEX.test(email);
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 128;
}

function validateName(name) {
  return typeof name === 'string' && name.trim().length >= 1 && name.length <= 100;
}

// Register
router.post('/register', authLimiter, async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ message: 'Password must be between 8 and 128 characters' });
  }

  if (!validateName(name)) {
    return res.status(400).json({ message: 'Name must be between 1 and 100 characters' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const plan = 'free';
    const createdAt = new Date().toISOString();

    db.run(
      'INSERT INTO users (id, email, password, name, plan, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email.toLowerCase().trim(), hashedPassword, name.trim(), plan, createdAt],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'Email already exists' });
          }
          logger.error('Failed to create user', { error: err.message });
          return res.status(500).json({ message: 'Failed to create account' });
        }

        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
        logger.info('User registered', { userId, email: email.toLowerCase().trim() });
        res.status(201).json({
          token,
          user: { id: userId, email: email.toLowerCase().trim(), name: name.trim(), plan, createdAt }
        });
      }
    );
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', authLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()], async (err, user) => {
    if (err) {
      logger.error('Login query error', { error: err.message });
      return res.status(500).json({ message: 'Server error' });
    }
    if (!user) {
      logger.warn('Login attempt with non-existent email', { email: email.toLowerCase().trim() });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Login attempt with wrong password', { userId: user.id });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    logger.info('User logged in', { userId: user.id });
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

// Logout
router.post('/logout', authMiddleware, (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (token) {
    // Decode token to get expiry
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
      blacklist.add(token, decoded.exp ? new Date(decoded.exp * 1000) : undefined);
      logger.info('User logged out', { userId: req.userId });
    } catch (err) {
      // Token invalid but still clear the session
    }
  }

  res.json({ message: 'Logged out successfully' });
});

// Profile
router.get('/profile', authMiddleware, (req, res) => {
  db.get('SELECT id, email, name, plan, created_at FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) {
      logger.error('Profile query error', { error: err.message });
      return res.status(500).json({ message: 'Server error' });
    }
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

module.exports = router;
