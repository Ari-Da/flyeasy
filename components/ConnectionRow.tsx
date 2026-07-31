import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Text } from '@/components/ui/Text';
import type { Connection, Flight, Person } from '@/types/models';

export function ConnectionRow({
  person,
  flight,
  connection,
  flightSubtitle,
  onPress,
  unavailable = false,
}: {
  person: Person;
  flight?: Flight;
  connection: Connection;
  /** Override default flight subtitle text (e.g. "Departs in 2d", "Closed").
   * Required when `flight` is omitted. */
  flightSubtitle?: string;
  onPress?: () => void;
  /** The other person paused connecting — dim the row. Chat, once it exists,
   * should be read-only in this state. */
  unavailable?: boolean;
}) {
  const t = useTheme();
  const router = useRouter();

  const handlePress = onPress ?? (() => router.push(`/chat/${connection.id}`));
  const base = flightSubtitle ?? (flight ? `${flight.code} · ${flight.date}` : '');
  // Append the paused/unavailable note; if there's no base text, show it alone.
  const subtitle = unavailable ? (base ? `${base} · Unavailable` : 'Unavailable') : base;

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
          opacity: unavailable ? 0.55 : 1,
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
          {subtitle ? (
            <Text variant="monoSm" tone="mute">
              {subtitle}
            </Text>
          ) : null}
          <Text
            numberOfLines={1}
            style={{
              fontSize: t.fontSize.small,
              // Unread → darker + semibold so it reads as "new".
              color: connection.unread > 0 ? t.colors.ink : t.colors.inkSoft,
              fontFamily: connection.unread > 0 ? t.fontFamily.uiSemibold : t.fontFamily.ui,
            }}
          >
            {connection.lastMessage}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
