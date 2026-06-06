// AlphaPulse — Alert Store
// Manages price and sentiment alerts

import { create } from 'zustand';
import { api, type Alert, type CreateAlertInput } from '../services/api';

interface AlertState {
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;

  loadAlerts: () => Promise<void>;
  createAlert: (data: CreateAlertInput) => Promise<void>;
  updateAlert: (id: string, data: Partial<Alert>) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  toggleAlert: (id: string, enabled: boolean) => Promise<void>;
  clearError: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  isLoading: false,
  error: null,

  loadAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await api.getAlerts();
      set({ alerts, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Failed to load alerts',
      });
    }
  },

  createAlert: async (data: CreateAlertInput) => {
    try {
      const alert = await api.createAlert(data);
      set((state) => ({ alerts: [...state.alerts, alert] }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to create alert' });
    }
  },

  updateAlert: async (id: string, data: Partial<Alert>) => {
    try {
      const updated = await api.updateAlert(id, data);
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === id ? updated : a)),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update alert' });
    }
  },

  deleteAlert: async (id: string) => {
    try {
      await api.deleteAlert(id);
      set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete alert' });
    }
  },

  toggleAlert: async (id: string, enabled: boolean) => {
    try {
      const updated = await api.updateAlert(id, { enabled } as Partial<Alert>);
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === id ? updated : a)),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to toggle alert' });
    }
  },

  clearError: () => set({ error: null }),
}));