import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Text } from './Text';

type IconName = keyof typeof Ionicons.glyphMap;

export function EmptyState({
  icon = 'airplane-outline',
  title,
  body,
  children,
}: {
  icon?: IconName;
  title: string;
  body?: string;
  children?: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: t.colors.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={36} color={t.colors.accentInk} />
      </View>
      <Text variant="h2" align="center">
        {title}
      </Text>
      {body && (
        <Text variant="body" tone="soft" align="center" style={{ maxWidth: 240 }}>
          {body}
        </Text>
      )}
      {children}
    </View>
  );
}
