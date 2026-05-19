import { useTheme } from '@/theme';
import { Image, View } from 'react-native';
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
      <Image
        source={require('../../assets/images/logo-airplane/airplane.png')}
        style={{
          width: size * 0.32,
          height: size,
          marginHorizontal: 1,
          tintColor: t.colors.ink,
        }}
        resizeMode="contain"
      />
      <Text style={{ fontFamily: t.fontFamily.display, fontSize: size, lineHeight: size, color: t.colors.ink }}>
        yeasy
      </Text>
    </View>
  );
}
