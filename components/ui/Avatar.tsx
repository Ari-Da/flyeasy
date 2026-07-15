import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export type AvatarProps = {
  initials: string;
  /** Optional photo URL. When set, the image is shown; otherwise the initials. */
  uri?: string | null;
  size?: number;
  variant?: 'default' | 'soft';
  style?: StyleProp<ViewStyle>;
};

export function Avatar({ initials, uri, size = 44, variant = 'default', style }: AvatarProps) {
  const t = useTheme();
  const isSoft = variant === 'soft';

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: isSoft ? t.colors.accentSoft : t.colors.paper3,
          borderWidth: 1,
          borderColor: isSoft ? 'transparent' : t.colors.rule,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <Text
          style={{
            fontFamily: t.fontFamily.uiSemibold,
            color: isSoft ? t.colors.accentInk : t.colors.inkSoft,
            fontSize: size * 0.36,
            lineHeight: size * 0.42,
            includeFontPadding: false,
            textAlignVertical: 'center',
          }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}
