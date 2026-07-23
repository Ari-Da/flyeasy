import { supabase } from '@/lib/supabase';

export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

/** Whether the caller sent the request (`outgoing`) or received it (`incoming`). */
export type ConnectionDirection = 'incoming' | 'outgoing';

/**
 * A connection as seen from the caller's side — already enriched with the OTHER
 * person's profile by the `list_my_connections` RPC (profiles RLS blocks reading
 * other users directly, so the server does the join). `myFlightId` is always the
 * caller's own flight row, which is what the flight chips filter on.
 */
export type MyConnection = {
  id: string;
  status: ConnectionStatus;
  direction: ConnectionDirection;
  otherUserId: string;
  firstName: string;
  lastName: string;
  description: string;
  avatarUrl: string | null;
  myFlightId: string;
  message: string | null;
  createdAt: string;
};

type RawConnection = {
  id: string;
  status: ConnectionStatus;
  direction: ConnectionDirection;
  other_user_id: string;
  first_name: string;
  last_name: string;
  description: string;
  avatar_url: string | null;
  my_flight_id: string;
  message: string | null;
  created_at: string;
};

/**
 * Send a connection request to another traveller on `myFlightId`. Goes through
 * the `send_connection_request` RPC (the only write path into `connections`),
 * which verifies both users are actually on the same flight — see docs/DATABASE.md.
 * Throws on the unique-constraint violation if a request already exists either way.
 */
export async function sendConnectionRequest(targetUserId: string, myFlightId: string): Promise<void> {
  const { error } = await supabase.rpc('send_connection_request', {
    target_user_id: targetUserId,
    my_flight_id: myFlightId,
  });
  if (error) throw new Error(error.message);
}

/** Every connection the caller is part of, across all flights. Callers filter
 * by status / direction / flight themselves (one query serves both screens). */
export async function fetchMyConnections(): Promise<MyConnection[]> {
  const { data, error } = await supabase.rpc('list_my_connections');
  if (error) throw new Error(error.message);
  return ((data ?? []) as RawConnection[]).map((r) => ({
    id: r.id,
    status: r.status,
    direction: r.direction,
    otherUserId: r.other_user_id,
    firstName: r.first_name,
    lastName: r.last_name,
    description: r.description,
    avatarUrl: r.avatar_url,
    myFlightId: r.my_flight_id,
    message: r.message,
    createdAt: r.created_at,
  }));
}

/**
 * Withdraw a request you sent. Deletes the row outright (rather than marking it
 * declined) so the pair can connect again later with a clean slate — the
 * `connections_delete_requester` RLS policy allows this only for the requester
 * and only while the row is still `pending`.
 */
export async function withdrawRequest(connectionId: string): Promise<void> {
  const { error } = await supabase.from('connections').delete().eq('id', connectionId);
  if (error) throw new Error(error.message);
}

/**
 * Accept or decline a pending request. Direct table update (not an RPC): the
 * `connections_update_addressee` RLS policy allows it only for the addressee and
 * only while the row is still `pending`.
 */
export async function respondToRequest(connectionId: string, accept: boolean): Promise<void> {
  const { error } = await supabase
    .from('connections')
    .update({ status: accept ? 'accepted' : 'declined', updated_at: new Date().toISOString() })
    .eq('id', connectionId);
  if (error) throw new Error(error.message);
}
