import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Text } from './Text';

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * A single tappable settings row: leading icon, label (+ optional subtitle), and
 * a trailing chevron. Used for the Settings list in the profile.
 */
export function SettingsRow({
  icon,
  label,
  subtitle,
  onPress,
  danger,
}: {
  icon: IconName;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  const t = useTheme();
  const color = danger ? '#c83e2e' : t.colors.ink;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name={icon} size={19} color={danger ? '#c83e2e' : t.colors.inkMute} />
      <View style={{ flex: 1, gap: 1 }}>
        <Text variant="body" style={{ color, fontFamily: t.fontFamily.uiMedium }}>
          {label}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="mute">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={t.colors.inkMute} />
    </Pressable>
  );
}
