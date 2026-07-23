import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { toneColors, type Tone } from '@/theme/tones';
import { Text } from './Text';

/**
 * Fill style. The rule across the app:
 *   solid / tint → actionable (it has a background, you can press it)
 *   outline      → status only (transparent, usually nothing to press)
 */
export type PillVariant = 'solid' | 'tint' | 'outline';

/**
 * Small pill-shaped action or status chip — the single implementation behind
 * every Connect / Accept / Decline / Requested style control. Pass a semantic
 * `tone` rather than raw colors so shades stay consistent everywhere.
 *
 * Omit `onPress` to render a non-pressable chip (no press target at all).
 */
export function ActionPill({
  label,
  icon,
  trailingIcon,
  tone = 'accent',
  variant = 'solid',
  onPress,
  busy = false,
  style,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Extra icon after the label — e.g. the ✕ that affords undoing a request. */
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  tone?: Tone;
  variant?: PillVariant;
  onPress?: () => void;
  busy?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const c = toneColors(t.colors, tone);

  const fg = variant === 'solid' ? c.on : c.ink;
  const shape: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: variant === 'solid' ? c.solid : variant === 'tint' ? c.tint : 'transparent',
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: variant === 'outline' ? c.ink : 'transparent',
  };

  const body = (
    <>
      {icon && <Ionicons name={icon} size={15} color={fg} />}
      <Text style={{ fontSize: t.fontSize.small, fontFamily: t.fontFamily.uiSemibold, color: fg }}>
        {label}
      </Text>
      {trailingIcon && <Ionicons name={trailingIcon} size={14} color={fg} style={{ marginLeft: 1 }} />}
    </>
  );

  if (!onPress) return <View style={[shape, style]}>{body}</View>;

  return (
    <Pressable
      onPress={(e) => {
        // Pills often sit inside a pressable card — don't trigger both.
        e.stopPropagation?.();
        onPress();
      }}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [shape, { opacity: busy ? 0.5 : pressed ? 0.7 : 1 }, style]}
    >
      {body}
    </Pressable>
  );
}
