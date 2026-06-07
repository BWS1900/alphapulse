const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretpulse';

// Register
router.post('/register', async (req, res) => {
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
router.post('/login', (req, res) => {
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
router.get('/profile', authMiddleware, (req, res) => {
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

module.exports = router;
