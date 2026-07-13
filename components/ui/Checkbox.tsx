import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

export function Checkbox({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      hitSlop={8}
      style={{
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: value ? t.colors.accent : t.colors.rule,
        backgroundColor: value ? t.colors.accent : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {value && <Ionicons name="checkmark" size={14} color={t.colors.accentOn} />}
    </Pressable>
  );
}
