/**
 * In-memory mock backend for MOCK-EVERYTHING mode (see lib/featureFlags.ts).
 *
 * Models users, flights, connections and messages, and exposes query/mutation
 * functions that mirror the real Supabase RPCs — always computed relative to the
 * currently signed-in mock user. Mutable and interactive; state resets on reload.
 *
 * The data layer (AuthContext + lib/*) delegates here when `mockAll` is on, so no
 * screen talks to Supabase/AeroDataBox. Return shapes match the real lib types.
 */

import type { Flight } from '@/types/models';
import type { Traveler } from '@/lib/flights';
import type { MyConnection, SharedFlight, ConnectionStatus, ConnectionDirection } from '@/lib/connections';
import type { ChatThread, Message } from '@/lib/chat';
import type { FlightLookupResult } from '@/lib/aerodatabox';
import type { Session } from '@/auth/AuthContext';

// ── Internal model ─────────────────────────────────────────────────────────
type MockUser = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  description: string;
  avatarUrl: string;
  availableToConnect: boolean;
};

/** A per-user flight instance (mirrors a `flights` row). Two users are "on the
 * same flight" when their `flightKey` matches. */
type MockFlight = {
  id: string;
  userId: string;
  flightKey: string; // flightNumber + departure date — identifies the physical flight
  departsAt: Date;
  arrivesAt: Date;
  code: string;
  airline: string;
  airlineShort: string;
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  fromTz: string;
  flightMessage: string; // per-flight override of the bio ('' = fall back to bio)
  pnr: string | null;
};

type MockConnection = {
  id: string;
  requesterId: string;
  addresseeId: string;
  requesterFlightId: string;
  addresseeFlightId: string;
  status: ConnectionStatus;
  message: string | null;
  createdAt: string;
  requesterChatPaused: boolean;
  addresseeChatPaused: boolean;
  requesterLastReadAt: string;
  addresseeLastReadAt: string;
};

type MockMessage = {
  id: string;
  connectionId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

let idCounter = 1;
const mkId = (prefix: string) => `${prefix}-${idCounter++}`;

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  users: [] as MockUser[],
  flights: [] as MockFlight[],
  connections: [] as MockConnection[],
  messages: [] as MockMessage[],
  currentUserId: null as string | null,
};

// ── Date/display helpers ─────────────────────────────────────────────────────
function daysFromNow(days: number, hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 30, 0, 0);
  return d;
}

function fmt(d: Date, tz: string, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, ...opts }).format(d);
}

function toDisplayFlight(f: MockFlight): Flight {
  const tz = f.fromTz;
  const durationMs = f.arrivesAt.getTime() - f.departsAt.getTime();
  const h = Math.floor(durationMs / 3_600_000);
  const m = Math.round((durationMs % 3_600_000) / 60_000);
  const long = fmt(f.departsAt, tz, { hour: 'numeric', minute: '2-digit', hour12: true });
  return {
    id: f.id,
    code: f.code,
    airline: f.airline,
    airlineShort: f.airlineShort,
    from: f.from,
    fromCity: f.fromCity,
    to: f.to,
    toCity: f.toCity,
    date: fmt(f.departsAt, tz, { month: 'short', day: 'numeric' }).toUpperCase(),
    dateLong: fmt(f.departsAt, tz, { month: 'short', day: 'numeric', year: 'numeric' }),
    weekday: fmt(f.departsAt, tz, { weekday: 'short' }).toUpperCase(),
    time: long.replace(/\s?AM$/i, 'a').replace(/\s?PM$/i, 'p'),
    timeLong: long,
    duration: `${h}h ${m}m`,
    status: f.departsAt.getTime() > Date.now() ? 'new' : 'complete',
    bookingRef: f.pnr ?? undefined,
    flightMessage: f.flightMessage,
  };
}

// ── Lookups ──────────────────────────────────────────────────────────────────
const me = () => state.currentUserId!;
const user = (id: string) => state.users.find((u) => u.id === id);
const flight = (id: string) => state.flights.find((f) => f.id === id);

