import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local',
  );
}

/**
 * "Remember me" persistence.
 *
 * Supabase fixes its storage at client-creation time, so to make persistence a
 * per-login choice we route auth storage through this adapter. It always keeps
 * the session in memory (so it works during the current app run) and mirrors it
 * to AsyncStorage only when `persist` is true. When "Remember me" is unchecked,
 * the token is never written to disk, so a cold start finds nothing to restore
 * and the user must log in again.
 */
let persist = true;
const memoryStore = new Map<string, string>();

const rememberAwareStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (memoryStore.has(key)) return memoryStore.get(key) ?? null;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    memoryStore.set(key, value);
    if (persist) await AsyncStorage.setItem(key, value);
    else await AsyncStorage.removeItem(key);
  },
  removeItem: async (key: string): Promise<void> => {
    memoryStore.delete(key);
    await AsyncStorage.removeItem(key);
  },
};

/**
 * Choose whether the session survives an app restart. Call BEFORE signing in so
 * the resulting session is written to the right place:
 *   - true  → persisted to AsyncStorage (stays logged in across restarts)
 *   - false → memory only (logged out once the app is killed)
 */
export async function setSessionPersistence(remember: boolean): Promise<void> {
  persist = remember;
  if (!remember) {
    // Drop anything already on disk so it can't be restored on the next launch.
    const keys = await AsyncStorage.getAllKeys();
    const authKeys = keys.filter((k) => k.startsWith('sb-'));
    if (authKeys.length) await AsyncStorage.multiRemove(authKeys);
  }
}

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: rememberAwareStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
