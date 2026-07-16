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
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export default function ProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const { session, signOut, updateProfile, uploadAvatar, removeAvatar } = useAuth();
  const { paletteName, setPalette, backgroundName, setBackground } = useThemeControls();

  const [signingOut, setSigningOut] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [flights, setFlights] = useState<Flight[]>(FEATURE_FLAGS.useMockFlights ? FLIGHTS : []);

  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(session?.description ?? '');
  const [savingBio, setSavingBio] = useState(false);
  const [togglingAvailable, setTogglingAvailable] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [firstDraft, setFirstDraft] = useState(session?.firstName ?? '');
  const [lastDraft, setLastDraft] = useState(session?.lastName ?? '');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!editingBio) setBioDraft(session?.description ?? '');
  }, [editingBio, session?.description]);

  useEffect(() => {
    if (!editingName) {
      setFirstDraft(session?.firstName ?? '');
      setLastDraft(session?.lastName ?? '');
    }
  }, [editingName, session?.firstName, session?.lastName]);

  const cancelName = () => {
    setFirstDraft(session?.firstName ?? '');
    setLastDraft(session?.lastName ?? '');
    setEditingName(false);
  };

  const saveName = async () => {
    const fn = firstDraft.trim();
    const ln = lastDraft.trim();
    if (!fn || !ln) {
      Alert.alert('Missing name', 'Please enter both first and last name.');
      return;
    }
    setSavingName(true);
    try {
      await updateProfile({ firstName: fn, lastName: ln });
      setEditingName(false);
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSavingName(false);
    }
  };

  const onAvailableChange = async (next: boolean) => {
    if (togglingAvailable) return;
    setTogglingAvailable(true);
    try {
      await updateProfile({ availableToConnect: next });
    } catch (e) {
      Alert.alert('Could not update', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setTogglingAvailable(false);
    }
  };

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

  const onChangePhoto = async () => {
    // Use the system photo picker (iOS PHPicker / Android photo picker): it's
    // permission-free and behaves identically under None / Limited / Full photo
    // access, so no access prompt ever appears. It has no built-in crop UI, so
    // we auto center-crop to a square ourselves below. We deliberately do NOT
    // use allowsEditing — see docs/avatar-photo-picker.md for the full reasoning
    // (the native editor triggers a mistimed access prompt for Limited-access
    // users).
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled) return;
    const asset = result.assets[0];

    setUploadingPhoto(true);
    try {
      // Center-crop to a square, then resize + compress so we're not pushing
      // multi-MB originals.
      const side = Math.min(asset.width, asset.height);
      const rendered = await ImageManipulator.manipulate(asset.uri)
        .crop({
          originX: (asset.width - side) / 2,
          originY: (asset.height - side) / 2,
          width: side,
          height: side,
        })
        .resize({ width: 512 })
        .renderAsync();
      const image = await rendered.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
      await uploadAvatar(image.uri);
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onRemovePhoto = () => {
    Alert.alert('Remove photo?', 'Your profile will show your initials instead.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setRemovingPhoto(true);
          try {
            await removeAvatar();
          } catch (e) {
            Alert.alert('Could not remove', e instanceof Error ? e.message : 'Please try again.');
          } finally {
            setRemovingPhoto(false);
          }
        },
      },
    ]);
  };

  const photoBusy = uploadingPhoto || removingPhoto;

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
      <TopBar title="Profile" />

      <View style={{ alignItems: 'center', gap: 8, marginTop: -8 }}>
        <View>
          <Avatar size={80} initials={initials} uri={session?.avatarUrl || undefined} />
          {session?.avatarUrl && !photoBusy && (
            <Pressable
              onPress={onRemovePhoto}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Remove profile photo"
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: t.colors.ink,
                borderWidth: 2,
                borderColor: t.colors.paper,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={12} color={t.colors.paper} />
            </Pressable>
          )}
        </View>
        <Pressable hitSlop={6} onPress={onChangePhoto} disabled={photoBusy}>
          {photoBusy ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ActivityIndicator size="small" color={t.colors.inkSoft} />
              <Text variant="body" tone="soft">
                {uploadingPhoto ? 'Uploading…' : 'Removing…'}
              </Text>
            </View>
          ) : (
            <Text variant="body" tone="soft" style={{ textDecorationLine: 'underline' }}>
              {session?.avatarUrl ? 'Change photo' : 'Add photo'}
            </Text>
          )}
        </Pressable>
        {editingName ? (
          <View style={{ alignSelf: 'stretch', gap: 10 }}>
            <TextInput
              value={firstDraft}
              onChangeText={setFirstDraft}
              placeholder="First name"
              placeholderTextColor={t.colors.inkMute}
              autoCapitalize="words"
              maxLength={50}
              autoFocus
              style={{
                color: t.colors.ink,
                fontFamily: t.fontFamily.ui,
                fontSize: t.fontSize.body,
                padding: 10,
                borderWidth: 1,
                borderColor: t.colors.rule,
                backgroundColor: t.colors.paper,
                borderRadius: t.radius.md,
              }}
            />
            <TextInput
              value={lastDraft}
              onChangeText={setLastDraft}
              placeholder="Last name"
              placeholderTextColor={t.colors.inkMute}
              autoCapitalize="words"
              maxLength={50}
              style={{
                color: t.colors.ink,
                fontFamily: t.fontFamily.ui,
                fontSize: t.fontSize.body,
                padding: 10,
                borderWidth: 1,
                borderColor: t.colors.rule,
                backgroundColor: t.colors.paper,
                borderRadius: t.radius.md,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
              <Button kind="ghost" onPress={cancelName}>
                Cancel
              </Button>
              <Button kind="primary" loading={savingName} onPress={saveName}>
                Save
              </Button>
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 24 }} />
            <Text variant="h2">{displayName}</Text>
            <Pressable onPress={() => setEditingName(true)} hitSlop={8} style={{ marginLeft: 8 }}>
              <Ionicons name="pencil" size={16} color={t.colors.inkMute} />
            </Pressable>
          </View>
        )}
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
          <Toggle value={session?.availableToConnect ?? true} onChange={onAvailableChange} />
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

      <View>
        <Button kind="ghost" full loading={signingOut} onPress={handleSignOut} textColor="#c83e2e">
          Sign out
        </Button>
      </View>

      <View style={{ height: 1, backgroundColor: t.colors.rule, marginVertical: 8 }} />

      <Pressable
        onPress={() => setAppearanceOpen((v) => !v)}
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}
      >
        <Text variant="section" tone="mute">
          Appearance
        </Text>
        <Ionicons
          name={appearanceOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={t.colors.inkMute}
        />
      </Pressable>

      {appearanceOpen && (
        <>
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
        </>
      )}
    </Screen>
  );
}
