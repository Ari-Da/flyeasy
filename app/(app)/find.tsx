import { FlightChips } from '@/components/FlightChips';
import { PersonCard, type ConnectState } from '@/components/PersonCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { ACTIVE_FLIGHT_ID, FLIGHTS, getFlight, peopleOnFlight, type Flight, type Person } from '@/data/mock';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import {
  fetchMyConnections,
  respondToRequest,
  sendConnectionRequest,
  withdrawRequest,
  type MyConnection,
} from '@/lib/connections';
import { fetchTravelersOnFlight, fetchUpcomingFlights, type Traveler } from '@/lib/flights';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

export default function FindScreen() {
  const t = useTheme();
  const router = useRouter();
  // Mock-mode only: ephemeral "requested" set. Real mode uses `connections`.
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [upcomingFlights, setUpcomingFlights] = useState<Flight[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [connections, setConnections] = useState<MyConnection[]>([]);
  // Person id whose Connect/Accept action is currently in flight.
  const [busyId, setBusyId] = useState<string | null>(null);
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

  // All of the caller's connections (any flight). Filtered per-flight in the UI.
  const loadConnections = useCallback(async () => {
    if (FEATURE_FLAGS.useMockPeople) return;
    try {
      setConnections(await fetchMyConnections());
    } catch {
      // Non-fatal: the list still renders; buttons just fall back to "Connect".
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
      await loadConnections();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your flights.');
    } finally {
      setLoading(false);
    }
  }, [loadTravelers, loadConnections]);

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

  // The caller's connection with each person, scoped to the selected flight
  // (`myFlightId` is always the caller's own flight row).
  const connByUser = useMemo(() => {
    const m = new Map<string, MyConnection>();
    for (const c of connections) {
      if (c.myFlightId === selectedFlightId) m.set(c.otherUserId, c);
    }
    return m;
  }, [connections, selectedFlightId]);

  const connectStateFor = (personId: string): ConnectState => {
    if (FEATURE_FLAGS.useMockPeople) return requested.has(personId) ? 'requested' : 'none';
    const c = connByUser.get(personId);
    if (!c) return 'none';
    if (c.status === 'accepted') return 'connected';
    if (c.status === 'pending') return c.direction === 'outgoing' ? 'requested' : 'incoming';
    // declined: the addressee (incoming) declined and may re-connect; the
    // requester (outgoing) was declined and sees an inert "Declined".
    return c.direction === 'incoming' ? 'reconnect' : 'declined';
  };

  // Send / re-send a request. In mock mode this is just the local toggle.
  const onConnect = async (personId: string) => {
    if (FEATURE_FLAGS.useMockPeople) {
      setRequested((prev) => new Set(prev).add(personId));
      return;
    }
    if (!selectedFlightId) return;
    setBusyId(personId);
    try {
      await sendConnectionRequest(personId, selectedFlightId);
      await loadConnections();
    } catch (e) {
      Alert.alert('Could not connect', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const onAccept = async (personId: string) => {
    const c = connByUser.get(personId);
    if (!c) return;
    setBusyId(personId);
    try {
      await respondToRequest(c.id, true);
      await loadConnections();
    } catch (e) {
      Alert.alert('Could not accept', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  // Undo an outgoing request. Confirmed first — it's destructive from the other
  // person's side (the request disappears from their Requests tab).
  const onWithdraw = (personId: string) => {
    if (FEATURE_FLAGS.useMockPeople) {
      setRequested((prev) => {
        const next = new Set(prev);
        next.delete(personId);
        return next;
      });
      return;
    }
    const c = connByUser.get(personId);
    if (!c) return;
    Alert.alert('Withdraw request?', 'They will no longer see your connection request.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: async () => {
          setBusyId(personId);
          try {
            await withdrawRequest(c.id);
            await loadConnections();
          } catch (e) {
            Alert.alert('Could not withdraw', e instanceof Error ? e.message : 'Please try again.');
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
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

      <FlightChips flights={upcomingFlights} selectedId={selectedFlightId} onSelect={onSelectFlight} />

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
              connectState={connectStateFor(p.id)}
              busy={busyId === p.id}
              onConnect={() => onConnect(p.id)}
              onAccept={() => onAccept(p.id)}
              onWithdraw={() => onWithdraw(p.id)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
