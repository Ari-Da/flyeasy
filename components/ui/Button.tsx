import { ActivityIndicator, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

type Kind = 'primary' | 'ghost' | 'secondary' | 'link';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  children: string;
  onPress?: () => void;
  kind?: Kind;
  size?: Size;
  full?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  leftIcon?: React.ReactNode;
};

export function Button({
  children,
  onPress,
  kind = 'primary',
  size = 'md',
  full,
  loading,
  disabled,
  style,
  leftIcon,
}: ButtonProps) {
  const t = useTheme();

  const sizeStyles: Record<Size, ViewStyle> = {
    sm: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
    md: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: t.radius.lg },
    lg: { paddingHorizontal: 18, paddingVertical: 13, borderRadius: t.radius.lg },
  };

  const sizeFontSize = size === 'sm' ? t.fontSize.small : size === 'lg' ? t.fontSize.h3 : t.fontSize.bodyLg;

  const kindStyles: Record<Kind, ViewStyle> = {
    primary: {
      backgroundColor: t.colors.accent,
      borderColor: t.colors.accent,
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

  const fgColor =
    kind === 'primary'
      ? t.colors.accentOn
      : kind === 'link'
        ? t.colors.accentInk
        : t.colors.ink;

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
