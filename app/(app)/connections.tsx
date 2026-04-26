import { useState } from 'react';
import { View } from 'react-native';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { TopBar } from '@/components/ui/TopBar';
import { ConnectionRow } from '@/components/ConnectionRow';
import { RequestRow } from '@/components/RequestRow';
import { CONNECTIONS, REQUESTS, getFlight, getPerson } from '@/data/mock';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

type Tab = 'requests' | 'connected';

export default function ConnectionsScreen() {
  const [tab, setTab] = useState<Tab>('requests');
  const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set());

  const sourceRequests = FEATURE_FLAGS.useMockPeople ? REQUESTS : [];
  const sourceConnections = FEATURE_FLAGS.useMockPeople ? CONNECTIONS : [];

  const acceptedConnections = sourceConnections
    .map((c) => {
      const person = getPerson(c.personId);
      const flight = getFlight(c.flightId);
      return person && flight ? { connection: c, person, flight } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const pendingRequests = sourceRequests
    .filter((r) => r.status === 'pending' && !respondedIds.has(r.id))
    .map((r) => {
      const person = getPerson(r.fromPersonId);
      const flight = person ? getFlight(person.flightId) : undefined;
      return person && flight ? { request: r, person, flight } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const respondTo = (id: string) => {
    setRespondedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const options = [
    { value: 'requests', label: `Requests · ${pendingRequests.length}` },
    { value: 'connected', label: `Connected · ${acceptedConnections.length}` },
  ] as const;

  return (
    <Screen scroll>
      <TopBar title="Connections" />

      <View style={{ alignItems: 'flex-start' }}>
        <Segmented options={options} value={tab} onChange={setTab} />
      </View>

      {tab === 'requests' ? (
        pendingRequests.length === 0 ? (
          <EmptyState
            icon="mail-outline"
            title="No requests yet"
            body="When someone on your flight wants to connect, you'll see them here."
          />
        ) : (
          <View style={{ gap: 10 }}>
            {pendingRequests.map(({ request, person, flight }) => (
              <RequestRow
                key={request.id}
                person={person}
                flight={flight}
                message={request.message}
                onAccept={() => respondTo(request.id)}
                onDecline={() => respondTo(request.id)}
              />
            ))}
          </View>
        )
      ) : acceptedConnections.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No connections yet"
          body="Accept a request or connect on a flight to start chatting."
        />
      ) : (
        <View>
          {acceptedConnections.map(({ connection, person, flight }) => (
            <ConnectionRow key={connection.id} connection={connection} person={person} flight={flight} />
          ))}
        </View>
      )}
    </Screen>
  );
}
