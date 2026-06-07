const express = require('express');
const router = express.Router();
const axios = require('axios');
const marketService = require('../services/marketService');
const { authMiddleware } = require('../middleware/auth');

const SENTIMENT_SERVICE_URL = process.env.SENTIMENT_SERVICE_URL || 'http://localhost:8000';
const ONCHAIN_SERVICE_URL = process.env.ONCHAIN_SERVICE_URL || 'http://localhost:8001';

// Well-known assets for demo purposes
const KNOWN_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', coingeckoId: 'bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', coingeckoId: 'ethereum' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto', coingeckoId: 'solana' },
  { symbol: 'DOGE', name: 'Dogecoin', type: 'crypto', coingeckoId: 'dogecoin' },
  { symbol: 'ADA', name: 'Cardano', type: 'crypto', coingeckoId: 'cardano' },
  { symbol: 'XRP', name: 'Ripple', type: 'crypto', coingeckoId: 'ripple' },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock' },
];

// Get all assets
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let assets = KNOWN_ASSETS;

    if (type) {
      assets = assets.filter(a => a.type === type);
    }

    // Fetch prices for all assets
    const assetsWithPrices = await Promise.all(
      assets.map(async (asset) => {
        try {
          let priceData;
          if (asset.type === 'crypto') {
            priceData = await marketService.getCryptoPrice(asset.coingeckoId);
          } else {
            priceData = await marketService.getStockPrice(asset.symbol);
          }

          return {
            symbol: asset.symbol,
            name: asset.name,
            type: asset.type,
            price: priceData?.price ?? null,
            change: priceData?.change24h ?? 0,
            changePercent: priceData?.change24h ?? 0,
            marketCap: null,
            volume: null,
          };
        } catch (err) {
          return {
            symbol: asset.symbol,
            name: asset.name,
            type: asset.type,
            price: null,
            change: 0,
            changePercent: 0,
            marketCap: null,
            volume: null,
          };
        }
      })
    );

    res.json(assetsWithPrices);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search assets
router.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  const query = q.toLowerCase();
  const results = KNOWN_ASSETS.filter(
    a => a.symbol.toLowerCase().includes(query) || a.name.toLowerCase().includes(query)
  ).map(a => ({
    symbol: a.symbol,
    name: a.name,
    type: a.type,
    price: null,
    change: 0,
    changePercent: 0,
  }));

  res.json(results);
});

// Get asset detail
router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const asset = KNOWN_ASSETS.find(a => a.symbol === symbol);

    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    let priceData;
    if (asset.type === 'crypto') {
      priceData = await marketService.getCryptoPrice(asset.coingeckoId);
    } else {
      priceData = await marketService.getStockPrice(asset.symbol);
    }

    res.json({
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      price: priceData?.price ?? null,
      change: priceData?.change24h ?? 0,
      changePercent: priceData?.change24h ?? 0,
      high24h: null,
      low24h: null,
      open24h: null,
      volume24h: null,
      description: `${asset.name} (${asset.symbol})`,
      sector: asset.type === 'stock' ? 'Technology' : undefined,
      sparkline: null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get asset price
router.get('/:symbol/price', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const asset = KNOWN_ASSETS.find(a => a.symbol === symbol);

    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    let priceData;
    if (asset.type === 'crypto') {
      priceData = await marketService.getCryptoPrice(asset.coingeckoId);
    } else {
      priceData = await marketService.getStockPrice(asset.symbol);
    }

    res.json({
      symbol: asset.symbol,
      price: priceData?.price ?? null,
      timestamp: new Date().toISOString(),
      change: priceData?.change24h ?? 0,
      changePercent: priceData?.change24h ?? 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get asset price history
router.get('/:symbol/history', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const { interval = '1d', range = '1m' } = req.query;
    const asset = KNOWN_ASSETS.find(a => a.symbol === symbol);

    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    const history = await marketService.getHistory(
      asset.type === 'crypto' ? asset.coingeckoId : asset.symbol,
      asset.type,
      range
    );

    res.json({
      symbol: asset.symbol,
      interval,
      data: history.map(h => ({
        timestamp: typeof h.timestamp === 'number'
          ? new Date(h.timestamp).toISOString()
          : h.timestamp,
        open: h.price,
        high: h.price * 1.01,
        low: h.price * 0.99,
        close: h.price,
        volume: null,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sentiment data (proxy to sentiment service)
router.get('/:symbol/sentiment', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const response = await axios.get(`${SENTIMENT_SERVICE_URL}/sentiment/${symbol}`, {
      timeout: 5000,
    });
    res.json(response.data);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: 'Sentiment data not available' });
    }
    res.status(502).json({ message: 'Sentiment service unavailable' });
  }
});

// Get on-chain data (proxy to onchain service)
router.get('/:symbol/onchain', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const response = await axios.get(`${ONCHAIN_SERVICE_URL}/onchain/${symbol}`, {
      timeout: 5000,
    });
    res.json(response.data);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: 'On-chain data not available' });
    }
    res.status(502).json({ message: 'On-chain service unavailable' });
  }
});

module.exports = router;
