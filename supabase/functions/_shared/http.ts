// Shared helpers for Edge Functions. Functions are deployed with verify_jwt on
// (the default), so the gateway already rejects calls without a valid Supabase
// JWT. We additionally reject the anon key itself: it is a valid JWT but carries
// no user, and the anon key ships in the app bundle.

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}

export function preflight(req: Request): Response | null {
  return req.method === 'OPTIONS' ? new Response(null, { status: 204, headers: CORS_HEADERS }) : null;
}

/** Returns the signed-in user's id, or null if the JWT is the anon key / not a user. */
export function userIdFromJwt(req: Request): string | null {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.role === 'authenticated' && typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}
