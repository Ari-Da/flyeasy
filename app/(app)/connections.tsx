import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { FlightChips } from '@/components/FlightChips';
import { ConnectionRow } from '@/components/ConnectionRow';
import { RequestRow } from '@/components/RequestRow';
import {
  CONNECTIONS,
  REQUESTS,
  getFlight,
  getPerson,
  type Connection,
  type Flight,
  type Person,
} from '@/data/mock';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import {
  fetchMyConnections,
  respondToRequest,
  withdrawRequest,
  type MyConnection,
} from '@/lib/connections';
import { fetchUpcomingFlights } from '@/lib/flights';
import { useTheme } from '@/theme';

type Tab = 'requests' | 'connected';

/** Build the person shown in a row from the connection's enriched profile. */
function toPerson(c: MyConnection): Person {
  const name = `${c.firstName} ${c.lastName}`.trim() || 'Traveler';
  const initials = `${c.firstName[0] ?? ''}${c.lastName[0] ?? ''}`.toUpperCase() || '?';
  return {
    id: c.otherUserId,
    name,
    shortName: c.firstName || name,
    initials,
    email: '',
    description: c.description || '',
    flightId: c.myFlightId,
    verified: true,
  };
}

/** Adapt a connection to the shape ConnectionRow expects. Chat isn't wired yet,
 * so message/time/unread are placeholders until that feature lands. */
function toConnectionRow(c: MyConnection): Connection {
  return {
    id: c.id,
    personId: c.otherUserId,
    flightId: c.myFlightId,
    lastMessage: "You're connected.",
    lastTime: '',
    unread: 0,
    closed: false,
  };
}

/** Mock-mode fallback: map the mock REQUESTS/CONNECTIONS into the unified shape
 * so the rest of the screen has one code path. */
function mockConnections(): MyConnection[] {
  const split = (full: string) => {
    const [first, ...rest] = full.split(' ');
    return { first: first ?? '', last: rest.join(' ') };
  };
  const requests = REQUESTS.filter((r) => r.status === 'pending')
    .map((r): MyConnection | null => {
      const p = getPerson(r.fromPersonId);
      if (!p) return null;
      const { first, last } = split(p.name);
      return {
        id: r.id, status: 'pending', direction: 'incoming', otherUserId: p.id,
        firstName: first, lastName: last, description: p.description, avatarUrl: null,
        myFlightId: p.flightId, message: r.message, createdAt: '',
      };
    })
    .filter((x): x is MyConnection => x !== null);
  const connected = CONNECTIONS.map((c): MyConnection | null => {
    const p = getPerson(c.personId);
    if (!p) return null;
    const { first, last } = split(p.name);
    return {
      id: c.id, status: 'accepted', direction: 'outgoing', otherUserId: p.id,
      firstName: first, lastName: last, description: p.description, avatarUrl: null,
      myFlightId: c.flightId, message: null, createdAt: '',
    };
  }).filter((x): x is MyConnection => x !== null);
  return [...requests, ...connected];
}

