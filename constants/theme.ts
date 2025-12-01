/**
 * Hookgenie Theme Constants
 * "Retro Pop" theme - Neo-Brutalist with bold borders and vibrant colors
 */

// Font Family Constants
export const Fonts = {
  heavy: 'SFUIText-Heavy',
  light: 'SFUIText-Light',
  system: undefined, // Falls back to system font
} as const;

export const Colors = {
  // Primary Background - Custard Yellow
  background: '#F3E8A3',
  backgroundSecondary: '#EDE399',

  // Primary/Accent - Pastel Pink
  primary: '#F4A6BB',
  primaryLight: '#F8C4D4',
  primaryDark: '#E8899F',

  // Card/Surface - Off-White
  surface: '#F2F2F2',
  card: '#F2F2F2',

  // Stroke/Border - Black
  stroke: '#000000',
  border: '#000000',
  borderLight: '#333333',

  // Secondary colors for variety
  secondary: '#F4A6BB',
  secondaryLight: '#F8C4D4',
  secondaryDark: '#E8899F',

  // Accent colors
  accent: '#F4A6BB',
  accentLight: '#F8C4D4',

  // Text Colors
  text: '#000000',
  textSecondary: '#333333',
  textLight: '#666666',
  textOnPrimary: '#000000',
  textOnSecondary: '#000000',
  textPink: '#F4A6BB',

  // Utility Colors
  success: '#7DC97E',
  warning: '#F3E8A3',
  error: '#E57373',
  info: '#64B5F6',

  // Shadow color
  shadow: 'rgba(0, 0, 0, 0.15)',
  shadowDark: 'rgba(0, 0, 0, 0.25)',
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
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  round: 9999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  hero: 48,
} as const;

export const FontWeight = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '900' as const,
};

// Neo-Brutalist border style
export const NeoBrutalist = {
  borderWidth: 1.5,
  borderColor: Colors.stroke,
  borderRadius: BorderRadius.lg,
} as const;

export const Shadow = {
  small: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  // Neo-Brutalist hard shadow
  brutal: {
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
} as const;

export default {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  NeoBrutalist,
  Shadow,
};
