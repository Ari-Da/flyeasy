import type { Flight } from '@/data/mock';
import { supabase } from '@/lib/supabase';

export const FLIGHT_STATUS = {
  NEW: 'new',
  ONGOING: 'ongoing',
  DELAYED: 'delayed',
  COMPLETE: 'complete',
} as const;

export type FlightStatus = (typeof FLIGHT_STATUS)[keyof typeof FLIGHT_STATUS];

export const FLIGHT_STATUSES = Object.values(FLIGHT_STATUS) as readonly FlightStatus[];

export type DbFlight = {
  id: string;
  user_id: string;
  flight_number: string;
  airline_iata: string;
  airline_name: string;
  aircraft_model: string | null;
  origin_iata: string;
  origin_name: string;
  origin_city: string | null;
  origin_country: string | null;
  origin_timezone: string | null;
  origin_lat: number | null;
  origin_lon: number | null;
  origin_terminal: string | null;
  destination_iata: string;
  destination_name: string;
  destination_city: string | null;
  destination_country: string | null;
  destination_timezone: string | null;
  destination_lat: number | null;
  destination_lon: number | null;
  destination_terminal: string | null;
  scheduled_departure_utc: string;
  scheduled_arrival_utc: string;
  status: string | null;
  pnr: string | null;
  verified: boolean;
  raw_response: unknown;
  flight_message: string;
  created_at: string;
  updated_at: string;
};

function fmt(utcIso: string, tz: string | null, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz ?? 'UTC', ...opts }).format(new Date(utcIso));
}

function formatTimeShort(utcIso: string, tz: string | null): string {
  const long = fmt(utcIso, tz, { hour: 'numeric', minute: '2-digit', hour12: true });
  return long.replace(/\s?AM$/i, 'a').replace(/\s?PM$/i, 'p');
}

function formatDuration(depUtc: string, arrUtc: string): string {
  const ms = new Date(arrUtc).getTime() - new Date(depUtc).getTime();
  const total = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${m}m`;
}

function airlineShort(name: string): string {
  const first = name.split(/\s+/)[0];
  return first || name;
}

function formatCode(flightNumber: string, airlineIata: string): string {
  const num = flightNumber.startsWith(airlineIata) ? flightNumber.slice(airlineIata.length) : flightNumber;
  return `${airlineIata} ${num}`;
}

function computeStatus(row: DbFlight, now: Date): FlightStatus {
  const dep = new Date(row.scheduled_departure_utc);
  const arr = new Date(row.scheduled_arrival_utc);
  const raw = row.status ?? '';

  if (/cancel|delay/i.test(raw)) return FLIGHT_STATUS.DELAYED;
  if (now >= arr) return FLIGHT_STATUS.COMPLETE;
  if (now >= dep) return FLIGHT_STATUS.ONGOING;
  return FLIGHT_STATUS.NEW;
}

export function dbFlightToFlight(row: DbFlight, now: Date = new Date()): Flight {
  const tz = row.origin_timezone;
  return {
    id: row.id,
    code: formatCode(row.flight_number, row.airline_iata),
    airline: row.airline_name,
    airlineShort: airlineShort(row.airline_name),
    from: row.origin_iata,
    fromCity: row.origin_city ?? row.origin_name,
    to: row.destination_iata,
    toCity: row.destination_city ?? row.destination_name,
    date: fmt(row.scheduled_departure_utc, tz, { month: 'short', day: 'numeric' }).toUpperCase(),
    dateLong: fmt(row.scheduled_departure_utc, tz, { month: 'short', day: 'numeric', year: 'numeric' }),
    weekday: fmt(row.scheduled_departure_utc, tz, { weekday: 'short' }).toUpperCase(),
    time: formatTimeShort(row.scheduled_departure_utc, tz),
    timeLong: fmt(row.scheduled_departure_utc, tz, { hour: 'numeric', minute: '2-digit', hour12: true }),
    duration: formatDuration(row.scheduled_departure_utc, row.scheduled_arrival_utc),
    status: computeStatus(row, now),
    bookingRef: row.pnr ?? undefined,
    flightMessage: row.flight_message ?? '',
  };
}

export async function fetchUserFlights(): Promise<Flight[]> {
  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .order('scheduled_departure_utc', { ascending: true });

  if (error) throw new Error(error.message);
  const now = new Date();
  return (data as DbFlight[]).map((row) => dbFlightToFlight(row, now));
}

export async function fetchFlight(id: string): Promise<Flight | null> {
  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return dbFlightToFlight(data as DbFlight);
}

export async function fetchNextUpcomingFlight(): Promise<Flight | null> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .gt('scheduled_arrival_utc', nowIso)
    .order('scheduled_departure_utc', { ascending: true })
    .limit(1);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return null;
  return dbFlightToFlight(data[0] as DbFlight);
}

export async function fetchUpcomingFlights(): Promise<Flight[]> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .gt('scheduled_arrival_utc', nowIso)
    .order('scheduled_departure_utc', { ascending: true });

  if (error) throw new Error(error.message);
  const now = new Date();
  return (data as DbFlight[]).map((row) => dbFlightToFlight(row, now));
}

export async function deleteFlight(id: string): Promise<void> {
  const { error } = await supabase.from('flights').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateFlightMessage(id: string, message: string): Promise<void> {
  const { error } = await supabase
    .from('flights')
    .update({ flight_message: message })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export type Traveler = {
  userId: string;
  firstName: string;
  lastName: string;
  description: string;
  flightMessage: string;
  matchedFlightId: string;
};

export async function fetchTravelersOnFlight(flightId: string): Promise<Traveler[]> {
  const { data, error } = await supabase.rpc('find_travelers_on_flight', {
    flight_id_param: flightId,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<{
    user_id: string;
    first_name: string;
    last_name: string;
    description: string;
    flight_message: string;
    matched_flight_id: string;
  }>).map((row) => ({
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    description: row.description,
    flightMessage: row.flight_message,
    matchedFlightId: row.matched_flight_id,
  }));
}
