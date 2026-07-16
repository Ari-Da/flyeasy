import { View } from 'react-native';
import { APP_NAME, APP_TAGLINE, APP_VERSION, brandColors } from '@/brand/brand';
import { Mark } from '@/components/ui/Mark';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';

export default function AboutScreen() {
  return (
    <Screen scroll edges={['top', 'left', 'right', 'bottom']} contentStyle={{ paddingBottom: 40 }}>
      <TopBar back title="About" />

      <View style={{ alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 8 }}>
        <Mark size={72} planeColor={brandColors.green} />
        <Text variant="h2">{APP_NAME}</Text>
        <Text variant="body" tone="soft" align="center">
          {APP_TAGLINE}
        </Text>
        <Text variant="caption" tone="mute">
          Version {APP_VERSION}
        </Text>
      </View>

      <View style={{ gap: 12, marginTop: 8 }}>
        <Text variant="body" tone="soft">
          Flyeasy connects people travelling on the same flight, so flying solo feels a little less
          alone. Add your itinerary, see other verified passengers on your exact flight, send connect
          requests, and chat until you land.
        </Text>
        <Text variant="body" tone="soft">
          We built Flyeasy for the small moments that make travel better — a friendly face at the
          gate, someone to share a taxi with, or a new connection at 30,000 feet.
        </Text>
      </View>
    </Screen>
  );
}
