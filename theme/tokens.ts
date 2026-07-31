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
 *
 * Brand redesign: one typeface (Bricolage Grotesque) across display + UI roles,
 * differentiated by weight; JetBrains Mono is kept for flight codes/times.
 * Bricolage ships no italic static instance, so `displayItalic` falls back to
 * the regular weight. Swapping the whole app back to another family is a
 * single edit here — every screen reads these keys via useTheme().
 */
export const fontFamily = {
  display: 'BricolageGrotesque_700Bold',
  displayItalic: 'BricolageGrotesque_400Regular',
  ui: 'BricolageGrotesque_400Regular',
  uiMedium: 'BricolageGrotesque_500Medium',
  uiSemibold: 'BricolageGrotesque_600SemiBold',
  uiBold: 'BricolageGrotesque_700Bold',
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
