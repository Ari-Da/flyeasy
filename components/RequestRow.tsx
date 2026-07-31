import { View } from 'react-native';
import { ActionPill } from '@/components/ui/ActionPill';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { Flight, Person } from '@/types/models';

export function RequestRow({
  person,
  flight,
  message,
  onAccept,
  onDecline,
  onWithdraw,
  disabled = false,
  unavailable = false,
}: {
  person: Person;
  flight: Flight;
  message: string;
  onAccept?: () => void;
  onDecline?: () => void;
  /** When provided, this is a request the user SENT — renders a single
   * "Withdraw" action instead of Accept/Decline. */
  onWithdraw?: () => void;
  /** Freeze the actions (e.g. the signed-in user paused connecting). */
  disabled?: boolean;
  /** The OTHER person paused connecting — flag it so the sender knows the
   * request can't progress right now. */
  unavailable?: boolean;
}) {
  return (
    <Card>
      {/* Only the CONTENT dims when the other person has paused — the actions
          below stay at full strength. RN opacity is multiplicative, so dimming
          the whole Card would drag the still-usable Withdraw button down with
          it and make it read as disabled. */}
      <View style={{ gap: 10, opacity: unavailable ? 0.55 : 1 }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Avatar size={42} initials={person.initials} uri={person.avatarUrl} />
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text variant="h3">{person.name}</Text>
            <Text variant="mono" tone="mute">
              {flight.code} · {flight.from}→{flight.to} · {flight.date}
            </Text>
          </View>
          {unavailable && (
            <Text variant="caption" tone="mute">
              Unavailable
            </Text>
          )}
        </View>
        <Text variant="body" tone="soft" numberOfLines={2}>
          {message}
        </Text>
      </View>
      {/* Right-aligned to match the action placement on PersonCard. */}
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
        {onWithdraw ? (
          // Withdrawing stays available even when frozen — it's how you clean up.
          <ActionPill
            label="Withdraw"
            icon="arrow-undo-outline"
            tone="danger"
            variant="tint"
            onPress={onWithdraw}
          />
        ) : (
          <>
            <ActionPill
              label="Accept"
              icon="checkmark"
              tone="ok"
              variant="tint"
              disabled={disabled}
              onPress={onAccept}
            />
            <ActionPill
              label="Decline"
              icon="close"
              tone="danger"
              variant="tint"
              disabled={disabled}
              onPress={onDecline}
            />
          </>
        )}
      </View>
    </Card>
  );
}
