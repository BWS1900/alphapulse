// AlphaPulse — Watchlist Store
// Manages user watchlists and their assets

import { create } from 'zustand';
import { api, type Watchlist, type Asset } from '../services/api';

interface WatchlistState {
  watchlists: Watchlist[];
  activeWatchlistId: string | null;
  isLoading: boolean;
  error: string | null;

  loadWatchlists: () => Promise<void>;
  createWatchlist: (name: string) => Promise<void>;
  updateWatchlist: (id: string, data: Partial<Watchlist>) => Promise<void>;
  deleteWatchlist: (id: string) => Promise<void>;
  addAsset: (watchlistId: string, symbol: string) => Promise<void>;
  removeAsset: (watchlistId: string, symbol: string) => Promise<void>;
  setActiveWatchlist: (id: string | null) => void;
  getActiveWatchlist: () => Watchlist | undefined;
  clearError: () => void;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlists: [],
  activeWatchlistId: null,
  isLoading: false,
  error: null,

  loadWatchlists: async () => {
    set({ isLoading: true, error: null });
    try {
      const watchlists = await api.getWatchlists();
      set({ watchlists, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Failed to load watchlists',
      });
    }
  },

  createWatchlist: async (name: string) => {
    try {
      const watchlist = await api.createWatchlist(name);
      set((state) => ({
        watchlists: [...state.watchlists, watchlist],
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to create watchlist' });
    }
  },

  updateWatchlist: async (id: string, data: Partial<Watchlist>) => {
    try {
      const updated = await api.updateWatchlist(id, data);
      set((state) => ({
        watchlists: state.watchlists.map((w) =>
          w.id === id ? { ...w, ...updated } : w
        ),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update watchlist' });
    }
  },

  deleteWatchlist: async (id: string) => {
    try {
      await api.deleteWatchlist(id);
      set((state) => ({
        watchlists: state.watchlists.filter((w) => w.id !== id),
        activeWatchlistId:
          state.activeWatchlistId === id ? null : state.activeWatchlistId,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete watchlist' });
    }
  },

  addAsset: async (watchlistId: string, symbol: string) => {
    try {
      const updated = await api.addToWatchlist(watchlistId, symbol);
      set((state) => ({
        watchlists: state.watchlists.map((w) =>
          w.id === watchlistId ? updated : w
        ),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to add asset' });
    }
  },

  removeAsset: async (watchlistId: string, symbol: string) => {
    try {
      const updated = await api.removeFromWatchlist(watchlistId, symbol);
      set((state) => ({
        watchlists: state.watchlists.map((w) =>
          w.id === watchlistId ? updated : w
        ),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to remove asset' });
    }
  },

  setActiveWatchlist: (id: string | null) => {
    set({ activeWatchlistId: id });
  },

  getActiveWatchlist: () => {
    const { watchlists, activeWatchlistId } = get();
    return watchlists.find((w) => w.id === activeWatchlistId);
  },

  clearError: () => set({ error: null }),
}));