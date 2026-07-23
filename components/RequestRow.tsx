import { View } from 'react-native';
import { ActionPill } from '@/components/ui/ActionPill';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { Flight, Person } from '@/data/mock';

export function RequestRow({
  person,
  flight,
  message,
  onAccept,
  onDecline,
  onWithdraw,
}: {
  person: Person;
  flight: Flight;
  message: string;
  onAccept?: () => void;
  onDecline?: () => void;
  /** When provided, this is a request the user SENT — renders a single
   * "Withdraw" action instead of Accept/Decline. */
  onWithdraw?: () => void;
}) {
  return (
    <Card>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Avatar size={42} initials={person.initials} uri={person.avatarUrl} />
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
      {/* Right-aligned to match the action placement on PersonCard. */}
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
        {onWithdraw ? (
          <ActionPill
            label="Withdraw"
            icon="arrow-undo-outline"
            tone="danger"
            variant="tint"
            onPress={onWithdraw}
          />
        ) : (
          <>
            <ActionPill label="Accept" icon="checkmark" tone="ok" variant="tint" onPress={onAccept} />
            <ActionPill label="Decline" icon="close" tone="danger" variant="tint" onPress={onDecline} />
          </>
        )}
      </View>
    </Card>
  );
}
