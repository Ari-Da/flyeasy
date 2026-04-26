import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

/**
 * Mock auth. Stores a single "session" object in AsyncStorage.
 * Replace `signIn` / `signUp` bodies with real API calls when the backend lands.
 */

const STORAGE_KEY = 'flyeasy.session.v1';

const FAKE_LATENCY_MS = 600;

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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSession(JSON.parse(raw));
      } catch {
        // ignore — first run or storage unavailable
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (next: Session | null) => {
    setSession(next);
    if (next) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  };

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    await sleep(FAKE_LATENCY_MS);
    if (!isValidEmail(email)) throw new Error('Please enter a valid email.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');
    const next: Session = {
      id: 'me',
      firstName: 'Riya',
      lastName: 'Tanaka',
      email,
    };
    await persist(next);
    return next;
  };

  const signUp: AuthContextValue['signUp'] = async ({ firstName, lastName, email, password }) => {
    await sleep(FAKE_LATENCY_MS);
    if (!firstName.trim() || !lastName.trim()) throw new Error('Please enter your full name.');
    if (!isValidEmail(email)) throw new Error('Please enter a valid email.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');
    const next: Session = {
      id: 'me',
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
    };
    await persist(next);
    return next;
  };

  const signOut = async () => {
    await sleep(200);
    await persist(null);
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
