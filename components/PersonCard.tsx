import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Verified } from '@/components/ui/Verified';
import type { Flight, Person } from '@/data/mock';

export function PersonCard({
  person,
  flight,
  requested,
  onConnect,
}: {
  person: Person;
  flight: Flight;
  requested?: boolean;
  onConnect?: () => void;
}) {
  const t = useTheme();
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/user/${person.id}`)}>
      <Card>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Avatar size={44} initials={person.initials} />
          <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
            <Text variant="h3">{person.name}</Text>
            {person.verified && <Verified />}
          </View>
        </View>

        <Text variant="body" tone="soft">
          {person.description}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          {requested ? (
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: t.colors.rule,
              }}
            >
              <Text style={{ fontSize: t.fontSize.small, fontFamily: t.fontFamily.uiSemibold, color: t.colors.inkMute }}>
                Requested
              </Text>
            </View>
          ) : (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onConnect?.();
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: t.colors.accent,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Ionicons name="person-add" size={14} color={t.colors.accentOn} />
              <Text style={{ fontSize: t.fontSize.small, fontFamily: t.fontFamily.uiSemibold, color: t.colors.accentOn }}>
                Connect
              </Text>
            </Pressable>
          )}
        </View>
      </Card>
    </Pressable>
  );
}
