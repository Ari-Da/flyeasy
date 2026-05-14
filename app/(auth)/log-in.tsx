import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';

export default function LogInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.replace('/(app)/find');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        scroll
        contentStyle={{ paddingBottom: 40 }}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <TopBar back title="Log in" />
        <Text variant="h2">Welcome back</Text>

        <View style={{ gap: 10, marginTop: 8 }}>
          <Input
            label="Email"
            placeholder="you@email.com"
            iconChar="@"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            keyboardType="email-address"
            textContentType="username"
            autoComplete="email"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            iconChar="•"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <Pressable
            onPress={() => setRemember((v) => !v)}
            style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}
          >
            <Checkbox value={remember} onChange={setRemember} />
            <Text variant="body" tone="soft">
              Remember me
            </Text>
          </Pressable>
          <Pressable hitSlop={6}>
            <Text variant="body" tone="soft" style={{ textDecorationLine: 'underline' }}>
              Forgot?
            </Text>
          </Pressable>
        </View>

        {error && (
          <Text variant="caption" align="center" style={{ color: '#a04020' }}>
            {error}
          </Text>
        )}

        <View style={{ gap: 12, marginTop: 20 }}>
          <Button kind="primary" size="lg" full loading={submitting} onPress={submit}>
            Log in
          </Button>
          <Pressable onPress={() => router.replace('/(auth)/sign-up')} style={{ alignItems: 'center' }}>
            <Text variant="body" tone="soft">
              New here?{' '}
              <Text variant="body" weight="semibold" style={{ textDecorationLine: 'underline' }}>
                Create an account
              </Text>
            </Text>
          </Pressable>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