/** The other participant id of a connection, from the caller's perspective. */
function otherId(c: MockConnection, selfId: string) {
  return c.requesterId === selfId ? c.addresseeId : c.requesterId;
}
function myFlightIdOf(c: MockConnection, selfId: string) {
  return c.requesterId === selfId ? c.requesterFlightId : c.addresseeFlightId;
}
function directionOf(c: MockConnection, selfId: string): ConnectionDirection {
  return c.requesterId === selfId ? 'outgoing' : 'incoming';
}
function iPausedOf(c: MockConnection, selfId: string) {
  return c.requesterId === selfId ? c.requesterChatPaused : c.addresseeChatPaused;
}
function otherPausedOf(c: MockConnection, selfId: string) {
  return c.requesterId === selfId ? c.addresseeChatPaused : c.requesterChatPaused;
}
function myLastReadOf(c: MockConnection, selfId: string) {
  return c.requesterId === selfId ? c.requesterLastReadAt : c.addresseeLastReadAt;
}

// ── Seed ─────────────────────────────────────────────────────────────────────
function seedUser(u: Omit<MockUser, 'avatarUrl' | 'availableToConnect'> & Partial<MockUser>): MockUser {
  const full: MockUser = { avatarUrl: '', availableToConnect: true, ...u };
  state.users.push(full);
  return full;
}

/** Add a physical flight to a set of users; returns each user's flight instance. */
function seedFlight(
  key: string,
  base: Omit<MockFlight, 'id' | 'userId' | 'flightKey' | 'flightMessage' | 'pnr'>,
  userIds: string[],
): Record<string, MockFlight> {
  const out: Record<string, MockFlight> = {};
  for (const uid of userIds) {
    const f: MockFlight = { ...base, id: mkId('fl'), userId: uid, flightKey: key, flightMessage: '', pnr: null };
    state.flights.push(f);
    out[uid] = f;
  }
  return out;
}

