import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { FlightRow } from '@/components/FlightRow';
import { FLIGHTS, type Flight } from '@/data/mock';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { deleteFlight, fetchUserFlights, FLIGHT_STATUS, type FlightStatus } from '@/lib/flights';
import { useTheme } from '@/theme';

type FilterKey = 'all' | 'future' | 'ongoing' | 'past';

const STATUS_FOR_FILTER: Record<FilterKey, FlightStatus[] | null> = {
  all: null,
  future: [FLIGHT_STATUS.NEW, FLIGHT_STATUS.DELAYED],
  ongoing: [FLIGHT_STATUS.ONGOING],
  past: [FLIGHT_STATUS.COMPLETE],
};

export default function FlightsScreen() {
  const t = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      if (FEATURE_FLAGS.useMockFlights) {
        setFlights(FLIGHTS);
      } else {
        const rows = await fetchUserFlights();
        setFlights(rows);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load flights.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleDelete = (flight: Flight) => {
    Alert.alert('Delete flight?', `${flight.code} · ${flight.from} → ${flight.to}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (!FEATURE_FLAGS.useMockFlights) {
              await deleteFlight(flight.id);
            }
            setFlights((prev) => prev.filter((f) => f.id !== flight.id));
          } catch (e) {
            Alert.alert('Delete failed', e instanceof Error ? e.message : 'Please try again.');
          }
        },
      },
    ]);
  };

  const allowed = STATUS_FOR_FILTER[filter];
  const q = search.trim().toLowerCase();
  const visible = flights.filter((f) => {
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

  const showEmptyLayout = loading || visible.length === 0;

  return (
    <Screen scroll={!showEmptyLayout} contentStyle={showEmptyLayout ? { flex: 1 } : undefined}>
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
        <Chip active={filter === 'all'} onPress={() => setFilter('all')}>All</Chip>
        <Chip active={filter === 'future'} onPress={() => setFilter('future')}>Future</Chip>
        <Chip active={filter === 'ongoing'} onPress={() => setFilter('ongoing')}>Ongoing</Chip>
        <Chip active={filter === 'past'} onPress={() => setFilter('past')}>Past</Chip>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.colors.accent} />
        </View>
      ) : error ? (
        <EmptyState
          icon="warning-outline"
          title="Couldn't load flights"
          body={error}
        >
          <Button kind="primary" size="lg" onPress={load}>
            Try again
          </Button>
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState
          icon="airplane-outline"
          title={flights.length === 0 ? 'No flights yet' : 'No matches'}
          body={
            flights.length === 0
              ? 'Add a flight to start meeting people who are taking the same one as you.'
              : 'Try clearing the search or switching filters.'
          }
        >
          {flights.length === 0 && (
            <Button kind="primary" size="lg" onPress={() => router.push('/flight/add')}>
              + Add your first flight
            </Button>
          )}
        </EmptyState>
      ) : (
        <View style={{ gap: 8 }}>
          {visible.map((f) => (
            <FlightRow key={f.id} flight={f} onDelete={() => handleDelete(f)} />
          ))}
          <Text variant="caption" align="center" tone="mute" style={{ marginTop: 8 }}>
            {visible.length} of {flights.length} flight{flights.length === 1 ? '' : 's'}
          </Text>
        </View>
      )}
    </Screen>
  );
}
