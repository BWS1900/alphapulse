// AlphaPulse — Color System
// Dark-mode-first finance app palette
// Per designer spec: deep obsidian bg, teal neon accent

export const colors = {
  // Brand
  primary: '#00F5D4',        // accent-primary (teal neon)
  primaryDark: '#00C4B0',
  primaryLight: '#33F7DD',

  accent: '#7000FF',         // accent-secondary (purple)
  accentDark: '#5B00CC',
  accentLight: '#9A4DFF',

  // Backgrounds (designer spec)
  bg: '#0D0E13',             // bg-primary (deep obsidian)
  bgSurface: '#14161E',      // bg-secondary (card/surface)
  bgCard: '#1C1E2A',         // bg-tertiary (elevated surfaces)
  bgElevated: '#252836',     // bg-hover

  // Text (designer spec)
  textPrimary: '#FFFFFF',
  textSecondary: '#8B8FA3',
  textMuted: '#5A5E72',
  textOnPrimary: '#0D0E13',
  textLink: '#00F5D4',

  // Market sentiment
  bullish: '#00C853',        // green-buy
  bearish: '#FF1744',        // red-sell
  neutral: '#FFD600',        // yellow-warn

  // Status
  success: '#00C853',
  warning: '#FFD600',
  error: '#FF1744',
  info: '#2979FF',           // blue-info

  // Borders & Dividers (designer spec: rgba white at low opacity)
  border: 'rgba(255, 255, 255, 0.06)',
  borderLight: 'rgba(255, 255, 255, 0.1)',
  divider: 'rgba(255, 255, 255, 0.06)',

  // Chart colors (designer spec)
  chartLine: '#00F5D4',
  chartFill: 'rgba(0, 245, 212, 0.08)',
  chartGrid: 'rgba(255, 255, 255, 0.06)',

  chartCandleUp: '#00C853',
  chartCandleDown: '#FF1744',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  shimmer: '#1C1E2A',
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
    bg: '#0D0E13',
    bgSurface: '#14161E',
    bgCard: '#1C1E2A',
    bgElevated: '#252836',
    textPrimary: '#FFFFFF',
    textSecondary: '#8B8FA3',
    textMuted: '#5A5E72',
    border: 'rgba(255, 255, 255, 0.06)',
    borderLight: 'rgba(255, 255, 255, 0.1)',
    divider: 'rgba(255, 255, 255, 0.06)',
  },
};