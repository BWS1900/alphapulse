// AlphaPulse — Spacing & Layout System
// Per designer spec: base unit 4px

export const spacing = {
  '1': 4,    // --space-1
  '2': 8,    // --space-2
  '3': 12,   // --space-3
  '4': 16,   // --space-4 (content padding)
  '5': 20,   // --space-5
  '6': 24,   // --space-6
  '8': 32,   // --space-8
  '10': 40,  // --space-10
};

// Also export named versions for convenience
export const space = spacing;

export const borderRadius = {
  none: 0,
  sm: 6,     // --radius-sm (buttons, badges)
  base: 10,  // --radius-md (cards, inputs)
  md: 10,
  lg: 16,    // --radius-lg (modals, bottom sheets)
  xl: 20,
  '2xl': 24,
  full: 999, // --radius-full (pill buttons)
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: {
    // --glow-accent: 0 0 20px rgba(0, 245, 212, 0.15)
    shadowColor: '#00F5D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
};

export const hitSlop = {
  sm: { top: 4, bottom: 4, left: 4, right: 4 },
  base: { top: 8, bottom: 8, left: 8, right: 8 },
  lg: { top: 12, bottom: 12, left: 12, right: 12 },
};