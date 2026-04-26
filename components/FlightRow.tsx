import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { Flight } from '@/data/mock';

export function FlightRow({
  flight,
  onEdit,
  onDelete,
}: {
  flight: Flight;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const t = useTheme();
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/flight/${flight.id}`)}>
      <Card tight>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Text style={{ fontFamily: t.fontFamily.monoSemibold, fontSize: t.fontSize.bodyLg }}>
              {flight.code}
            </Text>
            <Text variant="mono" tone="mute">
              {flight.airlineShort}
            </Text>
          </View>
          <Badge status={flight.status}>{flight.status}</Badge>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: t.fontFamily.mono, fontSize: t.fontSize.body }}>
            {flight.from} → {flight.to}
          </Text>
          <Text variant="monoSm" tone="mute">
            {flight.duration}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="mono" tone="mute">
            {flight.date} · {flight.time}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable onPress={onEdit} hitSlop={6}>
              <Text variant="body" tone="soft" style={{ textDecorationLine: 'underline' }}>
                Edit
              </Text>
            </Pressable>
            <Pressable onPress={onDelete} hitSlop={6}>
              <Text variant="body" tone="soft" style={{ textDecorationLine: 'underline' }}>
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
