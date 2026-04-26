/**
 * Non-color design tokens — spacing, radius, typography sizes.
 * Kept in sync with wireframe-v2-styles.css.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 5,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  pill: 999,
} as const;

export const fontSize = {
  micro: 9,
  caption: 10,
  small: 11,
  body: 12,
  bodyLg: 13,
  h3: 14,
  title: 18,
  h2: 22,
  h1: 28,
  display: 48,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/**
 * Font family keys — actual loaded font names registered in app/_layout.tsx.
 * On native, useFonts() loads these and they're referenced by family name.
 */
export const fontFamily = {
  display: 'Fraunces_600SemiBold',
  displayItalic: 'Fraunces_400Regular_Italic',
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiSemibold: 'Inter_600SemiBold',
  uiBold: 'Inter_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoSemibold: 'JetBrainsMono_600SemiBold',
} as const;

/**
 * Letter spacing values mirror the design's tight display + wide caps treatment.
 */
export const letterSpacing = {
  displayTight: -0.5,
  caps: 0.6,
  capsWide: 0.8,
} as const;
