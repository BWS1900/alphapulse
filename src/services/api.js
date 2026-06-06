// AlphaPulse — API Service Layer
// Centralized API client for market data, auth, and other endpoints

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  requiresAuth?: boolean;
};

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', headers = {}, body, requiresAuth = true } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (requiresAuth && this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new ApiError(response.status, error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      requiresAuth: false,
    });
  }

  async register(email: string, password: string, name: string) {
    return this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
      requiresAuth: false,
    });
  }

  async getProfile() {
    return this.request<User>('/auth/profile');
  }

  // Assets (stocks & crypto)
  async getAssets(type?: 'stock' | 'crypto') {
    const params = type ? `?type=${type}` : '';
    return this.request<Asset[]>(`/assets${params}`);
  }

  async searchAssets(query: string) {
    return this.request<Asset[]>(`/assets/search?q=${encodeURIComponent(query)}`);
  }

  async getAssetDetail(symbol: string) {
    return this.request<AssetDetail>(`/assets/${symbol}`);
  }

  async getAssetPrice(symbol: string) {
    return this.request<PriceData>(`/assets/${symbol}/price`);
  }

  async getAssetHistory(symbol: string, interval: string = '1d', range: string = '1m') {
    return this.request<PriceHistory>(`/assets/${symbol}/history?interval=${interval}&range=${range}`);
  }

  // Watchlists
  async getWatchlists() {
    return this.request<Watchlist[]>('/watchlists');
  }

  async createWatchlist(name: string) {
    return this.request<Watchlist>('/watchlists', {
      method: 'POST',
      body: { name },
    });
  }

  async updateWatchlist(id: string, data: Partial<Watchlist>) {
    return this.request<Watchlist>(`/watchlists/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteWatchlist(id: string) {
    return this.request<void>(`/watchlists/${id}`, {
      method: 'DELETE',
    });
  }

  async addToWatchlist(watchlistId: string, symbol: string) {
    return this.request<Watchlist>(`/watchlists/${watchlistId}/assets`, {
      method: 'POST',
      body: { symbol },
    });
  }

  async removeFromWatchlist(watchlistId: string, symbol: string) {
    return this.request<Watchlist>(`/watchlists/${watchlistId}/assets/${symbol}`, {
      method: 'DELETE',
    });
  }

  // Alerts
  async getAlerts() {
    return this.request<Alert[]>('/alerts');
  }

  async createAlert(data: CreateAlertInput) {
    return this.request<Alert>('/alerts', {
      method: 'POST',
      body: data,
    });
  }

  async updateAlert(id: string, data: Partial<Alert>) {
    return this.request<Alert>(`/alerts/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteAlert(id: string) {
    return this.request<void>(`/alerts/${id}`, {
      method: 'DELETE',
    });
  }

  // Sentiment & On-chain
  async getSentiment(symbol: string) {
    return this.request<SentimentData>(`/assets/${symbol}/sentiment`);
  }

  async getOnChainMetrics(symbol: string) {
    return this.request<OnChainData>(`/assets/${symbol}/onchain`);
  }

  // Subscription
  async getSubscription() {
    return this.request<Subscription>('/subscription');
  }

  async updateSubscription(plan: 'free' | 'premium') {
    return this.request<Subscription>('/subscription', {
      method: 'PUT',
      body: { plan },
    });
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Types

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'premium';
  createdAt: string;
}

export interface Asset {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume?: number;
}

export interface AssetDetail extends Asset {
  high24h: number;
  low24h: number;
  open24h: number;
  volume24h: number;
  description?: string;
  sector?: string;
  sparkline?: number[];
}

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: string;
  change: number;
  changePercent: number;
}

export interface PriceHistory {
  symbol: string;
  interval: string;
  data: Array<{
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }>;
}

export interface Watchlist {
  id: string;
  name: string;
  assets: Asset[];
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  symbol: string;
  type: 'price_above' | 'price_below' | 'percent_change' | 'news_sentiment';
  value: number;
  enabled: boolean;
  triggered: boolean;
  createdAt: string;
}

export interface CreateAlertInput {
  symbol: string;
  type: Alert['type'];
  value: number;
}

export interface SentimentData {
  symbol: string;
  overall: 'bullish' | 'bearish' | 'neutral';
  score: number;
  newsCount: number;
  tweets?: number;
  lastUpdated: string;
}

export interface OnChainData {
  symbol: string;
  activeAddresses?: number;
  transactionCount?: number;
  networkHashrate?: string;
  totalSupply?: string;
  stakedPercentage?: number;
}

export interface Subscription {
  plan: 'free' | 'premium';
  expiresAt?: string;
  features: string[];
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);
export default api;