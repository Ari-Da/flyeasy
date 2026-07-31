import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, AppState, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { VerifyBanner } from '@/components/ui/VerifyBanner';
import { FlightChips } from '@/components/FlightChips';
import { ConnectionRow } from '@/components/ConnectionRow';
import { RequestRow } from '@/components/RequestRow';
import { CONNECTIONS, REQUESTS, getFlight, getPerson } from '@/data/mock';
import type { Connection, Flight, Person } from '@/types/models';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import {
  fetchMyConnections,
  respondToRequest,
  withdrawRequest,
  type MyConnection,
} from '@/lib/connections';
import { fetchChatThreads, type ChatThread } from '@/lib/chat';
import { fetchUpcomingFlights } from '@/lib/flights';
import { relativeTime } from '@/lib/time';
import { useTheme } from '@/theme';

// INTERIM-POLLING: how often the Connected tab refreshes unread/last-message.
// Remove when Supabase Realtime lands (see README "Chat delivery — interim polling").
const UNREAD_POLL_MS = 10000;

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
    verified: false, // no real user verification yet — see find.tsx
    avatarUrl: c.avatarUrl,
  };
}

/** Adapt a connection to the shape ConnectionRow expects, merging in chat state
 * (unread count, last message, time) when a thread for it exists. */
function toConnectionRow(c: MyConnection, chat: ChatThread | undefined, now: Date): Connection {
  return {
    id: c.id,
    personId: c.otherUserId,
    flightId: c.myFlightId,
    lastMessage: chat?.lastMessage ?? "You're connected.",
    lastTime: relativeTime(chat?.lastMessageAt ?? null, now),
    unread: chat?.unreadCount ?? 0,
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
        otherAvailable: true,
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
      otherAvailable: true,
      myFlightId: c.flightId, message: null, createdAt: '',
    };
  }).filter((x): x is MyConnection => x !== null);
  return [...requests, ...connected];
}

export default function ConnectionsScreen() {
  const t = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  // While the user has paused connecting, incoming requests are frozen: still
  // listed, but Accept/Decline are disabled until they turn availability back on.
  const iAmAvailable = session?.availableToConnect ?? true;
  const [tab, setTab] = useState<Tab>('requests');
  const [upcomingFlights, setUpcomingFlights] = useState<Flight[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [connections, setConnections] = useState<MyConnection[]>([]);
  // Chat threads keyed by connection id — supplies unread/last-message for the
  // Connected tab. Same source as the Chat tab (list_my_chats).
  const [chats, setChats] = useState<Map<string, ChatThread>>(new Map());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refresh just the chat threads (unread/last message). Cheap enough to poll.
  const loadChats = useCallback(async () => {
    if (FEATURE_FLAGS.useMockPeople) return;
    try {
      const threads = await fetchChatThreads();
      setChats(new Map(threads.map((th) => [th.id, th])));
    } catch {
      // Non-fatal: rows just fall back to the "You're connected." placeholder.
    }
  }, []);

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
      loadChats();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load connections.');
    } finally {
      setLoading(false);
    }
  }, [loadChats]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // INTERIM-POLLING: refresh unread/last-message on the Connected tab while
  // visible. Pauses when backgrounded, stops on blur. Replace with a Supabase
  // Realtime subscription (see README). Remove this whole block then.
  useFocusEffect(
    useCallback(() => {
      if (FEATURE_FLAGS.useMockPeople) return;
      let timer: ReturnType<typeof setInterval> | undefined;
      const start = () => {
        if (!timer) timer = setInterval(loadChats, UNREAD_POLL_MS);
      };
      const stop = () => {
        if (timer) {
          clearInterval(timer);
          timer = undefined;
        }
      };
      start();
      const sub = AppState.addEventListener('change', (s) => (s === 'active' ? start() : stop()));
      return () => {
        stop();
        sub.remove();
      };
    }, [loadChats]),
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
  const now = new Date();

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

      {/* Page-level, not per-row: one banner explains the frozen state for the
          whole screen. */}
      {!iAmAvailable && (
        <VerifyBanner icon="pause" tone="info">
          You&apos;ve paused connecting. Existing requests and connections are kept, but
          on hold — turn &quot;Available to connect&quot; back on in your profile to respond.
        </VerifyBanner>
      )}

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
                  disabled={!iAmAvailable}
                  unavailable={!c.otherAvailable}
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
                  unavailable={!c.otherAvailable}
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
                connection={toConnectionRow(c, chats.get(c.id), now)}
                person={toPerson(c)}
                // Flight is already shown in the chips above — omit it from the row.
                flightSubtitle=""
                unavailable={!c.otherAvailable}
                onPress={() => router.push(`/chat/${c.id}`)}
              />
            );
          })}
        </View>
      )}
    </Screen>
  );
}
