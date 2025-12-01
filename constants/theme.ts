/**
 * Hookgenie Theme Constants
 * "Cozy" theme with warm, inviting colors for crafters
 */

export const Colors = {
  // Primary Colors
  primary: '#9CAF88', // Soft Sage Green
  primaryLight: '#B8C7A8',
  primaryDark: '#7D9068',

  // Secondary Colors
  secondary: '#E8B4B8', // Blush Pink
  secondaryLight: '#F0CDD0',
  secondaryDark: '#D89B9F',

  // Background Colors
  background: '#FDFBF7', // Warm Cream
  backgroundSecondary: '#F5F2EC',
  surface: '#FFFFFF',

  // Accent Colors
  accent: '#5D4037', // Warm Cocoa Brown
  accentLight: '#8D6E63',

  // Text Colors
  text: '#3E2723', // Dark brown for primary text
  textSecondary: '#6D5D58', // Medium brown for secondary text
  textLight: '#9E8E89', // Light brown for hints
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#3E2723',

  // Utility Colors
  success: '#81C784',
  warning: '#FFB74D',
  error: '#E57373',
  info: '#64B5F6',

  // Border Colors
  border: '#E0D8D0',
  borderLight: '#EDE8E2',

  // Shadow Colors
  shadow: 'rgba(93, 64, 55, 0.1)',
  shadowDark: 'rgba(93, 64, 55, 0.2)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  hero: 40,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadow = {
  small: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export default {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
};
