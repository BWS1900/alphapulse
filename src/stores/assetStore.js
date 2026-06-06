// AlphaPulse — Asset Store
// Manages market data for stocks and crypto

import { create } from 'zustand';
import { api, type Asset, type AssetDetail, type PriceHistory } from '../services/api';

interface AssetState {
  assets: Asset[];
  selectedAsset: AssetDetail | null;
  priceHistory: PriceHistory | null;
  searchResults: Asset[];
  isLoading: boolean;
  isLoadingHistory: boolean;
  error: string | null;

  loadAssets: (type?: 'stock' | 'crypto') => Promise<void>;
  searchAssets: (query: string) => Promise<void>;
  selectAsset: (symbol: string) => Promise<void>;
  loadPriceHistory: (symbol: string, interval?: string, range?: string) => Promise<void>;
  clearSearch: () => void;
  clearSelected: () => void;
}

export const useAssetStore = create<AssetState>((set) => ({
  assets: [],
  selectedAsset: null,
  priceHistory: null,
  searchResults: [],
  isLoading: false,
  isLoadingHistory: false,
  error: null,

  loadAssets: async (type?: 'stock' | 'crypto') => {
    set({ isLoading: true, error: null });
    try {
      const assets = await api.getAssets(type);
      set({ assets, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Failed to load assets',
      });
    }
  },

  searchAssets: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    set({ isLoading: true });
    try {
      const results = await api.searchAssets(query);
      set({ searchResults: results, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  selectAsset: async (symbol: string) => {
    set({ isLoading: true, error: null });
    try {
      const detail = await api.getAssetDetail(symbol);
      set({ selectedAsset: detail, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Failed to load asset details',
      });
    }
  },

  loadPriceHistory: async (symbol: string, interval = '1d', range = '1m') => {
    set({ isLoadingHistory: true });
    try {
      const history = await api.getAssetHistory(symbol, interval, range);
      set({ priceHistory: history, isLoadingHistory: false });
    } catch (err: any) {
      set({
        isLoadingHistory: false,
        error: err.message || 'Failed to load price history',
      });
    }
  },

  clearSearch: () => set({ searchResults: [] }),
  clearSelected: () => set({ selectedAsset: null, priceHistory: null }),
}));