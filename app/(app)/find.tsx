import { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { PersonCard } from '@/components/PersonCard';
import { ACTIVE_FLIGHT_ID, getFlight, peopleOnFlight } from '@/data/mock';

type Filter = 'same' | 'nearby';

export default function FindScreen() {
  const t = useTheme();
  const [filter, setFilter] = useState<Filter>('same');
  const [requested, setRequested] = useState<Set<string>>(new Set(['dev']));

  const flight = getFlight(ACTIVE_FLIGHT_ID)!;
  const people = peopleOnFlight(flight.id);

  // Nearby filter is empty in our mock dataset — used to demo the empty state.
  const showEmpty = filter === 'nearby';

  const toggleRequest = (id: string) => {
    setRequested((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Screen
      scroll={!showEmpty}
      contentStyle={showEmpty ? { flex: 1 } : undefined}
    >
      <TopBar
        title="Find People"
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
          body={`No one else on ${flight.code} has joined yet. We'll notify you as soon as someone matches.`}
        >
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <Button kind="ghost">Notify me</Button>
            <Button kind="primary">Invite a friend</Button>
          </View>
        </EmptyState>
      ) : (
        <View style={{ gap: 10 }}>
          {people.map((p) => (
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
