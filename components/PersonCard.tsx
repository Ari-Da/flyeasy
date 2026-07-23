import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Tone } from '@/theme/tones';
import { ActionPill, type PillVariant } from '@/components/ui/ActionPill';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Verified } from '@/components/ui/Verified';
import type { Flight, Person } from '@/data/mock';

/**
 * The connection state between the signed-in user and this person, on the
 * selected flight — drives which button the card shows:
 *   none       → "Connect"        (send a request)
 *   requested  → "Requested"      (inert; we asked them, pending)
 *   incoming   → "Accept Request" (they asked us, pending)
 *   connected  → "Connected"      (inert; accepted)
 *   reconnect  → "Re-connect"     (we declined them; may reach back out)
 *   declined   → "Declined"       (inert; they declined us — no action)
 */
export type ConnectState =
  | 'none'
  | 'requested'
  | 'incoming'
  | 'connected'
  | 'reconnect'
  | 'declined';

export function PersonCard({
  person,
  flight,
  connectState = 'none',
  busy = false,
  onConnect,
  onAccept,
  onWithdraw,
}: {
  person: Person;
  flight: Flight;
  connectState?: ConnectState;
  /** Disables the actionable button while a request/accept is in flight. */
  busy?: boolean;
  /** Fired for "Connect" and "Re-connect" (both send a request). */
  onConnect?: () => void;
  /** Fired for "Accept Request". */
  onAccept?: () => void;
  /** Fired when tapping "Requested" to undo an outgoing request. */
  onWithdraw?: () => void;
}) {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/user/${person.id}`)}>
      <Card>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Avatar size={44} initials={person.initials} uri={person.avatarUrl} />
          <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
            <Text variant="h3">{person.name}</Text>
            {person.verified && <Verified />}
          </View>
        </View>

        <Text variant="body" tone="soft">
          {person.description}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <ConnectButton
            state={connectState}
            busy={busy}
            onConnect={onConnect}
            onAccept={onAccept}
            onWithdraw={onWithdraw}
          />
        </View>
      </Card>
    </Pressable>
  );
}

/**
 * The single button whose look/action depends on the connection state.
 *
 * Two visual rules, applied consistently:
 *   - **Actionable** → solid fill (you can press it).
 *   - **Status only** → transparent with a colored border (nothing to press).
 *
 * Colors are semantic and accent-independent (except the default Connect, which
 * follows the user's chosen accent): green = positive, blue = retry,
 * amber = waiting, red = declined.
 */
function ConnectButton({
  state,
  busy,
  onConnect,
  onAccept,
  onWithdraw,
}: {
  state: ConnectState;
  busy: boolean;
  onConnect?: () => void;
  onAccept?: () => void;
  onWithdraw?: () => void;
}) {
  // Per-state config only — all pill styling lives in <ActionPill>.
  const look: Record<
    ConnectState,
    { label: string; icon: keyof typeof Ionicons.glyphMap; tone: Tone; variant: PillVariant }
  > = {
    none:      { label: 'Connect',        icon: 'person-add',   tone: 'accent', variant: 'tint' },
    incoming:  { label: 'Accept Request', icon: 'checkmark',    tone: 'ok',     variant: 'tint' },
    reconnect: { label: 'Re-connect',     icon: 'refresh',      tone: 'info',   variant: 'tint' },
    requested: { label: 'Requested',      icon: 'time-outline', tone: 'warn',   variant: 'outline' },
    connected: { label: 'Connected',      icon: 'checkmark',    tone: 'ok',     variant: 'outline' },
    declined:  { label: 'Declined',       icon: 'close',        tone: 'danger', variant: 'outline' },
  };

  const s = look[state];
  // "Requested" is a status, but tapping it undoes the request — the trailing ✕
  // affords that. "Connected" / "Declined" have nothing to do, so they get no
  // onPress and render as an inert chip.
  const onPress =
    state === 'incoming' ? onAccept : state === 'requested' ? onWithdraw : state === 'connected' || state === 'declined' ? undefined : onConnect;

  return (
    <ActionPill
      label={s.label}
      icon={s.icon}
      trailingIcon={state === 'requested' && onWithdraw ? 'close' : undefined}
      tone={s.tone}
      variant={s.variant}
      busy={busy}
      onPress={onPress}
    />
  );
}