export default function ConnectionsScreen() {
  const t = useTheme();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('requests');
  const [upcomingFlights, setUpcomingFlights] = useState<Flight[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [connections, setConnections] = useState<MyConnection[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      if (FEATURE_FLAGS.useMockPeople) {
        setUpcomingFlights([]);
        setConnections(mockConnections());
        return;
      }
      const [flights, conns] = await Promise.all([fetchUpcomingFlights(), fetchMyConnections()]);
      setUpcomingFlights(flights);
      setSelectedFlightId((prev) => prev ?? flights[0]?.id ?? null);
      setConnections(conns);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load connections.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const respond = async (c: MyConnection, accept: boolean) => {
    if (FEATURE_FLAGS.useMockPeople) {
      // Local only: accept keeps it (as connected), decline drops it.
      setConnections((prev) =>
        accept
          ? prev.map((x) => (x.id === c.id ? { ...x, status: 'accepted' } : x))
          : prev.filter((x) => x.id !== c.id),
      );
      return;
    }
    setBusyId(c.id);
    try {
      await respondToRequest(c.id, accept);
      await load();
    } catch (e) {
      Alert.alert('Something went wrong', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  /** Undo a request the user sent. Confirmed — it disappears for the other side. */
  const withdraw = (c: MyConnection) => {
    if (FEATURE_FLAGS.useMockPeople) {
      setConnections((prev) => prev.filter((x) => x.id !== c.id));
      return;
    }
    Alert.alert('Withdraw request?', 'They will no longer see your connection request.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: async () => {
          setBusyId(c.id);
          try {
            await withdrawRequest(c.id);
            await load();
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
        <TopBar title="Connections" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.colors.accent} />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen contentStyle={{ flex: 1 }}>
        <TopBar title="Connections" />
        <EmptyState icon="warning-outline" title="Couldn't load" body={error}>
          <Button kind="primary" size="lg" onPress={load}>Try again</Button>
        </EmptyState>
      </Screen>
    );
  }

  // In real mode, scope to the selected flight chip. In mock mode there are no
  // chips, so everything is shown.
  const visible = connections.filter(
    (c) => FEATURE_FLAGS.useMockPeople || c.myFlightId === selectedFlightId,
  );
  const incoming = visible.filter((c) => c.status === 'pending' && c.direction === 'incoming');
  const outgoing = visible.filter((c) => c.status === 'pending' && c.direction === 'outgoing');
  const accepted = visible.filter((c) => c.status === 'accepted');
  const pendingCount = incoming.length + outgoing.length;

  // The flight shown on each row. Real: the selected (shared) flight; every
  // visible connection is on it. Mock: look up the connection's own flight.
  const selectedFlight = upcomingFlights.find((f) => f.id === selectedFlightId) ?? null;
  const flightFor = (c: MyConnection): Flight | undefined =>
    FEATURE_FLAGS.useMockPeople ? getFlight(c.myFlightId) : selectedFlight ?? undefined;

  const options = [
    { value: 'requests', label: `Requests · ${pendingCount}` },
    { value: 'connected', label: `Connected · ${accepted.length}` },
  ] as const;

  const hasContent = tab === 'requests' ? pendingCount > 0 : accepted.length > 0;

  return (
    <Screen scroll={hasContent} contentStyle={hasContent ? undefined : { flex: 1 }}>
      <TopBar title="Connections" />

      {upcomingFlights.length > 0 && (
        <FlightChips
          flights={upcomingFlights}
          selectedId={selectedFlightId}
          onSelect={setSelectedFlightId}
        />
      )}

      <View style={{ alignItems: 'flex-start' }}>
        <Segmented options={options} value={tab} onChange={setTab} />
      </View>

      {tab === 'requests' ? (
        pendingCount === 0 ? (
          <EmptyState
            icon="mail-outline"
            title="No requests yet"
            body="When someone on your flight wants to connect, you'll see them here."
          />
        ) : (
          <View style={{ gap: 10 }}>
            {incoming.length > 0 && (
              <Text variant="section" tone="mute">
                Received
              </Text>
            )}
            {incoming.map((c) => {
              const flight = flightFor(c);
              if (!flight) return null;
              return (
                <RequestRow
                  key={c.id}
                  person={toPerson(c)}
                  flight={flight}
                  message={c.message || toPerson(c).description}
                  onAccept={() => respond(c, true)}
                  onDecline={() => respond(c, false)}
                />
              );
            })}

            {outgoing.length > 0 && (
              <Text variant="section" tone="mute" style={{ marginTop: incoming.length > 0 ? 6 : 0 }}>
                Sent
              </Text>
            )}
            {outgoing.map((c) => {
              const flight = flightFor(c);
              if (!flight) return null;
              return (
                <RequestRow
                  key={c.id}
                  person={toPerson(c)}
                  flight={flight}
                  message={c.message || toPerson(c).description}
                  onWithdraw={() => withdraw(c)}
                />
              );
            })}
          </View>
        )
      ) : accepted.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No connections yet"
          body="Accept a request or connect on a flight to start chatting."
        />
      ) : (
        <View>
          {accepted.map((c) => {
            const flight = flightFor(c);
            if (!flight) return null;
            return (
              <ConnectionRow
                key={c.id}
                connection={toConnectionRow(c)}
                person={toPerson(c)}
                flight={flight}
                onPress={() => router.push(`/user/${c.otherUserId}`)}
              />
            );
          })}
        </View>
      )}
    </Screen>
  );
}
