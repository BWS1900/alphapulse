const express = require('express');
const router = express.Router();
const marketService = require('../services/marketService');

const assetConfig = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', type: 'crypto' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', type: 'crypto' },
  { id: 'solana', symbol: 'sol', name: 'Solana', type: 'crypto' },
  { id: 'apple', symbol: 'aapl', name: 'Apple', type: 'stock' },
  { id: 'google', symbol: 'googl', name: 'Google', type: 'stock' },
  { id: 'tesla', symbol: 'tsla', name: 'Tesla', type: 'stock' }
];

router.get('/assets', async (req, res) => {
  const assets = await marketService.getAllAssets(assetConfig);
  res.json(assets);
});

router.get('/assets/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toLowerCase();
  const config = assetConfig.find(a => a.symbol === symbol);
  if (!config) return res.status(404).json({ error: 'Asset not found' });
  const priceData = config.type === 'crypto' 
    ? await marketService.getCryptoPrice(config.id) 
    : await marketService.getStockPrice(config.symbol);
  res.json({ ...config, price: priceData?.price, change24h: priceData?.change24h });
});

module.exports = router;
