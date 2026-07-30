/**
 * Dev-only feature flags.
 *
 * Flip a value here to switch between mock fixtures and real data sources.
 * Changes apply via Fast Refresh — no rebuild needed.
 */

/**
 * MOCK-EVERYTHING mode (the `mock_data` branch).
 *
 * When `true`, the ENTIRE app runs on the in-memory mock store (`mock/store.ts`)
 * — auth, flights, find-travelers, requests, connections, chats, profile — and
 * makes NO Supabase or AeroDataBox calls. For demos, marketing, screenshots and
 * offline testing. This branch is never merged.
 *
 * The individual `useMockFlights` / `useMockPeople` flags derive from it so any
 * remaining checks keep working; new code should read `mockAll`.
 */
const MOCK_ALL = true;

export const FEATURE_FLAGS = {
  mockAll: MOCK_ALL,
  useMockFlights: MOCK_ALL,
  useMockPeople: MOCK_ALL,
} as const;
