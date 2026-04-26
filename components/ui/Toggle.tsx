import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme';

export type ToggleProps = {
  value: boolean;
  onChange: (next: boolean) => void;
};

export function Toggle({ value, onChange }: ToggleProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      hitSlop={6}
      style={{
        width: 40,
        height: 24,
        borderRadius: 999,
        backgroundColor: value ? t.colors.ok : t.colors.paper3,
        padding: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: value ? 'flex-end' : 'flex-start',
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: t.colors.paper,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      />
    </Pressable>
  );
}
