import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RouteDisplay } from '@/components/ui/RouteDisplay';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { Verified } from '@/components/ui/Verified';
import { getFlight, peopleOnFlight, type Flight } from '@/data/mock';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { fetchFlight, updateFlightMessage } from '@/lib/flights';
import { useTheme } from '@/theme';

export default function FlightDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useTheme();
  const { session } = useAuth();

  const [flight, setFlight] = useState<Flight | null | undefined>(
    FEATURE_FLAGS.useMockFlights && id ? (getFlight(id) ?? null) : undefined,
  );

  const [editingMessage, setEditingMessage] = useState(false);
  const [messageDraft, setMessageDraft] = useState('');
  const [savingMessage, setSavingMessage] = useState(false);

  useEffect(() => {
    if (FEATURE_FLAGS.useMockFlights || !id) return;
    let active = true;
    fetchFlight(id)
      .then((f) => {
        if (active) setFlight(f);
      })
      .catch(() => {
        if (active) setFlight(null);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!editingMessage) setMessageDraft(flight?.flightMessage ?? '');
  }, [editingMessage, flight?.flightMessage]);

  const cancelMessage = () => {
    setMessageDraft(flight?.flightMessage ?? '');
    setEditingMessage(false);
  };

  const startEditingMessage = () => {
    if (!flight) return;
    const seed = flight.flightMessage?.trim() ? flight.flightMessage : (session?.description ?? '');
    setMessageDraft(seed ?? '');
    setEditingMessage(true);
  };

  const saveMessage = async () => {
    if (!flight) return;
    setSavingMessage(true);
    try {
      const trimmed = messageDraft.trim();
      await updateFlightMessage(flight.id, trimmed);
      setFlight({ ...flight, flightMessage: trimmed });
      setEditingMessage(false);
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSavingMessage(false);
    }
  };

  if (flight === undefined) {
    return (
      <Screen contentStyle={{ flex: 1 }}>
        <TopBar back />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.colors.accent} />
        </View>
      </Screen>
    );
  }

  if (!flight) {
    return (
      <Screen>
        <TopBar back />
        <Text>Flight not found.</Text>
      </Screen>
    );
  }

  const people = FEATURE_FLAGS.useMockPeople ? peopleOnFlight(flight.id) : [];
  const previewCount = Math.min(4, people.length);
  const remaining = people.length - previewCount;

  return (
    <Screen contentStyle={{ flexGrow: 1 }}>
      <TopBar back rightIcon="ellipsis-horizontal" />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ gap: 4 }}>
          <Text variant="h1">{flight.code}</Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Verified />
            <Text variant="mono" tone="mute">
              {flight.airline}
            </Text>
          </View>
        </View>
        <Badge status={flight.status}>{flight.status}</Badge>
      </View>

      <Card flat>
        <RouteDisplay from={flight.from} to={flight.to} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="mono" tone="mute">
            {flight.fromCity}
          </Text>
          <Text variant="mono" tone="mute">
            {flight.toCity}
          </Text>
        </View>
        <View style={{ height: 1, backgroundColor: t.colors.rule, marginVertical: 4 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <Text variant="mono" tone="mute">
              Departs
            </Text>
            <Text variant="bodyLg" weight="semibold">
              {flight.dateLong} · {flight.timeLong}
            </Text>
          </View>
          <View style={{ gap: 2 }}>
            <Text variant="mono" tone="mute">
              Duration
            </Text>
            <Text variant="bodyLg" weight="semibold">
              {flight.duration}
            </Text>
          </View>
        </View>
      </Card>

      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="section" tone="mute">
            Your message to travelers
          </Text>
          {!editingMessage && (
            <Pressable onPress={startEditingMessage} hitSlop={6}>
              <Ionicons
                name={flight.flightMessage ? 'pencil' : 'add'}
                size={16}
                color={t.colors.inkMute}
              />
            </Pressable>
          )}
        </View>
        <Card flat>
          {editingMessage ? (
            <View style={{ gap: 10 }}>
              <TextInput
                value={messageDraft}
                onChangeText={setMessageDraft}
                placeholder="Tell other travelers about you for this flight…"
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
                  {messageDraft.length}/300
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button kind="ghost" onPress={cancelMessage}>
                    Cancel
                  </Button>
                  <Button kind="primary" loading={savingMessage} onPress={saveMessage}>
                    Save
                  </Button>
                </View>
              </View>
            </View>
          ) : flight.flightMessage ? (
            <Text variant="body" tone="soft">
              {flight.flightMessage}
            </Text>
          ) : (
            <Pressable onPress={startEditingMessage}>
              <Text variant="body" tone="mute">
                {session?.description
                  ? 'Add a message tailored to this flight. We can start from your profile bio.'
                  : 'Tell others on this flight a bit about you.'}
              </Text>
            </Pressable>
          )}
        </Card>
      </View>

      {people.length > 0 && (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="section" tone="mute">
              People on this flight
            </Text>
            <Text variant="body" tone="soft" style={{ textDecorationLine: 'underline' }} onPress={() => router.push('/(app)/find')}>
              See all {people.length}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {people.slice(0, previewCount).map((p) => (
              <Avatar key={p.id} size={40} initials={p.initials} />
            ))}
            {remaining > 0 && <Avatar size={40} initials={`+${remaining}`} variant="soft" />}
          </View>
        </>
      )}

      <View style={{ flex: 1 }} />

      <Button kind="primary" size="lg" full onPress={() => router.push('/(app)/find')}>
        Find travelers on this flight
      </Button>
    </Screen>
  );
}
