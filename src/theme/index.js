// AlphaPulse — Theme Index

export { colors, colorTokens } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, shadows, hitSlop } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  hitSlop,
};

export type Theme = typeof theme;