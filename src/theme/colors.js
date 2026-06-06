// AlphaPulse — Color System
// Dark-mode-first finance app palette

export const colors = {
  // Brand
  primary: '#00F5A0',
  primaryDark: '#00C483',
  primaryLight: '#33FFB8',

  accent: '#7C3AED',
  accentDark: '#5B21B6',
  accentLight: '#A78BFA',

  // Backgrounds
  bg: '#0D111C',
  bgSurface: '#161B2E',
  bgCard: '#1C2336',
  bgElevated: '#242B42',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textOnPrimary: '#0D111C',

  // Market sentiment
  bullish: '#00F5A0',
  bearish: '#FF3366',
  neutral: '#F59E0B',

  // Status
  success: '#00F5A0',
  warning: '#F59E0B',
  error: '#FF3366',
  info: '#3B82F6',

  // Borders & Dividers
  border: '#2A3248',
  borderLight: '#374151',
  divider: '#1F2937',

  // Chart colors
  chartLine: '#00F5A0',
  chartCandleUp: '#00F5A0',
  chartCandleDown: '#FF3366',
  chartGrid: '#1F2937',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  shimmer: '#1C2336',
};

export const colorTokens = {
  light: {
    bg: '#FFFFFF',
    bgSurface: '#F9FAFB',
    bgCard: '#F3F4F6',
    bgElevated: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    divider: '#E5E7EB',
  },
  dark: {
    bg: '#0D111C',
    bgSurface: '#161B2E',
    bgCard: '#1C2336',
    bgElevated: '#242B42',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: '#2A3248',
    borderLight: '#374151',
    divider: '#1F2937',
  },
};
