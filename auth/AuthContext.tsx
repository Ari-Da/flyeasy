import type { Session as SupabaseSession, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { setSessionPersistence, supabase } from '@/lib/supabase';

export type Session = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  description: string;
  availableToConnect: boolean;
};

export type ProfileUpdate = Partial<Pick<Session, 'firstName' | 'lastName' | 'description' | 'availableToConnect'>>;

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, remember?: boolean) => Promise<Session>;
  signUp: (input: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  verifyResetCode: (email: string, code: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (input: ProfileUpdate) => Promise<Session>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Length of the password-reset code Supabase emails (its recovery OTP is
 * currently 8 digits). Single source of truth — the input limit, placeholder,
 * and on-screen copy all derive from this, so changing it updates everywhere.
 * Must match the code your Supabase "Reset Password" email template sends.
 */
export const RESET_CODE_LENGTH = 8;

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

async function loadSession(
  user: User | null | undefined,
  supaSession: SupabaseSession | null | undefined,
): Promise<Session | null> {
  if (!user || !supaSession) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, description, available_to_connect')
    .eq('id', user.id)
    .maybeSingle();

  const meta = (user.user_metadata ?? {}) as { firstName?: string; lastName?: string };

  return {
    id: user.id,
    email: user.email ?? '',
    firstName: profile?.first_name ?? meta.firstName ?? '',
    lastName: profile?.last_name ?? meta.lastName ?? '',
    description: profile?.description ?? '',
    availableToConnect: profile?.available_to_connect ?? true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      const next = await loadSession(data.session?.user, data.session);
      if (!mounted) return;
      setSession(next);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, supaSession) => {
      // Defer the profile fetch: awaiting other supabase calls *directly* inside
      // this callback holds the auth client's internal lock and deadlocks the
      // next auth call (e.g. updateUser right after verifyOtp hangs forever).
      // Running on the next tick releases the lock first. See supabase-js docs.
      setTimeout(async () => {
        const next = await loadSession(supaSession?.user, supaSession);
        if (!mounted) return;
        setSession(next);
      }, 0);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn: AuthContextValue['signIn'] = async (email, password, remember = true) => {
    if (!isValidEmail(email)) throw new Error('Please enter a valid email.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');

    // Apply the persistence choice before the session is written to storage.
    await setSessionPersistence(remember);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const next = await loadSession(data.user, data.session);
    if (!next) throw new Error('Sign-in returned no session.');
    return next;
  };

  const signUp: AuthContextValue['signUp'] = async ({ firstName, lastName, email, password }) => {
    if (!firstName.trim() || !lastName.trim()) throw new Error('Please enter your full name.');
    if (!isValidEmail(email)) throw new Error('Please enter a valid email.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstName: firstName.trim(), lastName: lastName.trim() },
      },
    });
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  };

  // Step 1 of password reset: email the user a recovery code (RESET_CODE_LENGTH
  // digits). Supabase
  // always resolves success here (it won't reveal whether the email is
  // registered), so the UI should show the same "check your inbox" state either
  // way. Whether the email shows a code or a link is controlled by the project's
  // "Reset Password" email template ({{ .Token }} = the code this flow uses).
  const requestPasswordReset: AuthContextValue['requestPasswordReset'] = async (email) => {
    if (!isValidEmail(email)) throw new Error('Please enter a valid email.');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) throw new Error(error.message);
  };

  // Step 2a: verify the emailed code. Success mints a short-lived recovery
  // session — that session is what authorizes updatePassword() below. Kept
  // separate from the password step so a rejected password can be retried
  // without burning this one-time code.
  const verifyResetCode: AuthContextValue['verifyResetCode'] = async (email, code) => {
    if (code.trim().length !== RESET_CODE_LENGTH) {
      throw new Error(`Enter the ${RESET_CODE_LENGTH}-digit code from your email.`);
    }
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'recovery',
    });
    if (error) throw new Error(error.message);
  };

  // Step 2b: set the password on the current session. Supabase rejects reusing
  // the old password ("New password should be different…"); that error surfaces
  // to the caller so it can be shown and retried in place.
  const updatePassword: AuthContextValue['updatePassword'] = async (newPassword) => {
    if (newPassword.length < 6) throw new Error('Password must be at least 6 characters.');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  };

  const updateProfile: AuthContextValue['updateProfile'] = async (input) => {
    const { data: current } = await supabase.auth.getSession();
    const supaSession = current.session;
    if (!supaSession) throw new Error('Not signed in.');

    const dbInput: Record<string, unknown> = {};
    if ('firstName' in input) dbInput.first_name = input.firstName;
    if ('lastName' in input) dbInput.last_name = input.lastName;
    if ('description' in input) dbInput.description = input.description;
    if ('availableToConnect' in input) dbInput.available_to_connect = input.availableToConnect;

    if (Object.keys(dbInput).length > 0) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(dbInput)
        .eq('id', supaSession.user.id);
      if (updateError) throw new Error(updateError.message);
    }

    const next = await loadSession(supaSession.user, supaSession);
    if (!next) throw new Error('Profile update returned no user.');
    setSession(next);
    return next;
  };

  return (
    <AuthContext.Provider
      value={{ session, loading, signIn, signUp, signOut, requestPasswordReset, verifyResetCode, updatePassword, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
