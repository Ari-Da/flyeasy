import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { toneColors, type Tone } from '@/theme/tones';
import { useTheme } from '@/theme';
import { fetchSharedFlights, type SharedFlight } from '@/lib/connections';
import { fetchFlightsByIds } from '@/lib/flights';
import type { Flight } from '@/types/models';

/** Read-only indicator for a shared flight's connection state (no actions —
 * connecting happens in Find). */
function stateIndicator(sf: SharedFlight): { label: string; tone: Tone } {
  if (!sf.status) return { label: 'Not connected', tone: 'neutral' };
  if (sf.status === 'accepted') return { label: 'Connected', tone: 'ok' };
  if (sf.status === 'pending') {
    return sf.direction === 'outgoing'
      ? { label: 'Request sent', tone: 'warn' }
      : { label: 'Requested you', tone: 'info' };
  }
  return { label: 'Declined', tone: 'danger' }; // declined, either side
}

/**
 * Read-only profile of another traveller. Identity (name/photo/bio) comes from
 * nav params (RLS blocks reading a stranger's row; this exposes nothing the card
 * didn't). The shared-flights list is fetched via `shared_flights_with`, showing
 * every flight in common and where the two of you stand on each.
 */
export default function UserDetailScreen() {
  const t = useTheme();
  const p = useLocalSearchParams<{
    id?: string;
    name?: string;
    avatar?: string;
    bio?: string;
    verified?: string;
  }>();

  const [shared, setShared] = useState<SharedFlight[]>([]);
  const [flights, setFlights] = useState<Map<string, Flight>>(new Map());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!p.id) {
      setLoading(false);
      return;
    }
    try {
      const rows = await fetchSharedFlights(p.id);
      setShared(rows);
      setFlights(await fetchFlightsByIds(rows.map((r) => r.myFlightId)));
    } catch {
      // Leave empty; the section just won't render flights.
    } finally {
      setLoading(false);
    }
  }, [p.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const name = p.name?.trim();
  if (!name) {
    return (
      <Screen>
        <TopBar back />
        <Text>Profile unavailable.</Text>
      </Screen>
    );
  }

  const initials =
    name
      .split(/\s+/)
      .map((w) => w[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';
  const firstName = name.split(' ')[0];

  return (
    <Screen contentStyle={{ flexGrow: 1 }}>
      <TopBar back />

      <View style={{ alignItems: 'center', gap: 8, marginTop: 4 }}>
        <Avatar size={84} initials={initials} uri={p.avatar || undefined} />
        <Text variant="h2">{name}</Text>
      </View>

      {p.bio?.trim() ? (
        <View style={{ gap: 6 }}>
          <Text variant="section" tone="mute">
            About {firstName}
          </Text>
          <Text variant="body" tone="soft">
            {p.bio}
          </Text>
        </View>
      ) : null}

      <View style={{ gap: 6 }}>
        <Text variant="section" tone="mute">
          Flights you share
        </Text>

        {loading ? (
          <View style={{ paddingVertical: 20, alignItems: 'center' }}>
            <ActivityIndicator color={t.colors.accent} />
          </View>
        ) : shared.length === 0 ? (
          <Text variant="body" tone="soft">
            No shared flights right now.
          </Text>
        ) : (
          <Card flat>
            {shared.map((sf, i) => {
              const flight = flights.get(sf.myFlightId);
              const ind = stateIndicator(sf);
              return (
                <View
                  key={sf.myFlightId}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    paddingVertical: 10,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: t.colors.rule,
                  }}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="body" style={{ fontFamily: t.fontFamily.uiMedium }}>
                      {flight ? `${flight.code} · ${flight.from}→${flight.to}` : 'Flight'}
                    </Text>
                    {flight ? (
                      <Text variant="mono" tone="mute">
                        {flight.dateLong}
                      </Text>
                    ) : null}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        backgroundColor: toneColors(t.colors, ind.tone).ink,
                      }}
                    />
                    <Text
                      variant="caption"
                      style={{
                        color: toneColors(t.colors, ind.tone).ink,
                        fontFamily: t.fontFamily.uiSemibold,
                      }}
                    >
                      {ind.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        )}
      </View>
    </Screen>
  );
}
