import type { Session as SupabaseSession, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export type Session = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<Session>;
  signUp: (input: { firstName: string; lastName: string; email: string; password: string }) => Promise<Session>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function toSession(user: User | null | undefined, supaSession: SupabaseSession | null | undefined): Session | null {
  if (!user || !supaSession) return null;
  const meta = (user.user_metadata ?? {}) as { firstName?: string; lastName?: string };
  return {
    id: user.id,
    firstName: meta.firstName ?? '',
    lastName: meta.lastName ?? '',
    email: user.email ?? '',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(toSession(data.session?.user, data.session));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, supaSession) => {
      setSession(toSession(supaSession?.user, supaSession));
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    if (!isValidEmail(email)) throw new Error('Please enter a valid email.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const next = toSession(data.user, data.session);
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

    const next = toSession(data.user, data.session);
    if (!next) {
      throw new Error(
        'Account created — check your email to confirm before signing in.',
      );
    }
    return next;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  };

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
