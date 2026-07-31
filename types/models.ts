/**
 * Shared domain types for the app's UI layer. These describe the shapes screens
 * and components render — independent of where the data comes from (Supabase in
 * production, `data/mock.ts` behind the dev flags).
 */

import type { FlightStatus } from '@/lib/flights';

export type { FlightStatus };

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
  flightMessage?: string;
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
  /** Profile photo URL. Falls back to initials when absent. */
  avatarUrl?: string | null;
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
