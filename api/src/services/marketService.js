const axios = require('axios');
const NodeCache = require('node-cache');

// Cache market data for 1 minute (60 seconds)
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

class MarketService {
  constructor() {
    this.finnhubKey = process.env.FINNHUB_API_KEY;
  }

  async getCryptoPrice(id) {
    const cacheKey = `crypto_${id}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await axios.get(`${COINGECKO_BASE_URL}/simple/price`, {
        params: {
          ids: id,
          vs_currencies: 'usd',
          include_24hr_change: 'true'
        }
      });

      if (response.data[id]) {
        const data = {
          price: response.data[id].usd,
          change24h: response.data[id].usd_24h_change
        };
        cache.set(cacheKey, data);
        return data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching crypto price for ${id}:`, error.message);
      return null;
    }
  }

  async getStockPrice(symbol) {
    const cacheKey = `stock_${symbol}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    if (!this.finnhubKey) {
      // If no key, return mock data or fallback
      console.warn('FINNHUB_API_KEY not set. Using mock data for stocks.');
      const data = { price: Math.random() * 200 + 50, change24h: (Math.random() - 0.5) * 5 };
      cache.set(cacheKey, data);
      return data;
    }

    try {
      const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
        params: {
          symbol: symbol.toUpperCase(),
          token: this.finnhubKey
        }
      });

      if (response.data && response.data.c) {
        const data = {
          price: response.data.c,
          change24h: response.data.dp // dp is percent change
        };
        cache.set(cacheKey, data);
        return data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching stock price for ${symbol}:`, error.message);
      return null;
    }
  }

  async getCryptoPrices(ids) {
    const idsToFetch = ids.filter(id => !cache.get(`crypto_${id}`));
    
    if (idsToFetch.length > 0) {
      try {
        const response = await axios.get(`${COINGECKO_BASE_URL}/simple/price`, {
          params: {
            ids: idsToFetch.join(','),
            vs_currencies: 'usd',
            include_24hr_change: 'true'
          }
        });

        Object.keys(response.data).forEach(id => {
          const data = {
            price: response.data[id].usd,
            change24h: response.data[id].usd_24h_change
          };
          cache.set(`crypto_${id}`, data);
        });
      } catch (error) {
        console.error(`Error fetching crypto prices for ${idsToFetch.join(',')}:`, error.message);
        // Fallback to random data for demo if API fails
        idsToFetch.forEach(id => {
          const fallbackData = { price: Math.random() * 50000 + 1000, change24h: (Math.random() - 0.5) * 10 };
          cache.set(`crypto_${id}`, fallbackData, 10); // Cache for 10 seconds only on failure
        });
      }
    }

    return ids.map(id => cache.get(`crypto_${id}`) || null);
  }

  async getAllAssets(assetsList) {
    const cryptoAssets = assetsList.filter(a => a.type === 'crypto');
    const stockAssets = assetsList.filter(a => a.type === 'stock');

    const cryptoPrices = await this.getCryptoPrices(cryptoAssets.map(a => a.id));
    
    const stockResults = await Promise.all(stockAssets.map(async (asset) => {
      const data = await this.getStockPrice(asset.symbol);
      return {
        ...asset,
        price: data ? data.price : null,
        change24h: data ? data.change24h : null
      };
    }));

    const cryptoResults = cryptoAssets.map((asset, index) => {
      const data = cryptoPrices[index];
      return {
        ...asset,
        price: data ? data.price : null,
        change24h: data ? data.change24h : null
      };
    });

    return [...cryptoResults, ...stockResults];
  }

  async getHistory(symbol, type, range) {
    const cacheKey = `history_${symbol}_${range}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    let history = [];
    if (type === 'crypto') {
      // CoinGecko range is days
      let days = '1';
      if (range === '1w') days = '7';
      if (range === '1m') days = '30';
      if (range === '1y') days = '365';

      try {
        const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${symbol}/market_chart`, {
          params: {
            vs_currency: 'usd',
            days: days
          }
        });
        history = response.data.prices.map(p => ({ timestamp: p[0], price: p[1] }));
      } catch (error) {
        console.error(`Error fetching crypto history for ${symbol}:`, error.message);
        // Mock fallback
        history = this.generateMockHistory(range);
      }
    } else {
      // Finnhub or mock for stocks
      history = this.generateMockHistory(range);
    }

    cache.set(cacheKey, history, 300); // Cache history for 5 minutes
    return history;
  }

  generateMockHistory(range) {
    const history = [];
    const now = Date.now();
    let points = 24;
    let step = 3600000; // 1 hour

    if (range === '1w') { points = 7; step = 86400000; }
    if (range === '1m') { points = 30; step = 86400000; }
    if (range === '1y') { points = 12; step = 86400000 * 30; }

    let basePrice = 100 + Math.random() * 1000;
    for (let i = points; i >= 0; i--) {
      history.push({
        timestamp: now - (i * step),
        price: basePrice + (Math.random() - 0.5) * (basePrice * 0.1)
      });
    }
    return history;
  }
}

module.exports = new MarketService();
