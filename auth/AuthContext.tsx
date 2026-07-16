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
  avatarUrl: string;
};

export type ProfileUpdate = Partial<Pick<Session, 'firstName' | 'lastName' | 'description' | 'availableToConnect'>>;

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, remember?: boolean) => Promise<Session>;
  signUp: (input: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  verifyResetCode: (email: string, code: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (input: ProfileUpdate) => Promise<Session>;
  uploadAvatar: (localUri: string) => Promise<Session>;
  removeAvatar: () => Promise<Session>;
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
    .select('first_name, last_name, description, available_to_connect, avatar_url')
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
    avatarUrl: profile?.avatar_url ?? '',
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
      if (!supaSession) {
        // Signed out: no profile fetch needed, so clear synchronously. This
        // avoids a navigation race — after `await signOut()` the session is
        // already null, so route guards won't briefly treat the user as still
        // logged in and redirect them into the app.
        if (mounted) setSession(null);
        return;
      }
      // Defer the profile fetch: awaiting other supabase calls *directly* inside
      // this callback holds the auth client's internal lock and deadlocks the
      // next auth call (e.g. updateUser right after verifyOtp hangs forever).
      // Running on the next tick releases the lock first. See supabase-js docs.
      setTimeout(async () => {
        const next = await loadSession(supaSession.user, supaSession);
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstName: firstName.trim(), lastName: lastName.trim() },
      },
    });
    if (error) throw new Error(error.message);

    // With email confirmation + enumeration protection enabled, Supabase does
    // NOT error on a duplicate email — to avoid revealing which emails exist it
    // returns an obfuscated user with an EMPTY identities array and writes
    // nothing. Detect that and surface a real "already registered" error, so we
    // don't send the user to the fake "confirm your email" flow.
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      throw new Error('An account with this email already exists. Please log in instead.');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  };

  // Permanently delete the signed-in user's account and data via a security-
  // definer RPC (see docs/DATABASE.md for the `delete_own_account` function),
  // then clear the local session. The RPC removes the user's rows and their
  // auth record server-side.
  const deleteAccount: AuthContextValue['deleteAccount'] = async () => {
    const { error } = await supabase.rpc('delete_own_account');
    if (error) throw new Error(error.message);
    // The auth user no longer exists — clear the local session. signOut may
    // fail server-side (user gone); the local state clears regardless.
    await supabase.auth.signOut().catch(() => {});
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
    // Keep the recovery session MEMORY-ONLY. Verifying the code necessarily
    // mints a session (Supabase has no way to change a password without one),
    // but it must never be written to disk — otherwise an app kill mid-reset
    // would strand the user logged in after a restart. It lives only for this
    // flow: a completed reset signs out and the user logs in fresh; an abandoned
    // one is signed out by the screen's leave-guard; an app kill just loses it.
    await setSessionPersistence(false);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'recovery',
    });
    if (error) throw new Error(error.message);
  };

  // Step 2b: set the password on the current session.
  const updatePassword: AuthContextValue['updatePassword'] = async (newPassword) => {
    if (newPassword.length < 6) throw new Error('Password must be at least 6 characters.');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      // Don't echo Supabase's "New password should be different from the old
      // password" verbatim — that confirms the entered value IS the current
      // password, a reuse oracle for anyone already holding the reset code.
      // Surface a neutral message instead.
      const samePassword =
        error.code === 'same_password' || /different from the old|same.?password/i.test(error.message);
      throw new Error(
        samePassword ? 'Could not update your password. Please choose a different one.' : error.message,
      );
    }
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

  // Upload a local image to the `avatars` storage bucket under the user's id and
  // save its public URL on the profile. A cache-busting query param is appended
  // so the new photo shows immediately despite the fixed storage path.
  const uploadAvatar: AuthContextValue['uploadAvatar'] = async (localUri) => {
    const { data: current } = await supabase.auth.getSession();
    const supaSession = current.session;
    if (!supaSession) throw new Error('Not signed in.');
    const userId = supaSession.user.id;

    // React Native can't pass a File to supabase-js; read the file into an
    // ArrayBuffer and upload that with an explicit content type.
    const arrayBuffer = await fetch(localUri).then((r) => r.arrayBuffer());
    const path = `${userId}/avatar.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
    if (uploadError) throw new Error(uploadError.message);

    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = `${pub.publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', userId);
    if (updateError) throw new Error(updateError.message);

    const next = await loadSession(supaSession.user, supaSession);
    if (!next) throw new Error('Avatar update returned no user.');
    setSession(next);
    return next;
  };

  // Clear the profile photo: drop the stored URL (source of truth for display)
  // and best-effort delete the file. Removing the file needs a storage delete
  // policy; if absent the delete is ignored and the orphan is overwritten on the
  // next upload (fixed path), so removal still succeeds either way.
  const removeAvatar: AuthContextValue['removeAvatar'] = async () => {
    const { data: current } = await supabase.auth.getSession();
    const supaSession = current.session;
    if (!supaSession) throw new Error('Not signed in.');
    const userId = supaSession.user.id;

    try {
      await supabase.storage.from('avatars').remove([`${userId}/avatar.jpg`]);
    } catch {
      // best-effort — display is driven by avatar_url below
    }

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId);
    if (error) throw new Error(error.message);

    const next = await loadSession(supaSession.user, supaSession);
    if (!next) throw new Error('Avatar removal returned no user.');
    setSession(next);
    return next;
  };

  return (
    <AuthContext.Provider
      value={{ session, loading, signIn, signUp, signOut, deleteAccount, requestPasswordReset, verifyResetCode, updatePassword, updateProfile, uploadAvatar, removeAvatar }}
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
