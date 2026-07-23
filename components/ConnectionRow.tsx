import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Text } from '@/components/ui/Text';
import type { Connection, Flight, Person } from '@/data/mock';

export function ConnectionRow({
  person,
  flight,
  connection,
  flightSubtitle,
  onPress,
}: {
  person: Person;
  flight: Flight;
  connection: Connection;
  /** Override default flight subtitle text (e.g. "Departs in 2d", "Closed") */
  flightSubtitle?: string;
  onPress?: () => void;
}) {
  const t = useTheme();
  const router = useRouter();

  const handlePress = onPress ?? (() => router.push(`/chat/${connection.id}`));
  const subtitle = flightSubtitle ?? `${flight.code} · ${flight.date}`;

  return (
    <Pressable onPress={handlePress}>
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          alignItems: 'center',
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: t.colors.rule,
        }}
      >
        <Avatar size={46} initials={person.initials} uri={person.avatarUrl} />
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="h3">{person.shortName}</Text>
            {connection.unread > 0 ? (
              <View
                style={{
                  minWidth: 20,
                  height: 20,
                  paddingHorizontal: 6,
                  borderRadius: 10,
                  backgroundColor: t.colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: t.colors.accentOn, fontFamily: t.fontFamily.uiBold, fontSize: 10 }}>
                  {connection.unread}
                </Text>
              </View>
            ) : (
              <Text variant="monoSm" tone="mute">
                {connection.lastTime}
              </Text>
            )}
          </View>
          <Text variant="monoSm" tone="mute">
            {subtitle}
          </Text>
          <Text
            numberOfLines={1}
            style={{ fontSize: t.fontSize.small, color: t.colors.inkSoft, fontFamily: t.fontFamily.ui }}
          >
            {connection.lastMessage}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
