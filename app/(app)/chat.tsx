import { useCallback, useState } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/ui/TopBar';
import { ConnectionRow } from '@/components/ConnectionRow';
import { fetchChatThreads, type ChatThread } from '@/lib/chat';
import { fetchFlightsByIds } from '@/lib/flights';
import { relativeTime } from '@/lib/time';
import type { Connection, Flight, Person } from '@/types/models';
import { useTheme } from '@/theme';

// INTERIM-POLLING: how often the chat list refetches threads/unread. Remove when
// Supabase Realtime lands (see README "Chat delivery — interim polling").
const LIST_POLL_MS = 10000;

function toPerson(th: ChatThread): Person {
  const name = `${th.firstName} ${th.lastName}`.trim() || 'Traveler';
  const initials = `${th.firstName[0] ?? ''}${th.lastName[0] ?? ''}`.toUpperCase() || '?';
  return {
    id: th.otherUserId,
    name,
    shortName: th.firstName || name,
    initials,
    email: '',
    description: '',
    flightId: th.myFlightId,
    verified: true,
    avatarUrl: th.avatarUrl,
  };
}

export default function ChatListScreen() {
  const t = useTheme();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [flights, setFlights] = useState<Map<string, Flight>>(new Map());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const rows = await fetchChatThreads();
      setThreads(rows);
      setFlights(await fetchFlightsByIds(rows.map((r) => r.myFlightId)));
    } catch {
      // Leave prior state; the empty/loaded UI still renders.
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // INTERIM-POLLING: refresh unread badges / last messages on a timer while the
  // Chats tab is visible. Pauses when backgrounded, stops on blur. Replace with
  // a Supabase Realtime subscription (see README). Remove this whole block then.
  useFocusEffect(
    useCallback(() => {
      let timer: ReturnType<typeof setInterval> | undefined;
      const start = () => {
        if (!timer) timer = setInterval(load, LIST_POLL_MS);
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
    }, [load]),
  );

  if (loading) {
    return (
      <Screen contentStyle={{ flex: 1 }}>
        <TopBar title="Chats" rightIcon="search" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.colors.accent} />
        </View>
      </Screen>
    );
  }

  const hasThreads = threads.length > 0;
  const now = new Date();

  return (
    <Screen scroll={hasThreads} contentStyle={hasThreads ? undefined : { flex: 1 }}>
      <TopBar title="Chats" rightIcon="search" />

      {hasThreads ? (
        <View>
          {threads.map((th) => {
            const flight = flights.get(th.myFlightId);
            const paused = th.iPaused || th.otherPaused;
            const connection: Connection = {
              id: th.id,
              personId: th.otherUserId,
              flightId: th.myFlightId,
              lastMessage: th.lastMessage ?? 'Say hi 👋',
              lastTime: relativeTime(th.lastMessageAt, now),
              unread: th.unreadCount,
              closed: false,
            };
            const routeLabel = flight ? `${flight.code} · ${flight.from}→${flight.to}` : '';
            const subtitle = paused
              ? `${routeLabel}${routeLabel ? ' · ' : ''}Paused`
              : routeLabel || undefined;
            return (
              <ConnectionRow
                key={th.id}
                connection={connection}
                person={toPerson(th)}
                flight={flight}
                flightSubtitle={subtitle}
                unavailable={paused}
              />
            );
          })}
        </View>
      ) : (
        <EmptyState
          icon="chatbubbles-outline"
          title="No chats yet"
          body="Once you connect with someone on a flight, your conversations show up here."
        />
      )}
    </Screen>
  );
}
