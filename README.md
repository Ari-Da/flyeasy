# Flyeasy

Mobile app that connects people on the same flight, so flying solo feels less alone. Match with verified passengers on your exact flight, send connect requests, and chat until the plane lands — then the conversation goes read-only as flight history.

## Stack

- [Expo](https://expo.dev/) (SDK 54) + React Native 0.81
- TypeScript, strict mode
- [`expo-router`](https://docs.expo.dev/router/introduction/) — file-based navigation
- [Supabase](https://supabase.com/) — Postgres + Auth, with Row-Level Security
- [AeroDataBox](https://aerodatabox.com/) (via RapidAPI) — real-time flight schedule lookup
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
```

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