function seed() {
  state.users = [];
  state.flights = [];
  state.connections = [];
  state.messages = [];

  const maya = seedUser({ id: 'u-maya', email: 'maya@demo.app', password: 'demo1234', firstName: 'Maya', lastName: 'Okafor', description: "First solo transatlantic — a bit nervous but excited! Coffee at the gate? I'm in T8." });
  const dev = seedUser({ id: 'u-dev', email: 'dev@demo.app', password: 'demo1234', firstName: 'Dev', lastName: 'Patel', description: 'Heading to a design conf, down to chat about anything creative.' });
  const sana = seedUser({ id: 'u-sana', email: 'sana@demo.app', password: 'demo1234', firstName: 'Sana', lastName: 'Reyes', description: 'Nervous flyer looking for a friendly face at the gate!' });
  const leo = seedUser({ id: 'u-leo', email: 'leo@demo.app', password: 'demo1234', firstName: 'Leo', lastName: 'Tan', description: 'Off to Tokyo for a wedding. Say hi!' });
  const jordan = seedUser({ id: 'u-jordan', email: 'jordan@demo.app', password: 'demo1234', firstName: 'Jordan', lastName: 'Hill', description: 'Frequent flyer, always up for a chat.' });

  // Flight A — BA286 SFO→LHR (upcoming): maya, dev, sana
  const A = seedFlight(
    'BA286|A',
    {
      departsAt: daysFromNow(3, 19),
      arrivesAt: daysFromNow(4, 13),
      code: 'BA 286', airline: 'British Airways', airlineShort: 'British',
      from: 'SFO', fromCity: 'San Francisco', to: 'LHR', toCity: 'London', fromTz: 'America/Los_Angeles',
    },
    [maya.id, dev.id, sana.id],
  );

  // Flight B — UA88 SFO→NRT (upcoming): maya, leo, jordan
  const B = seedFlight(
    'UA88|B',
    {
      departsAt: daysFromNow(10, 11),
      arrivesAt: daysFromNow(11, 15),
      code: 'UA 88', airline: 'United', airlineShort: 'United',
      from: 'SFO', fromCity: 'San Francisco', to: 'NRT', toCity: 'Tokyo', fromTz: 'America/Los_Angeles',
    },
    [maya.id, leo.id, jordan.id],
  );

  const now = Date.now();
  const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

  // Maya ↔ Dev on flight A: accepted, with chat history.
  const c1: MockConnection = {
    id: mkId('cn'), requesterId: maya.id, addresseeId: dev.id,
    requesterFlightId: A[maya.id].id, addresseeFlightId: A[dev.id].id,
    status: 'accepted', message: null, createdAt: iso(3_600_000 * 30),
    requesterChatPaused: false, addresseeChatPaused: false,
    requesterLastReadAt: iso(3_600_000 * 2), addresseeLastReadAt: iso(0),
  };
  state.connections.push(c1);
  state.messages.push(
    { id: mkId('m'), connectionId: c1.id, senderId: maya.id, body: 'Hey Dev! Saw we’re on the same flight 🎉', createdAt: iso(3_600_000 * 5) },
    { id: mkId('m'), connectionId: c1.id, senderId: dev.id, body: 'Oh nice! First time flying this route?', createdAt: iso(3_600_000 * 4.8) },
    { id: mkId('m'), connectionId: c1.id, senderId: maya.id, body: 'Yeah, a little nervous 😅', createdAt: iso(3_600_000 * 4.5) },
    // Unread for Maya (Dev sent after Maya's lastRead of 2h ago):
    { id: mkId('m'), connectionId: c1.id, senderId: dev.id, body: 'You’ll be great — let’s grab a coffee at the gate!', createdAt: iso(3_600_000 * 1) },
  );

  // Sana → Maya on flight A: pending (Maya has an incoming request to accept).
  state.connections.push({
    id: mkId('cn'), requesterId: sana.id, addresseeId: maya.id,
    requesterFlightId: A[sana.id].id, addresseeFlightId: A[maya.id].id,
    status: 'pending', message: null, createdAt: iso(3_600_000 * 6),
    requesterChatPaused: false, addresseeChatPaused: false,
    requesterLastReadAt: iso(0), addresseeLastReadAt: iso(0),
  });

  // Maya → Leo on flight B: pending (Maya has an outgoing "Requested").
  state.connections.push({
    id: mkId('cn'), requesterId: maya.id, addresseeId: leo.id,
    requesterFlightId: B[maya.id].id, addresseeFlightId: B[leo.id].id,
    status: 'pending', message: null, createdAt: iso(3_600_000 * 8),
    requesterChatPaused: false, addresseeChatPaused: false,
    requesterLastReadAt: iso(0), addresseeLastReadAt: iso(0),
  });
  // Jordan: no connection with Maya → shows "Connect".

  state.currentUserId = null;
}

seed();

// ── Auth ─────────────────────────────────────────────────────────────────────
export function mockAuthenticate(email: string, password: string): Session {
  const u = state.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u || u.password !== password) throw new Error('Invalid email or password.');
  state.currentUserId = u.id;
  return mockSession()!;
}

export function mockSession(): Session | null {
  if (!state.currentUserId) return null;
  const u = user(state.currentUserId)!;
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    description: u.description,
    availableToConnect: u.availableToConnect,
    avatarUrl: u.avatarUrl,
  };
}

export function mockSignOut() {
  state.currentUserId = null;
}

