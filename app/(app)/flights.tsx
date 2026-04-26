import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/ui/TopBar';
import { FlightRow } from '@/components/FlightRow';
import { FLIGHTS, type FlightStatus } from '@/data/mock';

type FilterKey = 'all' | 'future' | 'ongoing' | 'past';

const STATUS_FOR_FILTER: Record<FilterKey, FlightStatus[] | null> = {
  all: null,
  future: ['new', 'delayed'],
  ongoing: ['ongoing'],
  past: ['complete'],
};

export default function FlightsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [showEmpty, setShowEmpty] = useState(false);

  const allowed = STATUS_FOR_FILTER[filter];
  const q = search.trim().toLowerCase();
  const flights = showEmpty
    ? []
    : FLIGHTS.filter((f) => {
        if (allowed && !allowed.includes(f.status)) return false;
        if (!q) return true;
        return (
          f.code.toLowerCase().includes(q) ||
          f.from.toLowerCase().includes(q) ||
          f.to.toLowerCase().includes(q) ||
          f.fromCity.toLowerCase().includes(q) ||
          f.toCity.toLowerCase().includes(q)
        );
      });

  return (
    <Screen scroll={flights.length > 0} contentStyle={flights.length === 0 ? { flex: 1 } : undefined}>
      <TopBar
        title="My Flights"
        rightIcon="add"
        onRightPress={() => router.push('/flight/add')}
      />

      <Input
        dense
        icon="search"
        placeholder="Search flight # or city…"
        value={search}
        onChangeText={setSearch}
      />

      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        <Chip active={filter === 'all'} onPress={() => { setFilter('all'); setShowEmpty(false); }}>
          All
        </Chip>
        <Chip active={filter === 'future'} onPress={() => { setFilter('future'); setShowEmpty(false); }}>
          Future
        </Chip>
        <Chip active={filter === 'ongoing'} onPress={() => { setFilter('ongoing'); setShowEmpty(false); }}>
          Ongoing
        </Chip>
        <Chip active={filter === 'past'} onPress={() => { setFilter('past'); setShowEmpty(false); }}>
          Past
        </Chip>
      </View>

      {flights.length === 0 ? (
        <EmptyState
          icon="airplane-outline"
          title="No flights yet"
          body="Add a flight to start meeting people who are taking the same one as you."
        >
          <Button kind="primary" size="lg" onPress={() => router.push('/flight/add')}>
            + Add your first flight
          </Button>
        </EmptyState>
      ) : (
        <View style={{ gap: 8 }}>
          {flights.map((f) => (
            <FlightRow key={f.id} flight={f} onDelete={() => setShowEmpty(false)} />
          ))}
        </View>
      )}
    </Screen>
  );
}
