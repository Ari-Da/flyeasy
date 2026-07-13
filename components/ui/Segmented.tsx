import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
};

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: t.colors.paper2,
        padding: 3,
        borderRadius: 999,
        alignSelf: 'flex-start',
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: active ? t.colors.paper : 'transparent',
              shadowColor: active ? '#000' : 'transparent',
              shadowOpacity: active ? 0.06 : 0,
              shadowRadius: 2,
              shadowOffset: { width: 0, height: 1 },
              elevation: active ? 1 : 0,
            }}
          >
            <Text
              style={{
                fontFamily: active ? t.fontFamily.uiSemibold : t.fontFamily.uiMedium,
                fontSize: t.fontSize.small,
                color: active ? t.colors.ink : t.colors.inkMute,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
