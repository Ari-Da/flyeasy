import { json, preflight, userIdFromJwt } from '../_shared/http.ts';

const HOST = 'aerodatabox.p.rapidapi.com';
const FLIGHT_RE = /^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  if (!userIdFromJwt(req)) return json({ error: 'Sign in required.' }, 401);

  const key = Deno.env.get('AERODATABOX_KEY');
  if (!key) return json({ error: 'Flight lookup is not configured.' }, 500);

  let body: { flightNumber?: unknown; date?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }
  const flightNumber = typeof body.flightNumber === 'string'
    ? body.flightNumber.replace(/\s+/g, '').toUpperCase()
    : '';
  const date = typeof body.date === 'string' ? body.date : '';
  if (!FLIGHT_RE.test(flightNumber)) return json({ error: 'Flight number looks invalid.' }, 400);
  if (!DATE_RE.test(date)) return json({ error: 'Date must be YYYY-MM-DD.' }, 400);

  // dateLocalRole=Departure: see the note in lib/aerodatabox.ts history — anchor
  // on the departure date so overnight flights don't surface twice.
  const url = `https://${HOST}/flights/number/${encodeURIComponent(flightNumber)}/${encodeURIComponent(date)}?withAircraftImage=false&withLocation=true&dateLocalRole=Departure`;

  let res: Response;
  try {
    res = await fetch(url, { headers: { 'x-rapidapi-host': HOST, 'x-rapidapi-key': key } });
  } catch {
    return json({ error: 'Upstream network error.' }, 502);
  }

  if (res.status === 204 || res.status === 404) return json({ flights: [] });
  if (res.status === 429) return json({ error: 'Rate limit hit on AeroDataBox — try again later.' }, 429);
  // Never forward the vendor's 401/403: it would read as a client auth problem.
  if (!res.ok) return json({ error: `AeroDataBox error (${res.status}).` }, 502);

  const flights = await res.json();
  return json({ flights: Array.isArray(flights) ? flights : [] });
});
