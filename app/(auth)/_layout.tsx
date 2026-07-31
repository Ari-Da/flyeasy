import { Redirect, Stack, useSegments } from 'expo-router';
import { useAuth } from '@/auth/AuthContext';

export default function AuthLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  // The password-reset screen legitimately holds a recovery session (from the
  // verified code) while the user is still setting a new password, so it must
  // NOT be redirected away. Every other auth screen (login / sign-up) should
  // bounce a logged-in user into the app — mirroring the !session guard in
  // (app)/_layout.tsx so the two groups are protected in both directions.
  const onReset = segments[segments.length - 1] === 'forgot-password';

  if (loading) return null;
  if (session && !onReset) return <Redirect href="/(app)/find" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
