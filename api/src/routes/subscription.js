const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const VALID_PLANS = ['free', 'premium'];

const PLAN_FEATURES = {
  free: [
    'Basic market data',
    '1 watchlist',
    '3 alerts',
    'Daily summary',
  ],
  premium: [
    'Real-time market data',
    'Unlimited watchlists',
    'Unlimited alerts',
    'Sentiment analysis',
    'On-chain metrics',
    'Priority support',
  ],
};

// Get subscription status
router.get('/', authMiddleware, (req, res) => {
  db.get('SELECT plan FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const plan = user.plan || 'free';
    res.json({
      plan,
      expiresAt: plan === 'premium' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      features: PLAN_FEATURES[plan] || PLAN_FEATURES.free,
    });
  });
});

// Update subscription
router.put('/', authMiddleware, (req, res) => {
  const { plan } = req.body;

  if (!plan) {
    return res.status(400).json({ message: 'Plan is required' });
  }

  if (!VALID_PLANS.includes(plan)) {
    return res.status(400).json({ message: `Invalid plan. Must be one of: ${VALID_PLANS.join(', ')}` });
  }

  db.run(
    'UPDATE users SET plan = ? WHERE id = ?',
    [plan, req.userId],
    function(err) {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (this.changes === 0) return res.status(404).json({ message: 'User not found' });

      res.json({
        plan,
        expiresAt: plan === 'premium' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        features: PLAN_FEATURES[plan] || PLAN_FEATURES.free,
      });
    }
  );
});

module.exports = router;
