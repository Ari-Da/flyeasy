# Flyeasy

Mobile app that connects people on the same flight, so flying solo feels less alone. Match with verified passengers on your exact flight, send connect requests, and chat until the plane lands — then the conversation goes read-only as flight history.

## Tech Stack

A breakdown of every layer of the app — what each piece does and where it lives in the codebase.

### Language & runtime

- **TypeScript 5.9** in strict mode. Every file under `app/`, `components/`, `lib/`, `auth/`, and `theme/` is `.ts`/`.tsx`. Public types are exported from the layer that owns them (e.g. `DbFlight` from [lib/flights.ts](lib/flights.ts), `AirportSuggestion` from [lib/suggestions.ts](lib/suggestions.ts)).
- **React Native 0.81** running on **Hermes** (the default JS engine for RN). Hermes ships with Intl, so `Intl.DateTimeFormat({ timeZone: ... })` works without a polyfill — important for rendering airport-local times.
- **React 19.1**. Uses hooks-only components throughout.

### Frontend framework — Expo SDK 54

- **[`expo`](https://expo.dev/) `~54.0`** is the meta-framework. Provides the Metro bundler config, dev client, native module wrappers, and OTA-update plumbing.
- **`expo-router` `~6.0`** — **file-based navigation**. Every file under `app/` is a route; folders define stacks/tabs. `(auth)/` and `(app)/` are route groups that don't appear in URLs. Layout files (`_layout.tsx`) wrap their subtree (e.g. [app/(app)/_layout.tsx](app/(app)/_layout.tsx) defines the bottom tab bar).
- **`expo-font` + `@expo-google-fonts/{fraunces,inter,jetbrains-mono}`** — fonts loaded at startup in [app/_layout.tsx](app/_layout.tsx). Fraunces (display serif), Inter (UI sans), JetBrains Mono (mono labels and codes).
- **`expo-splash-screen`, `expo-status-bar`, `expo-system-ui`** — splash and status-bar control.
- **`expo-haptics`** — tap feedback (used sparingly).
- **`expo-image`, `expo-symbols`, `expo-linking`, `expo-web-browser`, `expo-constants`** — standard Expo helpers.

Run targets: iOS, Android, and Web (`react-native-web ~0.21`) — same codebase, three platforms.

### Navigation & gestures

- **`expo-router`** (above) sits on top of **`@react-navigation/{native,bottom-tabs,elements} ^7`**.
- **`react-native-gesture-handler ~2.28`** — gesture recognizers that the navigation libraries depend on.
- **`react-native-reanimated ~4.1`** + **`react-native-worklets`** — animation runtime.
- **`react-native-safe-area-context`** — notch/Dynamic-Island-aware insets, applied via the [Screen](components/ui/Screen.tsx) primitive.
- **`react-native-screens ~4.16`** — native-backed screen primitives for performance.

### UI & design system

- **Custom primitives** in [components/ui/](components/ui/): `Avatar`, `Badge`, `Button`, `Card`, `Checkbox`, `Chip`, `EmptyState`, `Input`, `Logo`, `RouteDisplay`, `Screen`, `Segmented`, `SplashIllo`, `Text`, `Toggle`, `TopBar`, `Verified`, `VerifyBanner`. Every primitive consumes the theme via `useTheme()` — no hardcoded colors anywhere.
- **Composite components** in [components/](components/): `ChatBubble`, `ConnectionRow`, `FlightRow`, `PersonCard`, `RequestRow` — domain-shaped wrappers around the primitives.
- **`@expo/vector-icons` ^15** — Ionicons used throughout (tab bar, suggestion category badges, action buttons).
- **`react-native-svg ^15.12`** — used for the [Logo](components/ui/Logo.tsx) and [SplashIllo](components/ui/SplashIllo.tsx).
- **Theming system** in [theme/](theme/) — see the [Theming](#theming) section below. Two independent axes: accent palette (Blue / Green / Orange / Pink / Purple / Slate) and background palette (Warm / White), composed at runtime in [theme/ThemeProvider.tsx](theme/ThemeProvider.tsx).

### State & persistence

- **React state** is the only client-side store — no Redux, no Zustand. Each screen owns its own data via `useState` / `useEffect` / `useFocusEffect`.
- **`@react-native-async-storage/async-storage` 2.2** — persistent key/value store on device. Used by the Supabase client to persist auth sessions across app restarts.
- **`react-native-url-polyfill`** — required by `@supabase/supabase-js` for URL parsing under Hermes. Imported once at the top of [lib/supabase.ts](lib/supabase.ts).

### Auth — Supabase Auth

- **`@supabase/supabase-js` ^2.104** — the JS SDK.
- **[auth/AuthContext.tsx](auth/AuthContext.tsx)** wraps `supabase.auth.signInWithPassword` / `signUp` / `signOut` and exposes `{ session, signIn, signUp, signOut, loading }` to the app.
- **Email confirmation is enabled** in Supabase — users must click the link before signing in.
- **Sessions persist via AsyncStorage** (configured in [lib/supabase.ts](lib/supabase.ts)) so users stay signed in across app restarts.
- **Route guard**: [app/(app)/_layout.tsx](app/(app)/_layout.tsx) redirects to `/` when `session` is null, locking the authenticated tab group.

### Database — Supabase Postgres

- **Supabase project `fbqmslwacsihckbblcqy.supabase.co`**. Postgres + Auth + RLS in one managed service.
- **Schema**: a single `public.flights` table (full DDL in [NOTES.local.md](NOTES.local.md)). Denormalized — origin/destination airport details and times are stored on the row, with a `raw_response jsonb` column for forward-compat. `verified boolean` distinguishes API-sourced flights from any future manual entries.
- **Row-Level Security** is enabled on every user-scoped table. Policies use `auth.uid() = user_id`, so the client never has to filter — `SELECT *` returns only the signed-in user's rows automatically.
- **Unique index** on `(user_id, flight_number, scheduled_departure_utc)` prevents duplicate flight saves; the duplicate-detection error is caught in [app/flight/add.tsx](app/flight/add.tsx) and surfaced as a friendly message.
- **Data access layer** in [lib/flights.ts](lib/flights.ts): `fetchUserFlights()`, `fetchFlight(id)`, `fetchDbFlight(id)`, `fetchNextUpcomingFlight()`, `deleteFlight(id)`, plus the `dbFlightToFlight` mapper that converts a `DbFlight` row into the UI-shaped `Flight` type.

### External APIs

#### AeroDataBox (RapidAPI) — flight schedule lookup

- **[AeroDataBox](https://aerodatabox.com/)** via RapidAPI. Generous free tier; provides flight number → route, times (UTC + IANA timezones), aircraft, terminal, and live status.
- **Auth**: API key in `EXPO_PUBLIC_AERODATABOX_KEY`. RapidAPI host header `aerodatabox.p.rapidapi.com`.
- **Wrapper** at [lib/aerodatabox.ts](lib/aerodatabox.ts) — `lookupFlight(flightNumber, date)` hits `GET /flights/number/{n}/{d}`, normalizes the response (parses `"2026-04-28 02:30Z"` → ISO 8601, flattens nested airport blobs, strips spaces in flight numbers), and returns `FlightLookupResult[]`. Typed errors for network / 401 / 404 / 429.
- **Used by**: the 3-step add-flight wizard in [app/flight/add.tsx](app/flight/add.tsx) — *Search → Pick → Confirm → INSERT into Supabase*.
- **Future server-side proxy**: `EXPO_PUBLIC_*` ships in the JS bundle; before any public release the call should move into a Supabase Edge Function so the key stays secret. Tracked in [NOTES.local.md](NOTES.local.md).

#### Anthropic Claude API — airport suggestions

- **Model**: `claude-opus-4-7`. Direct HTTPS POST to `https://api.anthropic.com/v1/messages`.
- **Auth**: `EXPO_PUBLIC_ANTHROPIC_API_KEY`, plus `anthropic-dangerous-direct-browser-access: true` (acknowledges this is a non-Node client).
- **Wrapper** at [lib/suggestions.ts](lib/suggestions.ts) — `fetchAirportSuggestions(ctx)` builds a system prompt with the desired JSON shape, sends a user message describing the airport/terminal/time-to-flight, parses Claude's JSON response, and returns a typed `AirportSuggestion[]`.
- **Why fetch (not the SDK)**: `@anthropic-ai/sdk` has known runtime quirks under Hermes/Metro. One HTTP call doesn't need the SDK; the future server-side proxy will.
- **Used by**: the *Things to do* section in [app/flight/[id].tsx](app/flight/[id].tsx). Origin/Destination toggle picks which airport to query; results render as cards with category icons.
- **Future server-side proxy**: same as AeroDataBox — move to a Supabase Edge Function so the key isn't in the bundle. Caching `(airport, terminal, layover_bucket) → suggestions` in a Supabase table is the obvious next win, since most users at JFK T4 get the same answer.

### Build, dev, and tooling

- **Metro** (Expo's React Native bundler) — kicked off via `npx expo start`. `npm run ios | android | web` targets a specific platform.
- **TypeScript** strict mode, configured in [tsconfig.json](tsconfig.json). Paths alias `@/*` → repo root for clean imports.
- **ESLint 9** with `eslint-config-expo`, configured in [eslint.config.js](eslint.config.js). Run via `npm run lint` (which is `expo lint`).
- **Dev feature flags** in [lib/featureFlags.ts](lib/featureFlags.ts) — two booleans (`useMockFlights`, `useMockPeople`) that swap any data source between live and bundled mocks. See [Mock data & dev flags](#mock-data--dev-flags) below.
- **Personal architecture log** in [NOTES.local.md](NOTES.local.md) (gitignored) — design decisions, schema, in-flight TODOs, and the Phase 2 / Phase 3 roadmap.

### Original short-form summary

- [Expo](https://expo.dev/) (SDK 54) + React Native 0.81
- TypeScript, strict mode
- [`expo-router`](https://docs.expo.dev/router/introduction/) — file-based navigation
- [Supabase](https://supabase.com/) — Postgres + Auth, with Row-Level Security
- [AeroDataBox](https://aerodatabox.com/) (via RapidAPI) — real-time flight schedule lookup
- [Anthropic Claude API](https://www.anthropic.com/) (`claude-opus-4-7`) — terminal-aware airport suggestions
- `@expo/vector-icons` (Ionicons)
- `expo-font` + `@expo-google-fonts/*` (Fraunces, Inter, JetBrains Mono)
- `@react-native-async-storage/async-storage` (session persistence)
- `react-native-svg` (logo + splash illustration)

## Run it

```bash
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android, `w` for web, or scan the QR with the Expo Go app.

Required env in `.env.local`:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_AERODATABOX_KEY=...
EXPO_PUBLIC_ANTHROPIC_API_KEY=...
```

The Anthropic key powers the LLM-based "Things to do" suggestions on the flight detail screen. Get one at <https://console.anthropic.com/settings/keys>.

## Project layout

```
app/                      expo-router screens — file = route
├── _layout.tsx           providers (theme, auth, fonts) + root stack
├── index.tsx             splash / unauth landing
├── (auth)/               sign-up, log-in
├── (app)/                5 tabs: find / flights / connections / chat / me
├── user/[id].tsx         passenger profile
├── flight/[id].tsx       flight detail
├── flight/add.tsx        add-flight lookup wizard (modal)
└── chat/[id].tsx         chat thread

components/
├── ui/                   primitives — Button, Input, Avatar, Card, Badge,
│                         Chip, Toggle, Checkbox, Segmented, TopBar, Screen,
│                         Text, Verified, VerifyBanner, EmptyState,
│                         RouteDisplay, Logo, SplashIllo
├── PersonCard.tsx        person on your flight (Find tab)
├── FlightRow.tsx         flight list row (Flights tab)
├── RequestRow.tsx        incoming connect request
├── ConnectionRow.tsx     accepted connection / chat list row
└── ChatBubble.tsx        chat message bubble

lib/                      data + service layer
├── supabase.ts           Supabase client
├── aerodatabox.ts        AeroDataBox lookup service + types
├── flights.ts            flights domain — fetchers, mappers, FLIGHT_STATUS
└── featureFlags.ts       dev toggles: useMockFlights, useMockPeople

theme/
├── palettes.ts           accent palettes + background palettes
├── tokens.ts             spacing, radius, font sizes/families
├── ThemeProvider.tsx     context + useTheme() / useThemeControls()
└── index.ts              public exports

auth/AuthContext.tsx      Supabase Auth wrapper (signIn / signUp / signOut)
data/mock.ts              bundled fixtures for dev mode
_design/                  reference assets — original wireframe HTML/JSX/PDFs
```

## Theming

Every color, font, and spacing value is a token, with two independent theming axes:

- **Accent palette** — Blue, Green, Orange, Pink, Purple, Slate (drives buttons, links, badges, active tab)
- **Background palette** — Warm or White (drives surfaces and ink shades)

Both swap live in **Profile → Theme / Background**. The default at startup comes from `DEFAULT_PALETTE` and `DEFAULT_BACKGROUND` in `theme/palettes.ts`. Adding a new accent palette is a one-line append to `PALETTES`; TypeScript narrows it everywhere automatically.

## Auth

`auth/AuthContext.tsx` wraps Supabase Auth with `signIn`, `signUp`, `signOut`. Sessions persist via AsyncStorage and survive app restarts. Row-Level Security on every user-scoped table uses `auth.uid()`, so the client never has to filter by user.

```ts
type Session = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};
```

## Mock data & dev flags

The flights flow is end-to-end live: enter a flight number + date, AeroDataBox returns the route / times / aircraft, the flight is saved to Supabase scoped to the signed-in user.

For development, two flags in `lib/featureFlags.ts` swap any data source between live and bundled fixtures from `data/mock.ts`:

```ts
export const FEATURE_FLAGS = {
  useMockFlights: false,  // false = Supabase, true = bundled FLIGHTS array
  useMockPeople:  false,  // false = empty states, true = bundled people / connections / chats
} as const;
```

Flip a flag, save the file, and Fast Refresh applies it instantly. Useful for previewing the UI with a populated layout, demoing without an internet connection, or exercising empty-state UX.

## Screens shipped

- **Auth**: splash, sign-up, log-in (Supabase Auth, email confirmation)
- **Find**: people on your next upcoming flight, with same-flight / nearby filters
- **Flights**: searchable list with status filters, 3-step add-flight lookup wizard, flight detail
- **Connections**: pending requests + accepted connections (segmented)
- **Chat**: thread list + chat thread (composer disables when flight has landed)
- **Profile**: avatar, availability toggle, about, flights link, theme + background switcher, sign out
