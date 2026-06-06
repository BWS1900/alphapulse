// AlphaPulse — Typography Scale
// System fonts for iOS (SF Pro) and Android (Roboto)

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
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
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
      fontSize: 30,
      fontWeight: '700',
      lineHeight: 36,
      letterSpacing: -0.5,
    },
    h2: {
      fontFamily,
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 30,
      letterSpacing: -0.3,
    },
    h3: {
      fontFamily,
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 26,
    },
    body: {
      fontFamily,
      fontSize: 14,
      fontWeight: '400',
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
      fontWeight: '400',
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
      fontWeight: '400',
      lineHeight: 20,
    },
    priceLarge: {
      fontFamily: fontFamilyMono,
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 44,
      letterSpacing: -0.5,
    },
    changePositive: {
      fontFamily: fontFamilyMono,
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
    changeNegative: {
      fontFamily: fontFamilyMono,
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
  },
};

export type TypographyPreset = keyof typeof typography.presets;
