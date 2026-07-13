import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export type ChipProps = {
  children: string;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Chip({ children, active, onPress, style }: ChipProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingHorizontal: 11,
          paddingVertical: 5,
          borderRadius: t.radius.pill,
          borderWidth: 1,
          borderColor: active ? t.colors.ink : t.colors.rule,
          backgroundColor: active ? t.colors.ink : t.colors.paper,
          alignSelf: 'flex-start',
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: active ? t.fontFamily.uiSemibold : t.fontFamily.uiMedium,
          fontSize: t.fontSize.small,
          color: active ? t.colors.paper : t.colors.inkSoft,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
