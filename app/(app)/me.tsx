import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Toggle } from '@/components/ui/Toggle';
import { TopBar } from '@/components/ui/TopBar';
import { FLIGHTS } from '@/data/mock';
import { PALETTES, useTheme, useThemeControls, type PaletteName } from '@/theme';

export default function ProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { paletteName, setPalette } = useThemeControls();

  const [available, setAvailable] = useState(true);

  const initials = session
    ? `${session.firstName[0] ?? ''}${session.lastName[0] ?? ''}`.toUpperCase()
    : 'RT';
  const displayName = session ? `${session.firstName} ${session.lastName}` : 'Riya Tanaka';
  const email = session?.email ?? 'riya@email.com';

  const upcoming = FLIGHTS.filter((f) => f.status === 'new' || f.status === 'delayed').length;
  const past = FLIGHTS.filter((f) => f.status === 'complete').length;

  return (
    <Screen scroll>
      <TopBar title="Profile" rightLabel="Edit" onRightPress={() => {}} />

      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar size={80} initials={initials} />
        <Pressable hitSlop={6}>
          <Text variant="body" tone="soft" style={{ textDecorationLine: 'underline' }}>
            Change photo
          </Text>
        </Pressable>
        <Text variant="h2">{displayName}</Text>
        <Text variant="mono" tone="mute">
          {email}
        </Text>
      </View>

      <Card flat>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="h3">Available to connect</Text>
            <Text variant="body" tone="soft">
              Others on your flights can send you requests.
            </Text>
          </View>
          <Toggle value={available} onChange={setAvailable} />
        </View>
      </Card>

      <View style={{ gap: 6 }}>
        <Text variant="section" tone="mute">
          About me
        </Text>
        <Card flat>
          <Text variant="body" tone="soft">
            Design researcher flying a lot between NYC & Tokyo. Always up to chat about books, coffee, and random
            airport snacks.
          </Text>
        </Card>
      </View>

      <Pressable onPress={() => router.push('/(app)/flights')}>
        <Card flat>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ gap: 2 }}>
              <Text variant="h3">My Flights</Text>
              <Text variant="body" tone="soft">
                {upcoming} upcoming · {past} past
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.colors.inkMute} />
          </View>
        </Card>
      </Pressable>

      <View style={{ gap: 6 }}>
        <Text variant="section" tone="mute">
          Theme
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(Object.keys(PALETTES) as PaletteName[]).map((name) => {
            const palette = PALETTES[name];
            const active = name === paletteName;
            return (
              <Pressable
                key={name}
                onPress={() => setPalette(name)}
                style={{
                  flex: 1,
                  borderWidth: 1.5,
                  borderColor: active ? t.colors.ink : t.colors.rule,
                  borderRadius: t.radius.lg,
                  padding: 10,
                  gap: 6,
                  alignItems: 'center',
                  backgroundColor: t.colors.paper,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: palette.accent,
                  }}
                />
                <Text variant="body" weight={active ? 'semibold' : 'regular'} style={{ textTransform: 'capitalize' }}>
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ marginTop: 8 }}>
        <Button kind="ghost" full onPress={signOut}>
          Sign out
        </Button>
      </View>
    </Screen>
  );
}
