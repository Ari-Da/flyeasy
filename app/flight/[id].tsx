import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RouteDisplay } from '@/components/ui/RouteDisplay';
import { Screen } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { Verified } from '@/components/ui/Verified';
import { getFlight, peopleOnFlight, type Flight } from '@/data/mock';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { dbFlightToFlight, fetchDbFlight, type DbFlight } from '@/lib/flights';
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

  const [flight, setFlight] = useState<Flight | null | undefined>(
    FEATURE_FLAGS.useMockFlights && id ? (getFlight(id) ?? null) : undefined,
  );
  const [dbFlight, setDbFlight] = useState<DbFlight | null>(null);

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

      <SuggestionsSection dbFlight={dbFlight} flight={flight} />

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
