import { Text as RNText, type StyleProp, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/theme';

type Variant =
  | 'display' // splash wordmark
  | 'h1' // 28 fraunces
  | 'h2' // 22 fraunces
  | 'h3' // 14 inter semibold
  | 'body' // 12 inter
  | 'bodyLg' // 13 inter
  | 'mono' // 10 mono caps muted
  | 'monoSm'
  | 'section' // small caps section header
  | 'label' // input labels — mono caps muted
  | 'caption';

type Tone = 'default' | 'soft' | 'mute' | 'accent' | 'accentInk' | 'ok' | 'okInk' | 'on' | 'inverse';

export type TextProps = RNTextProps & {
  variant?: Variant;
  tone?: Tone;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<TextStyle>;
};

export function Text({
  variant = 'body',
  tone = 'default',
  weight,
  italic,
  align,
  style,
  children,
  ...rest
}: TextProps) {
  const t = useTheme();

  const colorByTone: Record<Tone, string> = {
    default: t.colors.ink,
    soft: t.colors.inkSoft,
    mute: t.colors.inkMute,
    accent: t.colors.accent,
    accentInk: t.colors.accentInk,
    ok: t.colors.ok,
    okInk: t.colors.okInk,
    on: t.colors.accentOn,
    inverse: t.colors.paper,
  };

  const variantStyles: Record<Variant, TextStyle> = {
    display: {
      fontFamily: t.fontFamily.display,
      fontSize: t.fontSize.display,
      letterSpacing: -1,
      lineHeight: t.fontSize.display,
    },
    h1: {
      fontFamily: t.fontFamily.display,
      fontSize: t.fontSize.h1,
      letterSpacing: t.letterSpacing.displayTight,
      lineHeight: t.fontSize.h1 * 1.05,
    },
    h2: {
      fontFamily: t.fontFamily.display,
      fontSize: t.fontSize.h2,
      letterSpacing: -0.3,
      lineHeight: t.fontSize.h2 * 1.1,
    },
    h3: {
      fontFamily: t.fontFamily.uiSemibold,
      fontSize: t.fontSize.h3,
    },
    body: {
      fontFamily: t.fontFamily.ui,
      fontSize: t.fontSize.body,
      lineHeight: t.fontSize.body * 1.45,
    },
    bodyLg: {
      fontFamily: t.fontFamily.ui,
      fontSize: t.fontSize.bodyLg,
      lineHeight: t.fontSize.bodyLg * 1.45,
    },
    mono: {
      fontFamily: t.fontFamily.monoSemibold,
      fontSize: t.fontSize.caption,
      letterSpacing: t.letterSpacing.caps,
      textTransform: 'uppercase',
    },
    monoSm: {
      fontFamily: t.fontFamily.mono,
      fontSize: t.fontSize.micro,
      letterSpacing: t.letterSpacing.caps,
      textTransform: 'uppercase',
    },
    section: {
      fontFamily: t.fontFamily.uiSemibold,
      fontSize: t.fontSize.small,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    label: {
      fontFamily: t.fontFamily.monoSemibold,
      fontSize: t.fontSize.micro,
      letterSpacing: t.letterSpacing.capsWide,
      textTransform: 'uppercase',
    },
    caption: {
      fontFamily: t.fontFamily.ui,
      fontSize: t.fontSize.small,
    },
  };

  const weightFamily =
    weight === 'bold'
      ? t.fontFamily.uiBold
      : weight === 'semibold'
        ? t.fontFamily.uiSemibold
        : weight === 'medium'
          ? t.fontFamily.uiMedium
          : undefined;

  return (
    <RNText
      {...rest}
      style={[
        variantStyles[variant],
        { color: colorByTone[tone] },
        weightFamily && { fontFamily: weightFamily },
        italic && { fontFamily: t.fontFamily.displayItalic },
        align && { textAlign: align },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
