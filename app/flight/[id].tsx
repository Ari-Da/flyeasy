import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, TextInput, View } from 'react-native';
import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RouteDisplay } from '@/components/ui/RouteDisplay';
import { Screen } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { getFlight, peopleOnFlight } from '@/data/mock';
import type { Flight, Person } from '@/types/models';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import {
  dbFlightToFlight,
  fetchDbFlight,
  fetchTravelersOnFlight,
  isFlightActive,
  updateFlightMessage,
  type DbFlight,
  type Traveler,
} from '@/lib/flights';
import {
  fetchAirportSuggestions,
  type AirportSuggestion,
  type SuggestionCategory,
} from '@/lib/suggestions';
import { useTheme } from '@/theme';

type SuggestionMode = 'departing' | 'arriving';

const SUGG_OPTIONS = [
  { value: 'departing', label: 'Origin' },
  { value: 'arriving', label: 'Destination' },
] as const;

const CATEGORY_ICON: Record<SuggestionCategory, keyof typeof Ionicons.glyphMap> = {
  food: 'restaurant',
  lounge: 'wine',
  rest: 'bed',
  shop: 'bag',
  attraction: 'star',
};

export default function FlightDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useTheme();
  const { session } = useAuth();

  const [flight, setFlight] = useState<Flight | null | undefined>(
    FEATURE_FLAGS.useMockFlights && id ? (getFlight(id) ?? null) : undefined,
  );
  const [dbFlight, setDbFlight] = useState<DbFlight | null>(null);
  const [travelers, setTravelers] = useState<Traveler[]>([]);

  const [editingMessage, setEditingMessage] = useState(false);
  const [messageDraft, setMessageDraft] = useState('');
  const [savingMessage, setSavingMessage] = useState(false);

  useEffect(() => {
    if (FEATURE_FLAGS.useMockFlights || !id) return;
    let active = true;
    fetchDbFlight(id)
      .then((row) => {
        if (!active) return;
        setDbFlight(row);
        setFlight(row ? dbFlightToFlight(row) : null);
      })
      .catch(() => {
        if (active) setFlight(null);
      });
    return () => {
      active = false;
    };
  }, [id]);

  // Real "people on this flight" preview via the security-definer RPC. Mock mode
  // sources them from fixtures below instead, so skip the fetch there.
  useEffect(() => {
    if (FEATURE_FLAGS.useMockPeople || !id) return;
    let active = true;
    fetchTravelersOnFlight(id)
      .then((rows) => {
        if (active) setTravelers(rows);
      })
      .catch(() => {
        if (active) setTravelers([]);
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
    // Only for current/upcoming flights — no editing a completed or cancelled one.
    if (!flight || !isFlightActive(flight.status)) return;
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

  // Mock fixtures when mocking people; otherwise the real travelers from the RPC,
  // mapped to the same shape the preview renders (mirrors app/(app)/find.tsx).
  const people: Person[] = FEATURE_FLAGS.useMockPeople
    ? peopleOnFlight(flight.id)
    : travelers.map((tr) => {
        const fullName = `${tr.firstName} ${tr.lastName}`.trim() || 'Traveler';
        const initials = `${tr.firstName[0] ?? ''}${tr.lastName[0] ?? ''}`.toUpperCase() || '?';
        return {
          id: tr.userId,
          name: fullName,
          shortName: tr.firstName || fullName,
          initials,
          email: '',
          description: tr.flightMessage?.trim() || tr.description || '',
          flightId: tr.matchedFlightId,
          verified: false,
          avatarUrl: tr.avatarUrl,
        };
      });
  const previewCount = Math.min(4, people.length);
  const remaining = people.length - previewCount;
  // Editing the per-flight message only makes sense for a current/upcoming
  // flight — not a completed or cancelled one.
  const canEditMessage = isFlightActive(flight.status);

  return (
    <Screen
      edges={['top', 'left', 'right', 'bottom']}
      footer={
        <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 8, backgroundColor: t.colors.paper }}>
          <Button kind="primary" size="lg" full onPress={() => router.push('/(app)/find')}>
            Find people on this flight
          </Button>
        </View>
      }
    >
      <TopBar back rightIcon="ellipsis-horizontal" />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ gap: 4 }}>
          <Text variant="h1">{flight.code}</Text>
          <Text variant="mono" tone="mute">
            {flight.airline}
          </Text>
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
          {!editingMessage && canEditMessage && (
            <Pressable onPress={startEditingMessage} hitSlop={8}>
              <Ionicons name="pencil" size={16} color={t.colors.inkMute} />
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
                  <Button kind="ghost" size="sm" onPress={cancelMessage}>
                    Cancel
                  </Button>
                  <Button kind="primary" size="sm" loading={savingMessage} onPress={saveMessage}>
                    Save
                  </Button>
                </View>
              </View>
            </View>
          ) : flight.flightMessage?.trim() || session?.description?.trim() ? (
            // Custom per-flight message, or a fallback to the current bio.
            <Text variant="body" tone="soft">
              {flight.flightMessage?.trim() || session?.description || ''}
            </Text>
          ) : (
            <Text variant="body" tone="mute">
              Tell others on this flight a bit about you.
            </Text>
          )}
        </Card>
      </View>

      {people.length > 0 && (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="section" tone="mute">
              People on this flight
            </Text>
            {remaining > 0 && (
              <Text variant="body" tone="soft" style={{ textDecorationLine: 'underline' }} onPress={() => router.push('/(app)/find')}>
                See all {people.length}
              </Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {people.slice(0, previewCount).map((p) => (
              <View key={p.id} style={{ alignItems: 'center', gap: 6, width: 52 }}>
                <Avatar size={44} initials={p.initials} uri={p.avatarUrl ?? undefined} />
                <Text variant="caption" tone="soft" numberOfLines={1} style={{ maxWidth: 52, textAlign: 'center' }}>
                  {p.shortName}
                </Text>
              </View>
            ))}
            {remaining > 0 && (
              <View style={{ alignItems: 'center', gap: 6, width: 52 }}>
                <Avatar size={44} initials={`+${remaining}`} variant="soft" />
                <Text variant="caption" tone="mute" numberOfLines={1}>
                  more
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      <SuggestionsSection dbFlight={dbFlight} flight={flight} />

    </Screen>
  );
}

function SuggestionsSection({ dbFlight, flight }: { dbFlight: DbFlight | null; flight: Flight }) {
  const t = useTheme();
  const [mode, setMode] = useState<SuggestionMode>('arriving');
  const [suggestions, setSuggestions] = useState<AirportSuggestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hoursUntilFlight = useMemo(() => {
    if (!dbFlight) return null;
    const ms = new Date(dbFlight.scheduled_departure_utc).getTime() - Date.now();
    if (ms <= 0) return null;
    return Math.round(ms / (1000 * 60 * 60));
  }, [dbFlight]);

  function onModeChange(next: SuggestionMode) {
    setMode(next);
    setSuggestions(null);
    setError(null);
  }

  async function load() {
    setLoading(true);
    setError(null);
    setSuggestions(null);
    try {
      const ctx = dbFlight
        ? mode === 'departing'
          ? {
              airportIata: dbFlight.origin_iata,
              airportName: dbFlight.origin_name,
              airportCity: dbFlight.origin_city,
              terminal: dbFlight.origin_terminal,
              mode,
              hoursUntilFlight,
            }
          : {
              airportIata: dbFlight.destination_iata,
              airportName: dbFlight.destination_name,
              airportCity: dbFlight.destination_city,
              terminal: dbFlight.destination_terminal,
              mode,
              hoursUntilFlight,
            }
        : {
            airportIata: mode === 'departing' ? flight.from : flight.to,
            airportName: mode === 'departing' ? flight.fromCity : flight.toCity,
            airportCity: mode === 'departing' ? flight.fromCity : flight.toCity,
            terminal: null,
            mode,
            hoursUntilFlight: null,
          };
      const result = await fetchAirportSuggestions(ctx);
      setSuggestions(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="section" tone="mute">
          Things to do
        </Text>
        <Segmented options={SUGG_OPTIONS} value={mode} onChange={onModeChange} />
      </View>

      {!suggestions && !loading && !error && (
        <Button kind="secondary" size="md" full onPress={load}>
          {`Suggest spots at ${mode === 'departing' ? flight.from : flight.to}`}
        </Button>
      )}

      {loading && (
        <Card flat>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <ActivityIndicator color={t.colors.accent} />
            <Text variant="body" tone="mute">
              Generating suggestions…
            </Text>
          </View>
        </Card>
      )}

      {error && (
        <Card flat>
          <Text variant="body">{error}</Text>
          <Button kind="ghost" size="sm" onPress={load}>
            Try again
          </Button>
        </Card>
      )}

      {suggestions?.map((s, i) => (
        <Card key={`${s.name}-${i}`}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: t.colors.paper2,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={CATEGORY_ICON[s.category]} size={16} color={t.colors.ink} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="bodyLg" weight="semibold">
                {s.name}
              </Text>
              <Text variant="body" tone="mute">
                {s.description}
              </Text>
              <Text variant="mono" tone="soft">
                {s.walkingTime}
              </Text>
            </View>
          </View>
        </Card>
      ))}
    </>
  );
}
