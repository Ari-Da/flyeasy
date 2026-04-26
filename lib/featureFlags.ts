/**
 * Dev-only feature flags.
 *
 * Flip a value here to switch between mock fixtures and real data sources.
 * Changes apply via Fast Refresh — no rebuild needed.
 *
 * Production builds should ignore these and always use the `false` branch
 * (real data) — wire that in when shipping if it ever matters.
 */

export const FEATURE_FLAGS = {
  /**
   * `true`  — flight-related screens (flights tab, flight detail, profile counts,
   *           Find People header) read from `data/mock.ts`.
   * `false` — read from Supabase. Empty list / "no flights" state when the user
   *           has nothing in the DB.
   */
  useMockFlights: false,

  /**
   * `true`  — people-related screens (Find People list, Connections requests/list,
   *           Chat list, chat thread, user profile, flight-detail people preview)
   *           read from `data/mock.ts`.
   * `false` — show empty states. There is no DB backing for people/connections/chats
   *           yet; setting this to `false` exercises the empty-state UX.
   */
  useMockPeople: false,
} as const;
