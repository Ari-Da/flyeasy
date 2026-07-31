import { Redirect, useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_NAME } from '@/brand/brand';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Mark } from '@/components/ui/Mark';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

export default function Splash() {
  const t = useTheme();
  const { session, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.paper }}>
        <ActivityIndicator color={t.colors.accent} />
      </View>
    );
  }

  if (session) return <Redirect href="/(app)/find" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.paper }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 28,
          gap: 24,
        }}
      >
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text
            style={{
              fontFamily: t.fontFamily.uiSemibold,
              fontSize: 40,
              lineHeight: 44,
              letterSpacing: -0.8,
              color: t.colors.ink,
            }}
          >
            {APP_NAME}
          </Text>
          <Mark size={190} />
        </View>
        <View style={{ alignItems: 'center', gap: 8, maxWidth: 260 }}>
          <Text variant="h2" align="center">
            Fly together, even when alone.
          </Text>
          <Text variant="body" tone="soft" align="center" style={{ maxWidth: 240 }}>
            Meet people on your exact flight before you take off.
          </Text>
        </View>
        <View style={{ width: '100%', maxWidth: 280, gap: 10 }}>
          <Button kind="primary" size="lg" full onPress={() => router.push('/(auth)/sign-up')}>
            Create account
          </Button>
          <Button kind="ghost" full onPress={() => router.push('/(auth)/log-in')}>
            I already have one
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
