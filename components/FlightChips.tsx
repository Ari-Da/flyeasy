import { ScrollView } from 'react-native';
import { Chip } from '@/components/ui/Chip';
import type { Flight } from '@/data/mock';

/**
 * Horizontal, scrollable row of the user's flights as selectable chips. Shared
 * by the Find Travelers and Connections screens so the "pick a flight first"
 * affordance stays identical in both places.
 */
export function FlightChips({
  flights,
  selectedId,
  onSelect,
}: {
  flights: Flight[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6, paddingRight: 8 }}
      style={{ flexGrow: 0 }}
    >
      {flights.map((f) => {
        // "JUL" → "Jul" so the chip reads "BA286 · Jul 29, 7:30 PM".
        const niceDate = f.date.replace(/\b([A-Z])([A-Z]+)/g, (_, a, b) => a + b.toLowerCase());
        return (
          <Chip key={f.id} active={f.id === selectedId} onPress={() => onSelect(f.id)}>
            {`${f.code} · ${niceDate}, ${f.time.toUpperCase()}`}
          </Chip>
        );
      })}
    </ScrollView>
  );
}
