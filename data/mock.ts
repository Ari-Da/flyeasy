/**
 * Mock data — mirrors the strings shown in the wireframes verbatim so the
 * UI looks identical to the design package while there's no backend.
 *
 * When the API exists, each `getX()` helper becomes an `await fetch(...)`.
 */

export type { FlightStatus } from '@/lib/flights';
import type { FlightStatus } from '@/lib/flights';

export type Flight = {
  id: string;
  code: string; // "AA 204"
  airline: string; // "American Airlines"
  airlineShort: string; // "American"
  from: string; // "JFK"
  fromCity: string; // "New York"
  to: string;
  toCity: string;
  date: string; // "JUN 12"
  dateLong: string; // "Jun 12, 2026"
  weekday: string; // "TUE"
  time: string; // "9:20p"
  timeLong: string; // "9:20 PM"
  duration: string; // "7h 10m"
  status: FlightStatus;
  bookingRef?: string;
};

export type Person = {
  id: string;
  name: string;
  shortName: string; // "Maya O."
  initials: string;
  email: string;
  description: string;
  flightId: string;
  verified: boolean;
};

export type ConnectionRequest = {
  id: string;
  fromPersonId: string;
  message: string;
  status: 'pending' | 'sent' | 'accepted' | 'declined';
};

export type Connection = {
  id: string;
  personId: string;
  flightId: string;
  lastMessage: string;
  lastTime: string; // "2h", "1d", "14d"
  unread: number;
  closed: boolean; // chat read-only after flight lands
  closesIn?: string; // "3d 4h"
};

export type ChatMessage = {
  id: string;
  threadId: string;
  fromMe: boolean;
  text: string;
};

// ---------- FLIGHTS ----------

export const FLIGHTS: Flight[] = [
  {
    id: 'aa204',
    code: 'AA 204',
    airline: 'American Airlines',
    airlineShort: 'American',
    from: 'JFK',
    fromCity: 'New York',
    to: 'LHR',
    toCity: 'London',
    date: 'JUN 12',
    dateLong: 'Jun 12, 2026',
    weekday: 'TUE',
    time: '9:20p',
    timeLong: '9:20 PM',
    duration: '7h 10m',
    status: 'new',
    bookingRef: 'ABC123',
  },
  {
    id: 'ua88',
    code: 'UA 88',
    airline: 'United Airlines',
    airlineShort: 'United',
    from: 'SFO',
    fromCity: 'San Francisco',
    to: 'NRT',
    toCity: 'Tokyo',
    date: 'AUG 03',
    dateLong: 'Aug 3, 2026',
    weekday: 'SAT',
    time: '11:45a',
    timeLong: '11:45 AM',
    duration: '11h 5m',
    status: 'delayed',
  },
  {
    id: 'dl42',
    code: 'DL 42',
    airline: 'Delta Air Lines',
    airlineShort: 'Delta',
    from: 'ATL',
    fromCity: 'Atlanta',
    to: 'CDG',
    toCity: 'Paris',
    date: 'NOW',
    dateLong: 'In flight',
    weekday: '—',
    time: 'NOW',
    timeLong: 'Now',
    duration: '8h 20m',
    status: 'ongoing',
  },
  {
    id: 'ba117',
    code: 'BA 117',
    airline: 'British Airways',
    airlineShort: 'British',
    from: 'LHR',
    fromCity: 'London',
    to: 'BOS',
    toCity: 'Boston',
    date: 'MAR 02',
    dateLong: 'Mar 2, 2026',
    weekday: 'MON',
    time: '2:10p',
    timeLong: '2:10 PM',
    duration: '7h 40m',
    status: 'complete',
  },
  {
    id: 'nh10',
    code: 'NH 10',
    airline: 'All Nippon Airways',
    airlineShort: 'ANA',
    from: 'NRT',
    fromCity: 'Tokyo',
    to: 'SFO',
    toCity: 'San Francisco',
    date: 'AUG 19',
    dateLong: 'Aug 19, 2026',
    weekday: 'MON',
    time: '5:30p',
    timeLong: '5:30 PM',
    duration: '9h 30m',
    status: 'new',
  },
];

// ---------- PEOPLE ----------

