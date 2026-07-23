import type { StyleProp, TextStyle } from 'react-native';
import { useTheme } from '@/theme';
import { toneColors } from '@/theme/tones';
import { Text } from './Text';

/**
 * Inline form/action error message. One place for the error style so every
 * screen reads the same — use this instead of hand-rolling a red <Text>.
 */
export function ErrorText({
  children,
  style,
}: {
  children: string;
  style?: StyleProp<TextStyle>;
}) {
  const t = useTheme();
  return (
    <Text variant="caption" align="center" style={[{ color: toneColors(t.colors, 'danger').ink }, style]}>
      {children}
    </Text>
  );
}
