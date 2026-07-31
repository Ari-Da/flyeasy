import { useTheme } from '@/theme';
import { APP_NAME } from '@/brand/brand';
import { View } from 'react-native';
import { Mark } from './Mark';
import { Text } from './Text';

/**
 * Flyeasy horizontal lockup — the {@link Mark} plus the "{@link APP_NAME}"
 * wordmark. The wordmark is live Bricolage Grotesque (theme display family), so
 * the app name is single-sourced from brand/brand.ts and never hardcoded here.
 *
 * The mark's green plane follows the selected accent via <Mark>; pass
 * `planeColor` to pin it (e.g. on a fixed-color surface).
 */
export function Logo({ size = 28, planeColor }: { size?: number; planeColor?: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.32 }}>
      <Mark size={size * 1.18} planeColor={planeColor} />
      <Text
        style={{
          fontFamily: t.fontFamily.uiSemibold,
          fontSize: size,
          lineHeight: size * 1.1,
          letterSpacing: size * -0.02,
          color: t.colors.ink,
        }}
      >
        {APP_NAME}
      </Text>
    </View>
  );
}
