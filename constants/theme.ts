/**
 * Hookgenie Theme Constants
 * "Pastel Pop" theme - vibrant, playful, Jellycat-inspired
 */

export const Colors = {
  // Primary Colors - Purple
  primary: '#A395EC',
  primaryLight: '#C5BBF5',
  primaryDark: '#7D6AD4',

  // Secondary Colors - Pink
  secondary: '#EBA9B9',
  secondaryLight: '#F4D3DB',
  secondaryDark: '#D48295',

  // Background Colors - Off-White
  background: '#F1F2ED',
  backgroundSecondary: '#E8E9E4',
  surface: '#FFFFFF',

  // Accent Colors - Terracotta
  accent: '#B65C2C',
  accentLight: '#D57E4F',

  // Text Colors - Terracotta-based for warm feel
  text: '#3E1F12', // Very dark terracotta for primary text
  textSecondary: '#6D4535', // Medium terracotta for secondary text
  textLight: '#9E7A6A', // Light terracotta for hints
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#3E1F12',

  // Utility Colors
  success: '#81C784',
  warning: '#F2E08E', // Yellow from palette
  error: '#E57373',
  info: '#64B5F6',

  // Border Colors
  border: '#DDD9D0',
  borderLight: '#E8E9E4',

  // Shadow Colors - Purple-tinted
  shadow: 'rgba(163, 149, 236, 0.12)',
  shadowDark: 'rgba(163, 149, 236, 0.2)',
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
