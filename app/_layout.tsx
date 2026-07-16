import 'react-native-url-polyfill/auto';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';

import { AuthProvider } from '@/auth/AuthContext';
import { AnimatedSplash } from '@/components/ui/AnimatedSplash';
import { ThemeProvider, useTheme } from '@/theme';

// Keep the native splash up until React is ready; AnimatedSplash hides it and
// takes over with the waving-logo animation.
SplashScreen.preventAutoHideAsync().catch(() => {});

function FontGate({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  const [loaded] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_600SemiBold,
  });

  if (!loaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.paper }}>
        <ActivityIndicator color={t.colors.accent} />
      </View>
    );
  }

  return <>{children}</>;
}

function ThemedStack() {
  const t = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: t.colors.paper },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="user/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="flight/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="flight/add" options={{ presentation: 'modal' }} />
      <Stack.Screen name="chat/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="about" options={{ presentation: 'card' }} />
      <Stack.Screen name="contact" options={{ presentation: 'card' }} />
      <Stack.Screen name="legal/terms" options={{ presentation: 'card' }} />
      <Stack.Screen name="legal/privacy" options={{ presentation: 'card' }} />
      <Stack.Screen name="delete-account" options={{ presentation: 'card' }} />
    </Stack>
  );
}

function RootStackWithSplash() {
  const [splashDone, setSplashDone] = useState(false);
  return (
    <>
      <ThemedStack />
      {!splashDone && <AnimatedSplash onFinish={() => setSplashDone(true)} />}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <FontGate>
            <AuthProvider>
              <StatusBar style="dark" />
              <RootStackWithSplash />
            </AuthProvider>
          </FontGate>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
