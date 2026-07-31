import { ActivityIndicator, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { toneColors, type Tone } from '@/theme/tones';
import { Text } from './Text';

type Kind = 'primary' | 'tonal' | 'ghost' | 'secondary' | 'link';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  children: string;
  onPress?: () => void;
  kind?: Kind;
  size?: Size;
  /**
   * Semantic color. Resolved via theme/tones so green/red/blue match the rest of
   * the app — prefer this over passing raw colors through `style`/`textColor`.
   *   primary → solid fill · tonal → soft tint · ghost/link → tinted text
   */
  tone?: Tone;
  full?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  leftIcon?: React.ReactNode;
  /** Escape hatch — overrides the tone's text + spinner color. */
  textColor?: string;
};

export function Button({
  children,
  onPress,
  kind = 'primary',
  size = 'md',
  tone = 'accent',
  full,
  loading,
  disabled,
  style,
  leftIcon,
  textColor,
}: ButtonProps) {
  const t = useTheme();
  const c = toneColors(t.colors, tone);

  const sizeStyles: Record<Size, ViewStyle> = {
    sm: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
    md: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: t.radius.lg },
    lg: { paddingHorizontal: 18, paddingVertical: 13, borderRadius: t.radius.lg },
  };

  const sizeFontSize = size === 'sm' ? t.fontSize.small : size === 'lg' ? t.fontSize.h3 : t.fontSize.bodyLg;

  const kindStyles: Record<Kind, ViewStyle> = {
    primary: {
      backgroundColor: c.solid,
      borderColor: c.solid,
      borderWidth: 1,
    },
    tonal: {
      backgroundColor: c.tint,
      borderColor: 'transparent',
      borderWidth: 1,
    },
    secondary: {
      backgroundColor: t.colors.paper2,
      borderColor: t.colors.rule,
      borderWidth: 1,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: t.colors.rule,
      borderWidth: 1,
    },
    link: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      paddingVertical: 4,
      paddingHorizontal: 0,
    },
  };

  // Non-accent tones tint their text so a `ghost`/`link` reads as danger etc.;
  // the default accent tone keeps the original neutral ink.
  const neutralFg = tone === 'accent' ? t.colors.ink : c.ink;
  const fgColor =
    textColor ??
    (kind === 'primary'
      ? c.on
      : kind === 'tonal' || kind === 'link'
        ? c.ink
        : neutralFg);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        sizeStyles[size],
        kindStyles[kind],
        full && { alignSelf: 'stretch' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fgColor} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text
            style={{
              color: fgColor,
              fontFamily: t.fontFamily.uiSemibold,
              fontSize: sizeFontSize,
              textDecorationLine: kind === 'link' ? 'underline' : 'none',
            }}
          >
            {children}
          </Text>
        </>
      )}
    </Pressable>
  );
}
