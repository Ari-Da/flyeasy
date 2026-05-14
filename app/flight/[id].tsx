import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RouteDisplay } from '@/components/ui/RouteDisplay';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { Verified } from '@/components/ui/Verified';
import { getFlight, peopleOnFlight, type Flight } from '@/data/mock';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { fetchFlight } from '@/lib/flights';
import { useTheme } from '@/theme';

export default function FlightDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useTheme();

  const [flight, setFlight] = useState<Flight | null | undefined>(
    FEATURE_FLAGS.useMockFlights && id ? (getFlight(id) ?? null) : undefined,
  );

  useEffect(() => {
    if (FEATURE_FLAGS.useMockFlights || !id) return;
    let active = true;
    fetchFlight(id)
      .then((f) => {
        if (active) setFlight(f);
      })
      .catch(() => {
        if (active) setFlight(null);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (flight === undefined) {
    return (
      <Screen contentStyle={{ flex: 1 }}>
        <TopBar back />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.colors.accent} />
        </View>
      </Screen>
    );
  }

  if (!flight) {
    return (
      <Screen>
        <TopBar back />
        <Text>Flight not found.</Text>
      </Screen>
    );
  }

  const people = FEATURE_FLAGS.useMockPeople ? peopleOnFlight(flight.id) : [];
  const previewCount = Math.min(4, people.length);
  const remaining = people.length - previewCount;

  return (
    <Screen contentStyle={{ flexGrow: 1 }}>
      <TopBar back rightIcon="ellipsis-horizontal" />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ gap: 4 }}>
          <Text variant="h1">{flight.code}</Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Verified />
            <Text variant="mono" tone="mute">
              {flight.airline}
            </Text>
          </View>
        </View>
        <Badge status={flight.status}>{flight.status}</Badge>
      </View>

      <Card flat>
        <RouteDisplay from={flight.from} to={flight.to} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="mono" tone="mute">
            {flight.fromCity}
          </Text>
          <Text variant="mono" tone="mute">
            {flight.toCity}
          </Text>
        </View>
        <View style={{ height: 1, backgroundColor: t.colors.rule, marginVertical: 4 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <Text variant="mono" tone="mute">
              Departs
            </Text>
            <Text variant="bodyLg" weight="semibold">
              {flight.dateLong} · {flight.timeLong}
            </Text>
          </View>
          <View style={{ gap: 2 }}>
            <Text variant="mono" tone="mute">
              Duration
            </Text>
            <Text variant="bodyLg" weight="semibold">
              {flight.duration}
            </Text>
          </View>
        </View>
      </Card>

      {people.length > 0 && (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="section" tone="mute">
              People on this flight
            </Text>
            <Text variant="body" tone="soft" style={{ textDecorationLine: 'underline' }} onPress={() => router.push('/(app)/find')}>
              See all {people.length}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {people.slice(0, previewCount).map((p) => (
              <Avatar key={p.id} size={40} initials={p.initials} />
            ))}
            {remaining > 0 && <Avatar size={40} initials={`+${remaining}`} variant="soft" />}
          </View>
        </>
      )}

      <View style={{ flex: 1 }} />

      <Button kind="primary" size="lg" full onPress={() => router.push('/(app)/find')}>
        Find travelers on this flight
      </Button>
    </Screen>
  );
}
