import { useState } from 'react';
import {
  Pressable,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Text } from './Text';

type IconName = keyof typeof Ionicons.glyphMap;

export type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  icon?: IconName;
  iconChar?: string; // for stylized chars like "@" or "#"
  dense?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  error?: string;
};

export function Input({
  label,
  icon,
  iconChar,
  dense,
  containerStyle,
  error,
  value,
  onFocus,
  onBlur,
  secureTextEntry,
  ...rest
}: InputProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isSecure = !!secureTextEntry && !revealed;

  return (
    <View style={[{ gap: 4 }, containerStyle]}>
      {label && <Text variant="label" tone="mute">{label}</Text>}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderWidth: 1,
          borderColor: error ? t.colors.delayedFg : focused ? t.colors.accent : t.colors.rule,
          backgroundColor: t.colors.paper,
          borderRadius: t.radius.md,
          paddingHorizontal: dense ? 10 : 12,
          paddingVertical: dense ? 8 : 10,
        }}
      >
        {icon && <Ionicons name={icon} size={16} color={t.colors.inkMute} />}
        {iconChar && (
          <Text variant="body" tone="mute" style={{ fontFamily: t.fontFamily.mono, fontSize: 14 }}>
            {iconChar}
          </Text>
        )}
        <TextInput
          {...rest}
          value={value}
          secureTextEntry={isSecure}
          placeholderTextColor={t.colors.inkMute}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={{
            flex: 1,
            color: t.colors.ink,
            fontFamily: t.fontFamily.ui,
            fontSize: dense ? t.fontSize.body : t.fontSize.bodyLg,
            padding: 0,
          }}
        />
        {!!secureTextEntry && (
          <Pressable
            onPress={() => setRevealed((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={t.colors.inkMute}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <Text variant="caption" style={{ color: t.colors.delayedFg }}>
          {error}
        </Text>
      )}
    </View>
  );
}
