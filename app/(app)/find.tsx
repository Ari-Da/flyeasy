import { PersonCard } from '@/components/PersonCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { ACTIVE_FLIGHT_ID, FLIGHTS, getFlight, peopleOnFlight, type Flight, type Person } from '@/data/mock';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { fetchTravelersOnFlight, fetchUpcomingFlights, type Traveler } from '@/lib/flights';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

export default function FindScreen() {
  const t = useTheme();
  const router = useRouter();
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [upcomingFlights, setUpcomingFlights] = useState<Flight[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTravelers, setLoadingTravelers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTravelers = useCallback(async (flightId: string) => {
    if (FEATURE_FLAGS.useMockPeople) {
      setTravelers([]);
      return;
    }
    setLoadingTravelers(true);
    try {
      const rows = await fetchTravelersOnFlight(flightId);
      setTravelers(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load travelers.');
    } finally {
      setLoadingTravelers(false);
    }
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      let flights: Flight[];
      if (FEATURE_FLAGS.useMockFlights) {
        const mockFlight = getFlight(ACTIVE_FLIGHT_ID);
        flights = mockFlight ? [mockFlight] : FLIGHTS;
      } else {
        flights = await fetchUpcomingFlights();
      }
      setUpcomingFlights(flights);

      const nextId = flights[0]?.id ?? null;
      setSelectedFlightId(nextId);
      if (nextId) {
        await loadTravelers(nextId);
      } else {
        setTravelers([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your flights.');
    } finally {
      setLoading(false);
    }
  }, [loadTravelers]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onSelectFlight = (id: string) => {
    if (id === selectedFlightId) return;
    setSelectedFlightId(id);
    setTravelers([]);
    loadTravelers(id);
  };

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

  const selectedFlight = upcomingFlights.find((f) => f.id === selectedFlightId) ?? null;

  if (!selectedFlight) {
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

  const people: Person[] = FEATURE_FLAGS.useMockPeople
    ? peopleOnFlight(selectedFlight.id)
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
          verified: true,
        };
      });
  const showEmpty = people.length === 0;

  return (
    <Screen
      scroll={!showEmpty}
      contentStyle={showEmpty ? { flex: 1 } : undefined}
    >
      <TopBar title="Find Travelers" rightIcon="search" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingRight: 8 }}
        style={{ flexGrow: 0 }}
      >
        {upcomingFlights.map((f) => {
          const niceDate = f.date.replace(/\b([A-Z])([A-Z]+)/g, (_, a, b) => a + b.toLowerCase());
          return (
            <Chip
              key={f.id}
              active={f.id === selectedFlightId}
              onPress={() => onSelectFlight(f.id)}
            >
              {`${f.code} · ${niceDate}, ${f.time.toUpperCase()}`}
            </Chip>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text variant="mono" tone="mute">
          {selectedFlight.from} ({selectedFlight.fromCity})
        </Text>
        <Ionicons
          name="airplane"
          size={14}
          color={t.colors.inkMute}
          style={{ transform: [{ rotate: '0deg' }] }}
        />
        <Text variant="mono" tone="mute">
          {selectedFlight.to} ({selectedFlight.toCity})
        </Text>
      </View>

      {loadingTravelers ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.colors.accent} />
        </View>
      ) : showEmpty ? (
        <EmptyState
          icon="people-outline"
          title="You're first!"
          body={`No one else on ${selectedFlight.code} has joined yet. Check back closer to your departure.`}
        />
      ) : (
        <View style={{ gap: 10 }}>
          {people.map((p) => (
            <PersonCard
              key={p.id}
              person={p}
              flight={selectedFlight}
              requested={requested.has(p.id)}
              onConnect={() => toggleRequest(p.id)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
