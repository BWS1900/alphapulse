// AlphaPulse — Typography Scale
// Per designer spec: SF Pro Display / Inter + SF Mono / JetBrains Mono

import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

const fontFamilyMono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export const typography = {
  fontFamily,
  fontFamilyMono,

  fontSize: {
    xs: 10,     // Tiny labels, metric units
    sm: 12,     // Secondary info, timestamps
    base: 14,   // Body text, list items
    md: 16,     // Card titles, section headers
    lg: 20,     // Screen titles, big numbers
    xl: 28,     // Price displays
    '2xl': 36,  // Hero prices, large metrics
    display: 48, // Onboarding headlines
  },

  fontWeight: {
    normal: '500' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Preset styles for common text roles
  presets: {
    h1: {
      fontFamily,
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 34,
      letterSpacing: -0.5,
    },
    h2: {
      fontFamily,
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 26,
    },
    h3: {
      fontFamily,
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
    },
    body: {
      fontFamily,
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 21,
    },
    bodyBold: {
      fontFamily,
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 21,
    },
    caption: {
      fontFamily,
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
    label: {
      fontFamily,
      fontSize: 10,
      fontWeight: '500',
      lineHeight: 14,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    mono: {
      fontFamily: fontFamilyMono,
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    priceLarge: {
      fontFamily: fontFamilyMono,
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 44,
      letterSpacing: -0.5,
    },
    priceHero: {
      fontFamily: fontFamilyMono,
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
      letterSpacing: -0.5,
    },
    changeMono: {
      fontFamily: fontFamilyMono,
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
    display: {
      fontFamily,
      fontSize: 48,
      fontWeight: '800',
      lineHeight: 56,
    },
  },
};

export type TypographyPreset = keyof typeof typography.presets;