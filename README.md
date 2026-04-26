# Flyeasy

Mobile app that connects people on the same flight, so flying solo feels less alone. Match with verified passengers on your exact flight, send connect requests, and chat until the plane lands — then the conversation goes read-only as flight history.

This branch (`initial_setup_static`) ships the static UI from the wireframes with mock auth and mock data. The backend will come in a follow-up branch.

## Stack

- [Expo](https://expo.dev/) (SDK 54) + React Native 0.81
- TypeScript, strict mode
- [`expo-router`](https://docs.expo.dev/router/introduction/) — file-based navigation
- `@expo/vector-icons` (Ionicons)
- `expo-font` + `@expo-google-fonts/*` (Fraunces, Inter, JetBrains Mono)
- `@react-native-async-storage/async-storage` (mock session persistence)
- `react-native-svg` (logo + splash illustration)

## Run it

```bash
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android, `w` for web, or scan the QR with the Expo Go app.

## Project layout

```
app/                      expo-router screens — file = route
├── _layout.tsx           providers (theme, auth, fonts) + root stack
├── index.tsx             splash / unauth landing
├── (auth)/               sign-up, log-in
├── (app)/                5 tabs: find / flights / connections / chat / me
├── user/[id].tsx         passenger profile
├── flight/[id].tsx       flight detail
├── flight/add.tsx        add flight (modal)
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

theme/
├── palettes.ts           color tokens — 3 swappable accent palettes
├── tokens.ts             spacing, radius, font sizes/families
├── ThemeProvider.tsx     context + useTheme() / useThemeControls()
└── index.ts              public exports

auth/AuthContext.tsx      mock signIn / signUp / signOut, AsyncStorage backed
data/mock.ts              users, flights, requests, connections, chat threads
_design/                  reference assets — original wireframe HTML/JSX/PDFs
```

## Theming

Every color, font, and spacing value is a token. To swap the accent palette, change one line:

```ts
// theme/palettes.ts
export const DEFAULT_PALETTE: PaletteName = 'blue';   // 'blue' | 'green' | 'slate'
```

To live-switch in the app: **Profile tab → Theme → tap a swatch**.

To add a new palette, append to `PALETTES` in `theme/palettes.ts`. TypeScript will narrow it everywhere automatically.

## Mock auth

`auth/AuthContext.tsx` exposes `useAuth()` with `signIn`, `signUp`, `signOut`. Each method validates input, sleeps ~600ms to feel real, and persists the session to AsyncStorage. To wire a real backend, replace the bodies of those three methods — the rest of the app doesn't need to change.

The session shape:

```ts
type Session = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};
```

## Mock data

`data/mock.ts` holds the dummy users, flights, connect requests, and chat threads. The strings match the wireframes verbatim. Each `FLIGHTS`, `PEOPLE`, `REQUESTS`, `CONNECTIONS`, `CHAT_MESSAGES` constant is exported alongside lookup helpers (`getFlight`, `getPerson`, `peopleOnFlight`, etc.).

When the API is ready, the helpers become async fetches and the constants become empty defaults.

## Screens shipped

Auth: splash, sign-up, log-in
Find: people on your active flight (with empty state)
Flights: list with search + status filter, add flight modal, flight detail
Connections: pending requests + accepted connections (segmented)
Chat: thread list + chat thread (composer disables when flight is closed)
Profile: avatar, available toggle, about, flights link, theme switcher, sign out

## Branching

- `main` — empty (just the create-expo-app scaffold commit)
- `initial_setup_static` — this work; will be merged into `main` once the backend lands
