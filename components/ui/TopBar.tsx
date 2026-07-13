import { useRouter } from 'expo-router';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Text } from './Text';

type IconName = keyof typeof Ionicons.glyphMap;

export type TopBarProps = {
  title?: string | React.ReactNode;
  subtitle?: React.ReactNode;
  leftIcon?: IconName;
  onLeftPress?: () => void;
  rightIcon?: IconName;
  onRightPress?: () => void;
  rightLabel?: string;
  /** When true and no leftIcon provided, shows back chevron that pops the route. */
  back?: boolean;
  style?: StyleProp<ViewStyle>;
};

function CircleIcon({ name, onPress }: { name: IconName; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: t.colors.paper2,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name={name} size={16} color={t.colors.ink} />
    </Pressable>
  );
}

export function TopBar({
  title,
  subtitle,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  rightLabel,
  back,
  style,
}: TopBarProps) {
  const t = useTheme();
  const router = useRouter();

  const resolvedLeftIcon: IconName | undefined = leftIcon ?? (back ? 'chevron-back' : undefined);
  const resolvedLeftPress = onLeftPress ?? (back ? () => router.back() : undefined);

  return (
    <View style={[{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12, gap: 4 }, style]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          minHeight: 32,
        }}
      >
        <View style={{ minWidth: 36, alignItems: 'flex-start' }}>
          {resolvedLeftIcon && <CircleIcon name={resolvedLeftIcon} onPress={resolvedLeftPress} />}
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          {typeof title === 'string' ? (
            <Text variant="h2" numberOfLines={1}>
              {title}
            </Text>
          ) : (
            title
          )}
        </View>
        <View style={{ minWidth: 36, alignItems: 'flex-end' }}>
          {rightLabel ? (
            <Pressable onPress={onRightPress} hitSlop={8}>
              <Text variant="bodyLg" weight="semibold" tone="default">
                {rightLabel}
              </Text>
            </Pressable>
          ) : rightIcon ? (
            <CircleIcon name={rightIcon} onPress={onRightPress} />
          ) : null}
        </View>
      </View>
      {subtitle ? (
        <View style={{ alignItems: 'center' }}>
          {typeof subtitle === 'string' ? (
            <Text variant="mono" tone="mute">
              {subtitle}
            </Text>
          ) : (
            subtitle
          )}
        </View>
      ) : null}
    </View>
  );
}
