import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { RESET_CODE_LENGTH, useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { VerifyBanner } from '@/components/ui/VerifyBanner';

type Step = 'request' | 'verify';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { requestPasswordReset, verifyResetCode, updatePassword, signOut } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  // Set once the reset actually completes, so the leave-guard below knows the
  // sign-out was already handled and doesn't double-handle it.
  const completedRef = useRef(false);

  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState(params.email ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // Once the code is accepted we hold a recovery session, so a rejected password
  // (e.g. same as the old one) is retried by calling updatePassword again —
  // without re-verifying and burning the one-time code.
  const [verified, setVerified] = useState(false);

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Verifying the code establishes a recovery session (the user is now
  // authenticated). If they leave WITHOUT finishing the reset — back button,
  // swipe, hardware back — that session would strand them logged in and the
  // (auth) guard would redirect them into the app. So sign out first, then let
  // the navigation proceed. Only relevant once `verified` and not yet completed.
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (completedRef.current || !verified) return;
      e.preventDefault();
      signOut().finally(() => navigation.dispatch(e.data.action));
    });
    return unsub;
  }, [navigation, verified, signOut]);

  const goToVerify = (msg: string | null) => {
    setError(null);
    setNotice(msg);
    setStep('verify');
  };

  const sendCode = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      goToVerify(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      // Rate limit means a code was very likely already sent and is still valid,
      // so don't dead-end — send them on to enter the existing code.
      if (/rate limit|after \d+ second|too many/i.test(msg)) {
        goToVerify('You recently requested a code — enter the one already sent to your email.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async () => {
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      if (!verified) {
        await verifyResetCode(email, code);
        setVerified(true);
      }
      await updatePassword(password);
      // Reset succeeded — mark it so the leave-guard doesn't also sign out.
      completedRef.current = true;
      // Clear the recovery session and send them to log in with the new password,
      // rather than dropping them straight into the app — confirms the password
      // works and leaves no lingering reset session.
      await signOut();
      router.replace({
        pathname: '/(auth)/log-in',
        params: { email: email.trim(), passwordReset: '1' },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll contentStyle={{ paddingBottom: 40 }} edges={['top', 'left', 'right', 'bottom']}>
        <TopBar back title="Reset password" />

        {step === 'request' ? (
          <>
            <Text variant="h2">Forgot your password?</Text>
            <Text variant="body" tone="soft">
              Enter your email and we&apos;ll send you a {RESET_CODE_LENGTH}-digit code to reset it.
            </Text>

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
            </View>

            {error && (
              <Text variant="caption" align="center" style={{ color: '#a04020' }}>
                {error}
              </Text>
            )}

            <View style={{ gap: 12, marginTop: 20 }}>
              <Button kind="primary" size="lg" full loading={submitting} onPress={sendCode}>
                Send reset code
              </Button>
              <Pressable
                disabled={!emailLooksValid}
                onPress={() => goToVerify(null)}
                style={{ alignItems: 'center', opacity: emailLooksValid ? 1 : 0.4 }}
              >
                <Text variant="body" tone="soft">
                  Already have a code?{' '}
                  <Text variant="body" weight="semibold" style={{ textDecorationLine: 'underline' }}>
                    Enter it
                  </Text>
                </Text>
              </Pressable>
              <Pressable onPress={() => router.replace('/(auth)/log-in')} style={{ alignItems: 'center' }}>
                <Text variant="body" tone="soft">
                  Remembered it?{' '}
                  <Text variant="body" weight="semibold" style={{ textDecorationLine: 'underline' }}>
                    Back to log in
                  </Text>
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text variant="h2">Enter your code</Text>

            <VerifyBanner icon="mail-outline" tone="info">
              {notice ?? `We sent a ${RESET_CODE_LENGTH}-digit code to ${email}. Enter it below with your new password.`}
            </VerifyBanner>

            <View style={{ gap: 10, marginTop: 8 }}>
              <Input
                label={`${RESET_CODE_LENGTH}-digit code`}
                placeholder={'0'.repeat(RESET_CODE_LENGTH)}
                iconChar="#"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={RESET_CODE_LENGTH}
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
              />
              <Input
                label="New password"
                placeholder="••••••••"
                iconChar="•"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="newPassword"
                autoComplete="new-password"
              />
              <Input
                label="Confirm password"
                placeholder="••••••••"
                iconChar="•"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                textContentType="newPassword"
                autoComplete="new-password"
                error={confirmPassword.length > 0 && confirmPassword !== password ? "Passwords don't match" : undefined}
              />
            </View>

            {error && (
              <Text variant="caption" align="center" style={{ color: '#a04020' }}>
                {error}
              </Text>
            )}

            <View style={{ gap: 12, marginTop: 20 }}>
              <Button kind="primary" size="lg" full loading={submitting} onPress={resetPassword}>
                Reset password
              </Button>
            </View>
          </>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}
