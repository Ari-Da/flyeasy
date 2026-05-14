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

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!agreed) {
      setError('Please agree to terms & privacy.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signUp({ firstName, lastName, email, password });
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
        <TopBar back title="Sign up" />
        <Text variant="h2">Create your account</Text>
        <Text variant="body" tone="soft">
          Just the basics to get you flying.
        </Text>

        <View style={{ gap: 10, marginTop: 4 }}>
          <Input
            label="First name"
            placeholder="Maya"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
          <Input
            label="Last name"
            placeholder="Okafor"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />
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
            textContentType="newPassword"
            autoComplete="new-password"
          />
        </View>

        <Pressable
          onPress={() => setAgreed((v) => !v)}
          style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 6 }}
        >
          <Checkbox value={agreed} onChange={setAgreed} />
          <Text variant="body" tone="soft">
            I agree to terms & privacy
          </Text>
        </Pressable>

        {error && (
          <Text variant="caption" align="center" style={{ color: '#a04020' }}>
            {error}
          </Text>
        )}

        <View style={{ gap: 12, marginTop: 20 }}>
          <Button kind="primary" size="lg" full loading={submitting} onPress={submit}>
            Create account
          </Button>
          <Pressable onPress={() => router.replace('/(auth)/log-in')} style={{ alignItems: 'center' }}>
            <Text variant="body" tone="soft">
              Already have an account?{' '}
              <Text variant="body" weight="semibold" style={{ textDecorationLine: 'underline' }}>
                Log in
              </Text>
            </Text>
          </Pressable>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
