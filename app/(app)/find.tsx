import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { PersonCard } from '@/components/PersonCard';
import { ACTIVE_FLIGHT_ID, getFlight, peopleOnFlight, type Flight } from '@/data/mock';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { fetchNextUpcomingFlight } from '@/lib/flights';

type Filter = 'same' | 'nearby';

export default function FindScreen() {
  const t = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('same');
  const [requested, setRequested] = useState<Set<string>>(new Set(['dev']));
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      if (FEATURE_FLAGS.useMockFlights) {
        setFlight(getFlight(ACTIVE_FLIGHT_ID) ?? null);
      } else {
        const next = await fetchNextUpcomingFlight();
        setFlight(next);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your flight.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const toggleRequest = (id: string) => {
    setRequested((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <Screen contentStyle={{ flex: 1 }}>
        <TopBar title="Find Travelers" rightIcon="search" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.colors.accent} />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen contentStyle={{ flex: 1 }}>
        <TopBar title="Find Travelers" rightIcon="search" />
        <EmptyState icon="warning-outline" title="Couldn't load" body={error}>
          <Button kind="primary" size="lg" onPress={load}>Try again</Button>
        </EmptyState>
      </Screen>
    );
  }

  if (!flight) {
    return (
      <Screen contentStyle={{ flex: 1 }}>
        <TopBar title="Find Travelers" rightIcon="search" />
        <EmptyState
          icon="airplane-outline"
          title="No upcoming flight"
          body="Add your flight itinerary to connect with people."
        >
          <Button kind="primary" size="lg" onPress={() => router.push('/flight/add')}>
            + Add a flight
          </Button>
        </EmptyState>
      </Screen>
    );
  }

  const people = FEATURE_FLAGS.useMockPeople ? peopleOnFlight(flight.id) : [];
  const visiblePeople = filter === 'same' ? people : [];
  const showEmpty = visiblePeople.length === 0;

  return (
    <Screen
      scroll={!showEmpty}
      contentStyle={showEmpty ? { flex: 1 } : undefined}
    >
      <TopBar
        title="Find Travelers"
        rightIcon="search"
        subtitle={
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <Text variant="mono" tone="mute">
              FLIGHT ·{' '}
            </Text>
            <Text variant="mono" tone="default">
              {flight.code} · {flight.from}→{flight.to} · {flight.date.replace(/\b(\w)(\w+)/, (_m, a, b) => a + b.toLowerCase())}
            </Text>
          </View>
        }
      />

      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        <Chip active={filter === 'same'} onPress={() => setFilter('same')}>
          {`Same flight · ${people.length}`}
        </Chip>
        <Chip active={filter === 'nearby'} onPress={() => setFilter('nearby')}>
          Nearby
        </Chip>
        <Chip>⇅</Chip>
      </View>

      {showEmpty ? (
        <EmptyState
          icon="people-outline"
          title="You're first!"
          body={
            filter === 'nearby'
              ? 'No nearby travelers yet. Check back closer to your departure.'
              : `No one else on ${flight.code} has joined yet. Check back closer to your departure.`
          }
        />
      ) : (
        <View style={{ gap: 10 }}>
          {visiblePeople.map((p) => (
            <PersonCard
              key={p.id}
              person={p}
              flight={flight}
              requested={requested.has(p.id)}
              onConnect={() => toggleRequest(p.id)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
