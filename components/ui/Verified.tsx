import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Text } from './Text';

export function Verified({ label = 'verified', style }: { label?: string; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: t.colors.okSoft,
          paddingHorizontal: 7,
          paddingVertical: 3,
          borderRadius: t.radius.sm,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Ionicons name="checkmark" size={10} color={t.colors.okInk} />
      <Text
        style={{
          fontFamily: t.fontFamily.monoSemibold,
          fontSize: t.fontSize.micro,
          letterSpacing: t.letterSpacing.caps,
          textTransform: 'uppercase',
          color: t.colors.okInk,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
