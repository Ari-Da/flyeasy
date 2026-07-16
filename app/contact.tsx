import { Alert, Linking, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SUPPORT_EMAIL } from '@/brand/brand';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { useTheme } from '@/theme';

export default function ContactScreen() {
  const t = useTheme();

  const emailSupport = async () => {
    // Open the mail app directly. We avoid Linking.canOpenURL here because it
    // requires whitelisting `mailto` in iOS LSApplicationQueriesSchemes;
    // openURL doesn't, and simply rejects when there's no mail app (e.g. the
    // simulator), which we handle below.
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Flyeasy support')}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('No mail app found', `Email us directly at ${SUPPORT_EMAIL}.`);
    }
  };

  return (
    <Screen scroll edges={['top', 'left', 'right', 'bottom']} contentStyle={{ paddingBottom: 40 }}>
      <TopBar back title="Contact us" />

      <Text variant="h2">Get in touch</Text>
      <Text variant="body" tone="soft">
        Questions, feedback, or need a hand? Our support team is here to help. We usually reply within
        a couple of business days.
      </Text>

      <Card flat>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ionicons name="mail-outline" size={20} color={t.colors.inkMute} />
          <View style={{ flex: 1 }}>
            <Text variant="body" style={{ fontFamily: t.fontFamily.uiMedium }}>
              Email support
            </Text>
            <Text variant="caption" tone="mute">
              {SUPPORT_EMAIL}
            </Text>
          </View>
        </View>
      </Card>

      <View style={{ marginTop: 4 }}>
        <Button kind="primary" size="lg" full onPress={emailSupport}>
          Email support
        </Button>
      </View>
    </Screen>
  );
}
