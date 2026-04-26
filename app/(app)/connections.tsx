import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { TopBar } from '@/components/ui/TopBar';
import { ConnectionRow } from '@/components/ConnectionRow';
import { RequestRow } from '@/components/RequestRow';
import {
  CONNECTIONS,
  REQUESTS,
  getFlight,
  getPerson,
  type ConnectionRequest,
} from '@/data/mock';

type Tab = 'requests' | 'connected';

export default function ConnectionsScreen() {
  const [tab, setTab] = useState<Tab>('requests');
  const [requests, setRequests] = useState<ConnectionRequest[]>(REQUESTS);

  const acceptedConnections = useMemo(
    () =>
      CONNECTIONS.map((c) => {
        const person = getPerson(c.personId);
        const flight = getFlight(c.flightId);
        return person && flight ? { connection: c, person, flight } : null;
      }).filter((x): x is NonNullable<typeof x> => x !== null),
    [],
  );

  const pendingRequests = useMemo(
    () =>
      requests
        .filter((r) => r.status === 'pending')
        .map((r) => {
          const person = getPerson(r.fromPersonId);
          const flight = person ? getFlight(person.flightId) : undefined;
          return person && flight ? { request: r, person, flight } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [requests],
  );

  const respondTo = (id: string, accept: boolean) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: accept ? 'accepted' : 'declined' } : r)),
    );
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
        <View style={{ gap: 10 }}>
          {pendingRequests.map(({ request, person, flight }) => (
            <RequestRow
              key={request.id}
              person={person}
              flight={flight}
              message={request.message}
              onAccept={() => respondTo(request.id, true)}
              onDecline={() => respondTo(request.id, false)}
            />
          ))}
        </View>
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
