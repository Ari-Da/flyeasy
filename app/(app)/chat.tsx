import { View } from 'react-native';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/ui/TopBar';
import { VerifyBanner } from '@/components/ui/VerifyBanner';
import { ConnectionRow } from '@/components/ConnectionRow';
import { CONNECTIONS, getFlight, getPerson } from '@/data/mock';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

export default function ChatListScreen() {
  const threads = (FEATURE_FLAGS.useMockPeople ? CONNECTIONS : [])
    .map((c) => {
      const person = getPerson(c.personId);
      const flight = getFlight(c.flightId);
      return person && flight ? { connection: c, person, flight } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const hasThreads = threads.length > 0;

  return (
    <Screen scroll={hasThreads} contentStyle={hasThreads ? undefined : { flex: 1 }}>
      <TopBar title="Chats" rightIcon="search" />

      <VerifyBanner icon="information-circle" tone="info">
        Chats stay open until your shared flight lands. After that, history is read-only.
      </VerifyBanner>

      {hasThreads ? (
        <View>
          {threads.map(({ connection, person, flight }) => (
            <ConnectionRow
              key={connection.id}
              connection={connection}
              person={person}
              flight={flight}
              flightSubtitle={
                connection.closed
                  ? `${flight.code} · Closed`
                  : connection.closesIn
                    ? `${flight.code} · Departs in ${connection.closesIn.split(' ')[0]}`
                    : `${flight.code} · ${flight.date}`
              }
            />
          ))}
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
