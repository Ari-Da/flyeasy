import { useAuth } from '@/auth/AuthContext';
import { FlightChips } from '@/components/FlightChips';
import { PersonCard, type ConnectState } from '@/components/PersonCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import type { Flight, Person } from '@/types/models';
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
  const { session } = useAuth();
  const [upcomingFlights, setUpcomingFlights] = useState<Flight[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [connections, setConnections] = useState<MyConnection[]>([]);
  // Person id whose Connect/Accept action is currently in flight.
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTravelers, setLoadingTravelers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Reveal-on-tap name search over the current flight's travelers.
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const loadTravelers = useCallback(async (flightId: string) => {
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
    try {
      setConnections(await fetchMyConnections());
    } catch {
      // Non-fatal: the list still renders; buttons just fall back to "Connect".
    }
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const flights = await fetchUpcomingFlights();
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
    const c = connByUser.get(personId);
    if (!c) return 'none';
    if (c.status === 'accepted') return 'connected';
    if (c.status === 'pending') return c.direction === 'outgoing' ? 'requested' : 'incoming';
    // declined: the addressee (incoming) declined and may re-connect; the
    // requester (outgoing) was declined and sees an inert "Declined".
    return c.direction === 'incoming' ? 'reconnect' : 'declined';
  };

  // Send / re-send a request.
  const onConnect = async (personId: string) => {
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

  const allPeople: Person[] = travelers.map((tr) => {
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
          // No real user verification exists yet (planned: boarding-pass / BCBP
          // check). Kept as a flag so the Verified badge lights up automatically
          // once we can set this from real data — false means it stays hidden.
          verified: false,
          avatarUrl: tr.avatarUrl,
        };
      });
  // Find is for discovering NEW connections — hide people we're already
  // connected (accepted) with; they live in Connections/Chat now. Pending and
  // declined states stay so they can still be acted on here.
  const people = allPeople.filter((p) => connectStateFor(p.id) !== 'connected');
  const showEmpty = people.length === 0;
  // Everyone on the flight is already a connection (vs. a genuinely empty flight).
  const allConnected = showEmpty && allPeople.length > 0;

  // Name search over the (already flight-scoped) list. Only applies while the
  // search field is open with a non-empty query.
  const nameQuery = searching ? query.trim().toLowerCase() : '';
  const filteredPeople = nameQuery
    ? people.filter((p) => p.name.toLowerCase().includes(nameQuery))
    : people;

  const closeSearch = () => {
    setSearching(false);
    setQuery('');
  };

  return (
    <Screen
      scroll={!showEmpty}
      contentStyle={showEmpty ? { flex: 1 } : undefined}
    >
      <TopBar
        title="Find Travelers"
        rightIcon={searching ? 'close' : 'search'}
        onRightPress={() => (searching ? closeSearch() : setSearching(true))}
      />

      {searching && (
        <Input
          dense
          icon="search"
          placeholder="Search travelers by name…"
          value={query}
          onChangeText={setQuery}
          autoFocus
          autoCorrect={false}
        />
      )}

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
        // Pausing availability also hides everyone else from you, so say why
        // rather than implying the flight is empty.
        session && !session.availableToConnect ? (
          <EmptyState
            icon="pause-circle-outline"
            title="You've paused connecting"
            body='Turn "Available to connect" back on in your profile to see travelers on this flight.'
          >
            <Button kind="primary" size="lg" onPress={() => router.push('/(app)/me')}>
              Go to profile
            </Button>
          </EmptyState>
        ) : allConnected ? (
          <EmptyState
            icon="checkmark-done-outline"
            title="You're all connected"
            body={`You've connected with everyone on ${selectedFlight.code} so far. Check your chats to keep the conversation going.`}
          />
        ) : (
          <EmptyState
            icon="people-outline"
            title="You're first!"
            body={`No one else on ${selectedFlight.code} has joined yet. Check back closer to your departure.`}
          />
        )
      ) : filteredPeople.length === 0 ? (
        <Text variant="body" tone="mute" align="center" style={{ marginTop: 16 }}>
          No travelers match “{query.trim()}”.
        </Text>
      ) : (
        <View style={{ gap: 10 }}>
          {filteredPeople.map((p) => (
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
