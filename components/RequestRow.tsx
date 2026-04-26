import { View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { Flight, Person } from '@/data/mock';

export function RequestRow({
  person,
  flight,
  message,
  onAccept,
  onDecline,
}: {
  person: Person;
  flight: Flight;
  message: string;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  return (
    <Card>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Avatar size={42} initials={person.initials} />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text variant="h3">{person.name}</Text>
          <Text variant="mono" tone="mute">
            {flight.code} · {flight.from}→{flight.to} · {flight.date}
          </Text>
        </View>
      </View>
      <Text variant="body" tone="soft" numberOfLines={2}>
        {message}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button kind="primary" size="sm" full onPress={onAccept}>
          Accept
        </Button>
        <Button kind="ghost" size="sm" full onPress={onDecline}>
          Decline
        </Button>
      </View>
    </Card>
  );
}
