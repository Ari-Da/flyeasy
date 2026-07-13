import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Text } from './Text';

export function RouteDisplay({
  from,
  to,
  style,
}: {
  from: string;
  to: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, style]}>
      <Text variant="h2">{from}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: t.colors.rule, position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: [{ translateX: -10 }],
            paddingHorizontal: 6,
            backgroundColor: t.colors.paper,
          }}
        >
          <Ionicons name="airplane" size={14} color={t.colors.accent} style={{ transform: [{ rotate: '90deg' }] }} />
        </View>
      </View>
      <Text variant="h2">{to}</Text>
    </View>
  );
}
