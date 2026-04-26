import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RouteDisplay } from '@/components/ui/RouteDisplay';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { Verified } from '@/components/ui/Verified';
import { getFlight, getPerson } from '@/data/mock';

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const [requested, setRequested] = useState(false);

  const person = id ? getPerson(id) : undefined;
  const flight = person ? getFlight(person.flightId) : undefined;

  if (!person || !flight) {
    return (
      <Screen>
        <TopBar back />
        <Text>User not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen contentStyle={{ flexGrow: 1 }}>
      <TopBar back rightIcon="ellipsis-horizontal" />

      <View style={{ alignItems: 'center', gap: 8, marginTop: 4 }}>
        <Avatar size={84} initials={person.initials} />
        <Text variant="h2">{person.name}</Text>
        {person.verified && <Verified label="Flight verified" />}
      </View>

      <Card flat>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="section" tone="mute">
            Their flight
          </Text>
          <Badge>{flight.airlineShort}</Badge>
        </View>
        <RouteDisplay from={flight.from} to={flight.to} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="mono" tone="mute">
            {flight.code} · {flight.date} · {flight.time}
          </Text>
          <Text variant="mono" tone="mute">
            {flight.duration}
          </Text>
        </View>
      </Card>

      <View style={{ gap: 6 }}>
        <Text variant="section" tone="mute">
          About {person.name.split(' ')[0]}
        </Text>
        <Text variant="body" tone="soft">
          {person.description}
        </Text>
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ gap: 8 }}>
        <Button
          kind="primary"
          size="lg"
          full
          onPress={() => setRequested((v) => !v)}
        >
          {requested ? 'Request sent' : '+ Send connect request'}
        </Button>
        <Button kind="link" full>
          Report or block
        </Button>
      </View>
    </Screen>
  );
}