/** Create a new mock user (does NOT log in — mirrors the real signup→login flow). */
export function mockSignUp(input: { firstName: string; lastName: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  if (state.users.some((u) => u.email.toLowerCase() === email)) {
    throw new Error('An account with this email already exists. Please log in instead.');
  }
  state.users.push({
    id: mkId('u'), email, password: input.password,
    firstName: input.firstName.trim(), lastName: input.lastName.trim(),
    description: '', avatarUrl: '', availableToConnect: true,
  });
}

/** Remove the current user and all their data, then sign out. */
export function mockDeleteAccount() {
  const selfId = state.currentUserId;
  if (!selfId) return;
  const removed = new Set(
    state.connections.filter((c) => c.requesterId === selfId || c.addresseeId === selfId).map((c) => c.id),
  );
  state.connections = state.connections.filter((c) => !removed.has(c.id));
  state.messages = state.messages.filter((m) => !removed.has(m.connectionId));
  state.flights = state.flights.filter((f) => f.userId !== selfId);
  state.users = state.users.filter((u) => u.id !== selfId);
  state.currentUserId = null;
}

/** Set (or clear, with '') the current user's avatar. */
export function mockSetAvatar(url: string): Session {
  user(me())!.avatarUrl = url;
  return mockSession()!;
}

export function mockUpdateProfile(patch: Partial<Pick<Session, 'firstName' | 'lastName' | 'description' | 'availableToConnect'>>): Session {
  const u = user(me())!;
  if (patch.firstName !== undefined) u.firstName = patch.firstName;
  if (patch.lastName !== undefined) u.lastName = patch.lastName;
  if (patch.description !== undefined) u.description = patch.description;
  if (patch.availableToConnect !== undefined) u.availableToConnect = patch.availableToConnect;
  return mockSession()!;
}

// ── Flights ──────────────────────────────────────────────────────────────────
export function mockMyFlights(): Flight[] {
  return state.flights
    .filter((f) => f.userId === me())
    .sort((a, b) => a.departsAt.getTime() - b.departsAt.getTime())
    .map(toDisplayFlight);
}

export function mockUpcomingFlights(): Flight[] {
  const now = Date.now();
  return state.flights
    .filter((f) => f.userId === me() && f.arrivesAt.getTime() > now)
    .sort((a, b) => a.departsAt.getTime() - b.departsAt.getTime())
    .map(toDisplayFlight);
}

export function mockFlightById(id: string): Flight | null {
  const f = flight(id);
  return f && f.userId === me() ? toDisplayFlight(f) : null;
}

export function mockFlightsByIds(ids: string[]): Map<string, Flight> {
  const set = new Set(ids);
  const map = new Map<string, Flight>();
  for (const f of state.flights) {
    if (set.has(f.id) && f.userId === me()) map.set(f.id, toDisplayFlight(f));
  }
  return map;
}

export function mockUpdateFlightMessage(flightId: string, message: string) {
  const f = flight(flightId);
  if (f && f.userId === me()) f.flightMessage = message;
}

export function mockDeleteFlight(flightId: string) {
  state.flights = state.flights.filter((f) => !(f.id === flightId && f.userId === me()));
}

/** Add a looked-up flight to the current user (mirrors the add-flight insert). */
export function mockAddFlight(picked: FlightLookupResult, pnr: string | null) {
  const departsAt = new Date(picked.scheduledDepartureUtc);
  const arrivesAt = new Date(picked.scheduledArrivalUtc);
  const num = picked.flightNumber.startsWith(picked.airlineIata)
    ? picked.flightNumber.slice(picked.airlineIata.length)
    : picked.flightNumber;
  state.flights.push({
    id: mkId('fl'),
    userId: me(),
    flightKey: `${picked.flightNumber}|${departsAt.toISOString().slice(0, 10)}`,
    departsAt,
    arrivesAt,
    code: `${picked.airlineIata} ${num}`,
    airline: picked.airlineName,
    airlineShort: picked.airlineName.split(/\s+/)[0] || picked.airlineName,
    from: picked.origin.iata,
    fromCity: picked.origin.city ?? picked.origin.name,
    to: picked.destination.iata,
    toCity: picked.destination.city ?? picked.destination.name,
    fromTz: picked.origin.timezone ?? 'UTC',
    flightMessage: '',
    pnr,
  });
}

// ── Travelers on a flight ─────────────────────────────────────────────────────
export function mockTravelersOnFlight(myFlightId: string): Traveler[] {
  const mine = flight(myFlightId);
  const meUser = user(me());
  if (!mine || mine.userId !== me() || !meUser?.availableToConnect) return [];
  return state.flights
    .filter((f) => f.flightKey === mine.flightKey && f.userId !== me())
    .filter((f) => user(f.userId)?.availableToConnect)
    .map((f) => {
      const u = user(f.userId)!;
      return {
        userId: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        description: u.description,
        avatarUrl: u.avatarUrl || null,
        flightMessage: f.flightMessage,
        matchedFlightId: f.id,
      };
    });
}

// ── Connections ──────────────────────────────────────────────────────────────
export function mockMyConnections(): MyConnection[] {
  const selfId = me();
  return state.connections
    .filter((c) => c.requesterId === selfId || c.addresseeId === selfId)
    .map((c) => {
      const o = user(otherId(c, selfId))!;
      return {
        id: c.id,
        status: c.status,
        direction: directionOf(c, selfId),
        otherUserId: o.id,
        firstName: o.firstName,
        lastName: o.lastName,
        description: o.description,
        avatarUrl: o.avatarUrl || null,
        otherAvailable: o.availableToConnect,
        myFlightId: myFlightIdOf(c, selfId),
        message: c.message,
        createdAt: c.createdAt,
      };
    });
}

export function mockSendRequest(targetUserId: string, myFlightId: string) {
  const selfId = me();
  const mine = flight(myFlightId);
  if (!mine || mine.userId !== selfId) throw new Error('That traveler is not on this flight');
  if (!user(selfId)?.availableToConnect) throw new Error('You have paused connecting. Turn "Available to connect" back on to send requests.');
  const theirs = state.flights.find((f) => f.userId === targetUserId && f.flightKey === mine.flightKey);
  const target = user(targetUserId);
  if (!theirs || !target?.availableToConnect) throw new Error('That traveler is not on this flight');

  const existing = state.connections.find(
    (c) =>
      ((c.requesterId === selfId && c.addresseeId === targetUserId) ||
        (c.requesterId === targetUserId && c.addresseeId === selfId)) &&
      (c.requesterFlightId === mine.id || c.addresseeFlightId === mine.id),
  );
  if (existing) {
    // Revive a declined request, but only by the person who declined it.
    if (existing.status === 'declined' && existing.addresseeId === selfId) {
      existing.requesterId = selfId;
      existing.addresseeId = targetUserId;
      existing.requesterFlightId = mine.id;
      existing.addresseeFlightId = theirs.id;
      existing.status = 'pending';
      existing.message = null;
      return;
    }
    throw new Error('A connection already exists for this flight');
  }
  state.connections.push({
    id: mkId('cn'), requesterId: selfId, addresseeId: targetUserId,
    requesterFlightId: mine.id, addresseeFlightId: theirs.id,
    status: 'pending', message: null, createdAt: new Date().toISOString(),
    requesterChatPaused: false, addresseeChatPaused: false,
    requesterLastReadAt: new Date().toISOString(), addresseeLastReadAt: new Date().toISOString(),
  });
}

export function mockRespond(connectionId: string, accept: boolean) {
  const c = state.connections.find((x) => x.id === connectionId);
  if (!c || c.addresseeId !== me() || c.status !== 'pending') {
    throw new Error('This request could not be updated.');
  }
  if (!user(me())?.availableToConnect) {
    throw new Error('This request could not be updated. If you have paused connecting, turn "Available to connect" back on and try again.');
  }
  c.status = accept ? 'accepted' : 'declined';
}

export function mockWithdraw(connectionId: string) {
  const before = state.connections.length;
  state.connections = state.connections.filter(
    (c) => !(c.id === connectionId && c.requesterId === me() && c.status === 'pending'),
  );
  if (state.connections.length === before) {
    throw new Error('This request could not be withdrawn — it may have already been handled.');
  }
  state.messages = state.messages.filter((m) => m.connectionId !== connectionId);
}

export function mockSharedFlights(targetUserId: string): SharedFlight[] {
  const selfId = me();
  const now = Date.now();
  const out: SharedFlight[] = [];
  for (const mine of state.flights.filter((f) => f.userId === selfId)) {
    const theirs = state.flights.find((f) => f.userId === targetUserId && f.flightKey === mine.flightKey);
    if (!theirs) continue;
    const conn = state.connections.find(
      (c) =>
        ((c.requesterId === selfId && c.addresseeId === targetUserId) ||
          (c.requesterId === targetUserId && c.addresseeId === selfId)) &&
        (c.requesterFlightId === mine.id || c.addresseeFlightId === mine.id),
    );
    if (!conn && mine.departsAt.getTime() <= now) continue; // past + no connection → skip
    out.push({
      myFlightId: mine.id,
      connectionId: conn?.id ?? null,
      status: conn?.status ?? null,
      direction: conn ? directionOf(conn, selfId) : null,
    });
  }
  return out.sort((a, b) => (flight(a.myFlightId)!.departsAt.getTime() - flight(b.myFlightId)!.departsAt.getTime()));
}

// ── Chat ─────────────────────────────────────────────────────────────────────
export function mockChatThreads(): ChatThread[] {
  const selfId = me();
  return state.connections
    .filter((c) => c.status === 'accepted' && (c.requesterId === selfId || c.addresseeId === selfId))
    .map((c) => {
      const o = user(otherId(c, selfId))!;
      const msgs = state.messages.filter((m) => m.connectionId === c.id).sort(byTime);
      const last = msgs[msgs.length - 1];
      const lastRead = new Date(myLastReadOf(c, selfId)).getTime();
      const unread = msgs.filter((m) => m.senderId !== selfId && new Date(m.createdAt).getTime() > lastRead).length;
      return {
        id: c.id,
        otherUserId: o.id,
        firstName: o.firstName,
        lastName: o.lastName,
        avatarUrl: o.avatarUrl || null,
        lastMessage: last?.body ?? null,
        lastMessageAt: last?.createdAt ?? null,
        unreadCount: unread,
        iPaused: iPausedOf(c, selfId),
        otherPaused: otherPausedOf(c, selfId),
        myFlightId: myFlightIdOf(c, selfId),
      };
    });
}

export function mockMessages(connectionId: string): Message[] {
  const selfId = me();
  const c = state.connections.find((x) => x.id === connectionId);
  if (!c || (c.requesterId !== selfId && c.addresseeId !== selfId)) return [];
  return state.messages
    .filter((m) => m.connectionId === connectionId)
    .sort(byTime)
    .map((m) => ({ id: m.id, connectionId: m.connectionId, senderId: m.senderId, body: m.body, createdAt: m.createdAt }));
}

export function mockSendMessage(connectionId: string, body: string): Message {
  const selfId = me();
  const c = state.connections.find((x) => x.id === connectionId);
  const trimmed = body.trim();
  if (!trimmed) throw new Error('Message is empty');
  if (!c || (c.requesterId !== selfId && c.addresseeId !== selfId) || c.status !== 'accepted') {
    throw new Error('This chat is paused — turn chatting back on to send messages.');
  }
  if (c.requesterChatPaused || c.addresseeChatPaused) {
    throw new Error('This chat is paused — turn chatting back on to send messages.');
  }
  const m: MockMessage = { id: mkId('m'), connectionId, senderId: selfId, body: trimmed, createdAt: new Date().toISOString() };
  state.messages.push(m);
  return { id: m.id, connectionId, senderId: selfId, body: trimmed, createdAt: m.createdAt };
}

export function mockSetChatPaused(connectionId: string, paused: boolean) {
  const selfId = me();
  const c = state.connections.find((x) => x.id === connectionId);
  if (!c) throw new Error('Connection not found');
  if (c.requesterId === selfId) c.requesterChatPaused = paused;
  else if (c.addresseeId === selfId) c.addresseeChatPaused = paused;
  else throw new Error('Not a participant');
}

export function mockMarkChatRead(connectionId: string) {
  const selfId = me();
  const c = state.connections.find((x) => x.id === connectionId);
  if (!c) return;
  const nowIso = new Date().toISOString();
  if (c.requesterId === selfId) c.requesterLastReadAt = nowIso;
  else if (c.addresseeId === selfId) c.addresseeLastReadAt = nowIso;
}

function byTime(a: MockMessage, b: MockMessage) {
  const d = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  return d !== 0 ? d : a.id.localeCompare(b.id);
}
