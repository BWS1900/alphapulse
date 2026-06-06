// AlphaPulse — Settings Store
// Manages app preferences and subscription state

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, type Subscription } from '../services/api';

interface SettingsState {
  // Preferences
  theme: 'dark' | 'light';
  defaultInterval: string;
  defaultRange: string;
  showChangePercent: boolean;
  hapticFeedback: boolean;
  notificationsEnabled: boolean;

  // Subscription
  subscription: Subscription | null;

  // UI State
  hasOnboarded: boolean;
  isLoading: boolean;

  // Actions
  setTheme: (theme: 'dark' | 'light') => Promise<void>;
  setDefaultInterval: (interval: string) => void;
  setDefaultRange: (range: string) => void;
  setShowChangePercent: (show: boolean) => void;
  setHapticFeedback: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  loadSettings: () => Promise<void>;
  loadSubscription: () => Promise<void>;
  setHasOnboarded: () => Promise<void>;
}

const SETTINGS_KEY = '@alphapulse_settings';

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'dark',
  defaultInterval: '1d',
  defaultRange: '1m',
  showChangePercent: true,
  hapticFeedback: true,
  notificationsEnabled: true,
  subscription: null,
  hasOnboarded: false,
  isLoading: false,

  setTheme: async (theme: 'dark' | 'light') => {
    set({ theme });
    const settings = await AsyncStorage.getItem(SETTINGS_KEY).then(JSON.parse).catch(() => ({}));
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, theme }));
  },

  setDefaultInterval: (interval: string) => set({ defaultInterval: interval }),
  setDefaultRange: (range: string) => set({ defaultRange: range }),
  setShowChangePercent: (show: boolean) => set({ showChangePercent: show }),
  setHapticFeedback: (enabled: boolean) => set({ hapticFeedback: enabled }),
  setNotificationsEnabled: (enabled: boolean) => set({ notificationsEnabled: enabled }),

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ ...parsed });
      }
    } catch {
      // use defaults
    }
  },

  loadSubscription: async () => {
    try {
      const subscription = await api.getSubscription();
      set({ subscription });
    } catch {
      set({ subscription: { plan: 'free', features: ['basic_watchlist', 'delayed_data'] } });
    }
  },

  setHasOnboarded: async () => {
    await AsyncStorage.setItem('@alphapulse_onboarded', 'true');
    set({ hasOnboarded: true });
  },
}));