export const PEOPLE: Person[] = [
  {
    id: 'maya',
    name: 'Maya Okafor',
    shortName: 'Maya O.',
    initials: 'MO',
    email: 'maya@email.com',
    description:
      "First solo transatlantic. Bit nervous but excited! If anyone wants to grab a coffee at the gate, I'm in T8 by 7pm. Reading a novel & open to chat.",
    flightId: 'aa204',
    verified: true,
  },
  {
    id: 'dev',
    name: 'Dev Patel',
    shortName: 'Dev P.',
    initials: 'DP',
    email: 'dev@email.com',
    description:
      'Heading to a design conf, down to chat about anything creative on the plane.',
    flightId: 'aa204',
    verified: true,
  },
  {
    id: 'sana',
    name: 'Sana Reyes',
    shortName: 'Sana R.',
    initials: 'SR',
    email: 'sana@email.com',
    description: 'Nervous flyer. Looking for a friendly face at the gate!',
    flightId: 'aa204',
    verified: true,
  },
  {
    id: 'leo',
    name: 'Leo Tan',
    shortName: 'Leo T.',
    initials: 'LT',
    email: 'leo@email.com',
    description: 'Heading to Tokyo for a wedding. Hi!',
    flightId: 'ua88',
    verified: true,
  },
  {
    id: 'jordan',
    name: 'Jordan Hill',
    shortName: 'Jordan H.',
    initials: 'JH',
    email: 'jordan@email.com',
    description: 'Booked the same hotel — nice surprise!',
    flightId: 'ua88',
    verified: true,
  },
  {
    id: 'kira',
    name: 'Kira Nakamura',
    shortName: 'Kira N.',
    initials: 'KN',
    email: 'kira@email.com',
    description: 'Heading home after a London work trip.',
    flightId: 'ba117',
    verified: true,
  },
];

// ---------- REQUESTS ----------

export const REQUESTS: ConnectionRequest[] = [
  {
    id: 'r1',
    fromPersonId: 'dev',
    message: "Hey! Saw we're on the same flight. Down to grab coffee at the gate?",
    status: 'pending',
  },
  {
    id: 'r2',
    fromPersonId: 'sana',
    message: 'Nervous flyer here — would love a friendly face!',
    status: 'pending',
  },
  {
    id: 'r3',
    fromPersonId: 'leo',
    message: 'Heading to Tokyo for a wedding. Hi!',
    status: 'pending',
  },
];

// ---------- CONNECTIONS ----------

export const CONNECTIONS: Connection[] = [
  {
    id: 'c1',
    personId: 'maya',
    flightId: 'aa204',
    lastMessage: 'See you at gate 18!',
    lastTime: 'now',
    unread: 2,
    closed: false,
    closesIn: '3d 4h',
  },
  {
    id: 'c2',
    personId: 'dev',
    flightId: 'aa204',
    lastMessage: 'Which terminal are you flying out of?',
    lastTime: '2h',
    unread: 0,
    closed: false,
    closesIn: '3d 4h',
  },
  {
    id: 'c3',
    personId: 'jordan',
    flightId: 'ua88',
    lastMessage: 'Booked the same hotel 😂',
    lastTime: '1d',
    unread: 0,
    closed: false,
  },
  {
    id: 'c4',
    personId: 'kira',
    flightId: 'ba117',
    lastMessage: 'Thanks, safe flight!',
    lastTime: '14d',
    unread: 0,
    closed: true,
  },
];

// ---------- CHAT THREADS ----------

export const CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  c1: [
    { id: 'm1', threadId: 'c1', fromMe: false, text: "Hey! Saw we're on the same flight 🙌" },
    { id: 'm2', threadId: 'c1', fromMe: false, text: 'First time flying to London — any tips on terminal 8?' },
    {
      id: 'm3',
      threadId: 'c1',
      fromMe: true,
      text: "Hi! Yeah I've done this one a few times. Security gets rough around 6, I usually hit the lounge by 5:30.",
    },
    { id: 'm4', threadId: 'c1', fromMe: false, text: 'Want to grab a coffee before boarding?' },
    { id: 'm5', threadId: 'c1', fromMe: true, text: 'Absolutely. See you at gate 18!' },
  ],
  c2: [
    { id: 'm6', threadId: 'c2', fromMe: false, text: "Hey, how's the trip prep going?" },
    { id: 'm7', threadId: 'c2', fromMe: true, text: 'Almost packed! You?' },
    { id: 'm8', threadId: 'c2', fromMe: false, text: 'Which terminal are you flying out of?' },
  ],
  c3: [
    { id: 'm9', threadId: 'c3', fromMe: false, text: 'Booked the same hotel 😂' },
    { id: 'm10', threadId: 'c3', fromMe: true, text: 'No way! Which floor?' },
  ],
  c4: [
    { id: 'm11', threadId: 'c4', fromMe: true, text: 'Hope the rest of the trip is good!' },
    { id: 'm12', threadId: 'c4', fromMe: false, text: 'Thanks, safe flight!' },
  ],
};

// ---------- HELPERS ----------

export function getFlight(id: string): Flight | undefined {
  return FLIGHTS.find((f) => f.id === id);
}

export function getPerson(id: string): Person | undefined {
  return PEOPLE.find((p) => p.id === id);
}

export function getConnection(id: string): Connection | undefined {
  return CONNECTIONS.find((c) => c.id === id);
}

export function peopleOnFlight(flightId: string): Person[] {
  return PEOPLE.filter((p) => p.flightId === flightId);
}

export function getRequestPerson(req: ConnectionRequest): Person | undefined {
  return getPerson(req.fromPersonId);
}

/**
 * Active flight context — what flight is currently the "Find Travelers" anchor.
 * In real app this would be derived from selected flight in state.
 */
export const ACTIVE_FLIGHT_ID = 'aa204';
