import { useTheme } from '@/theme';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text } from './Text';

/**
 * "Flyeasy" wordmark from the splash design — the lowercase 'l' is rendered
 * as a small vertical airplane silhouette to mirror the wireframe.
 */
export function Logo({ size = 48 }: { size?: number }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
      <Text style={{ fontFamily: t.fontFamily.display, fontSize: size, lineHeight: size, color: t.colors.ink }}>
        F
      </Text>
      <Svg viewBox="0 0 20 64" width={size * 0.32} height={size} style={{ marginHorizontal: 1 }}>
        <Path
          d="M10 2 C 11.2 2 11.7 4 11.7 7 L 11.7 27 L 18 33 L 18 35.5 L 11.7 33.5 L 11.7 50 L 14.5 53 L 14.5 54.5 L 10 53.2 L 5.5 54.5 L 5.5 53 L 8.3 50 L 8.3 33.5 L 2 35.5 L 2 33 L 8.3 27 L 8.3 7 C 8.3 4 8.8 2 10 2 Z"
          fill={t.colors.ink}
        />
      </Svg>
      <Text style={{ fontFamily: t.fontFamily.display, fontSize: size, lineHeight: size, color: t.colors.ink }}>
        yeasy
      </Text>
    </View>
  );
}
