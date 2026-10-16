import { callEdgeFunction, EdgeFunctionError } from '@/lib/edgeFunctions';

// The AeroDataBox key lives in the `flight-lookup` Edge Function's secrets
// (supabase/functions/flight-lookup); the app never sees it.

export type AirportInfo = {
  iata: string;
  name: string;
  city: string | null;
  country: string | null;
  timezone: string | null;
  lat: number | null;
  lon: number | null;
  terminal: string | null;
};

export type FlightLookupResult = {
  flightNumber: string;
  airlineIata: string;
  airlineName: string;
  aircraftModel: string | null;
  origin: AirportInfo;
  destination: AirportInfo;
  scheduledDepartureUtc: string;
  scheduledArrivalUtc: string;
  status: string | null;
  raw: unknown;
};

type RawAirport = {
  iata?: string;
  name?: string;
  municipalityName?: string;
  countryCode?: string;
  timeZone?: string;
  location?: { lat?: number; lon?: number };
};

type RawTime = { utc?: string; local?: string };

type RawFlight = {
  number?: string;
  status?: string;
  airline?: { name?: string; iata?: string };
  aircraft?: { model?: string };
  departure?: { airport?: RawAirport; scheduledTime?: RawTime; terminal?: string };
  arrival?: { airport?: RawAirport; scheduledTime?: RawTime; terminal?: string };
};

export function normalizeFlightNumber(input: string): string {
  return input.replace(/\s+/g, '').toUpperCase();
}

function parseUtc(time: RawTime | undefined): string | null {
  if (!time?.utc) return null;
  // AeroDataBox returns "2026-04-28 02:30Z" — convert to ISO 8601.
  const iso = time.utc.replace(' ', 'T').replace(/Z$/, ':00Z');
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function mapAirport(raw: RawAirport | undefined, terminal: string | undefined): AirportInfo | null {
  if (!raw?.iata || !raw.name) return null;
  return {
    iata: raw.iata,
    name: raw.name,
    city: raw.municipalityName ?? null,
    country: raw.countryCode ?? null,
    timezone: raw.timeZone ?? null,
    lat: raw.location?.lat ?? null,
    lon: raw.location?.lon ?? null,
    terminal: terminal ?? null,
  };
}

function mapFlight(raw: RawFlight): FlightLookupResult | null {
  const number = raw.number ? normalizeFlightNumber(raw.number) : null;
  const airlineIata = raw.airline?.iata;
  const airlineName = raw.airline?.name;
  const origin = mapAirport(raw.departure?.airport, raw.departure?.terminal);
  const destination = mapAirport(raw.arrival?.airport, raw.arrival?.terminal);
  const scheduledDepartureUtc = parseUtc(raw.departure?.scheduledTime);
  const scheduledArrivalUtc = parseUtc(raw.arrival?.scheduledTime);

  if (!number || !airlineIata || !airlineName || !origin || !destination
    || !scheduledDepartureUtc || !scheduledArrivalUtc) {
    return null;
  }

  return {
    flightNumber: number,
    airlineIata,
    airlineName,
    aircraftModel: raw.aircraft?.model ?? null,
    origin,
    destination,
    scheduledDepartureUtc,
    scheduledArrivalUtc,
    status: raw.status ?? null,
    raw,
  };
}

export class AeroDataBoxError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'AeroDataBoxError';
  }
}

export async function lookupFlight(
  flightNumber: string,
  date: string,
): Promise<FlightLookupResult[]> {
  const normalized = normalizeFlightNumber(flightNumber);
  if (!/^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/.test(normalized)) {
    throw new AeroDataBoxError('Flight number looks invalid (e.g. "BA286" or "AA 204").');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AeroDataBoxError('Date must be YYYY-MM-DD (e.g. "2026-04-28").');
  }

  let flights: RawFlight[];
  try {
    const res = await callEdgeFunction<{ flights: RawFlight[] }>('flight-lookup', {
      flightNumber: normalized,
      date,
    });
    flights = res.flights;
  } catch (e) {
    if (e instanceof EdgeFunctionError) throw new AeroDataBoxError(e.message, e.status);
    throw e;
  }
  if (!Array.isArray(flights)) return [];

  return flights.map(mapFlight).filter((f): f is FlightLookupResult => f !== null);
}
