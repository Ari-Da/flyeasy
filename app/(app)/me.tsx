import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Toggle } from '@/components/ui/Toggle';
import { TopBar } from '@/components/ui/TopBar';
import { FLIGHTS, type Flight } from '@/data/mock';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { fetchUserFlights, FLIGHT_STATUS } from '@/lib/flights';
import {
  BACKGROUND_PALETTES,
  PALETTES,
  useTheme,
  useThemeControls,
  type BackgroundName,
  type PaletteName,
} from '@/theme';

export default function ProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const { session, signOut, updateProfile } = useAuth();
  const { paletteName, setPalette, backgroundName, setBackground } = useThemeControls();

  const [available, setAvailable] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [flights, setFlights] = useState<Flight[]>(FEATURE_FLAGS.useMockFlights ? FLIGHTS : []);

  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(session?.description ?? '');
  const [savingBio, setSavingBio] = useState(false);

  useEffect(() => {
    if (!editingBio) setBioDraft(session?.description ?? '');
  }, [editingBio, session?.description]);

  const cancelBio = () => {
    setBioDraft(session?.description ?? '');
    setEditingBio(false);
  };

  const saveBio = async () => {
    setSavingBio(true);
    try {
      await updateProfile({ description: bioDraft.trim() });
      setEditingBio(false);
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSavingBio(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (FEATURE_FLAGS.useMockFlights) {
        setFlights(FLIGHTS);
        return;
      }
      let active = true;
      fetchUserFlights()
        .then((rows) => {
          if (active) setFlights(rows);
        })
        .catch(() => {
          if (active) setFlights([]);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
          } catch (e) {
            Alert.alert('Sign out failed', e instanceof Error ? e.message : 'Please try again.');
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  const initials = session
    ? `${session.firstName[0] ?? ''}${session.lastName[0] ?? ''}`.toUpperCase()
    : 'RT';
  const displayName = session ? `${session.firstName} ${session.lastName}` : 'Riya Tanaka';
  const email = session?.email ?? 'riya@email.com';

  const upcoming = flights.filter(
    (f) => f.status === FLIGHT_STATUS.NEW || f.status === FLIGHT_STATUS.DELAYED,
  ).length;
  const past = flights.filter((f) => f.status === FLIGHT_STATUS.COMPLETE).length;

  return (
    <Screen scroll>
      <TopBar title="Profile" rightLabel="Edit" onRightPress={() => {}} />

      <View style={{ alignItems: 'center', gap: 8, marginTop: -8 }}>
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="section" tone="mute">
            About me
          </Text>
          {!editingBio && (
            <Pressable onPress={() => setEditingBio(true)} hitSlop={6}>
              <Ionicons
                name={session?.description ? 'pencil' : 'add'}
                size={16}
                color={t.colors.inkMute}
              />
            </Pressable>
          )}
        </View>
        <Card flat>
          {editingBio ? (
            <View style={{ gap: 10 }}>
              <TextInput
                value={bioDraft}
                onChangeText={setBioDraft}
                placeholder="A short bio so others know who you are…"
                placeholderTextColor={t.colors.inkMute}
                multiline
                maxLength={300}
                autoFocus
                style={{
                  minHeight: 80,
                  color: t.colors.ink,
                  fontFamily: t.fontFamily.ui,
                  fontSize: t.fontSize.body,
                  padding: 10,
                  borderWidth: 1,
                  borderColor: t.colors.rule,
                  backgroundColor: t.colors.paper,
                  borderRadius: t.radius.md,
                  textAlignVertical: 'top',
                }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="caption" tone="mute">
                  {bioDraft.length}/300
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button kind="ghost" onPress={cancelBio}>
                    Cancel
                  </Button>
                  <Button kind="primary" loading={savingBio} onPress={saveBio}>
                    Save
                  </Button>
                </View>
              </View>
            </View>
          ) : session?.description ? (
            <Text variant="body" tone="soft">
              {session.description}
            </Text>
          ) : (
            <Pressable onPress={() => setEditingBio(true)}>
              <Text variant="body" tone="mute">
                Add a short bio so others know who you are.
              </Text>
            </Pressable>
          )}
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
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <Text variant="section" tone="mute">
          Background
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(Object.keys(BACKGROUND_PALETTES) as BackgroundName[]).map((name) => {
            const bg = BACKGROUND_PALETTES[name];
            const active = name === backgroundName;
            return (
              <Pressable
                key={name}
                onPress={() => setBackground(name)}
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
                    backgroundColor: bg.paper,
                    borderWidth: 1,
                    borderColor: t.colors.rule,
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
        <Button kind="ghost" full loading={signingOut} onPress={handleSignOut} textColor="#c83e2e">
          Sign out
        </Button>
      </View>
    </Screen>
  );
}
