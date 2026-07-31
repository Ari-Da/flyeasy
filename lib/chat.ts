import { supabase } from '@/lib/supabase';

/** A chat thread as shown in the list — one per accepted connection, enriched
 * with the other person's profile, the last message, and unread/pause state. */
export type ChatThread = {
  id: string; // connection id
  otherUserId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  /** This user has paused this chat. */
  iPaused: boolean;
  /** The other person has paused this chat. */
  otherPaused: boolean;
  myFlightId: string;
};

export type Message = {
  id: string;
  connectionId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

type RawThread = {
  id: string;
  other_user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  i_paused: boolean;
  other_paused: boolean;
  my_flight_id: string;
};

type RawMessage = {
  id: string;
  connection_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function mapMessage(r: RawMessage): Message {
  return {
    id: r.id,
    connectionId: r.connection_id,
    senderId: r.sender_id,
    body: r.body,
    createdAt: r.created_at,
  };
}

/** All accepted-connection threads for the caller (enriched via list_my_chats). */
export async function fetchChatThreads(): Promise<ChatThread[]> {
  const { data, error } = await supabase.rpc('list_my_chats');
  if (error) throw new Error(error.message);
  return ((data ?? []) as RawThread[]).map((r) => ({
    id: r.id,
    otherUserId: r.other_user_id,
    firstName: r.first_name,
    lastName: r.last_name,
    avatarUrl: r.avatar_url,
    lastMessage: r.last_message,
    lastMessageAt: r.last_message_at,
    unreadCount: r.unread_count ?? 0,
    iPaused: r.i_paused,
    otherPaused: r.other_paused,
    myFlightId: r.my_flight_id,
  }));
}

/** Messages in a thread, oldest first. `id` breaks ties on equal timestamps so
 * the order is stable. RLS returns only messages in connections you're in. */
export async function fetchMessages(connectionId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, connection_id, sender_id, body, created_at')
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as RawMessage[]).map(mapMessage);
}

/**
 * Send a message via the `send_message` RPC — the only write path. It sets
 * sender/created_at server-side and raises a real error if the chat is paused
 * (either side), so a frozen send fails loudly rather than silently.
 */
export async function sendMessage(connectionId: string, body: string): Promise<Message> {
  const { data, error } = await supabase.rpc('send_message', { conn_id: connectionId, body });
  if (error) throw new Error(error.message);
  return mapMessage(data as RawMessage);
}

/** Pause or resume this chat from the caller's side. Chat is writable only when
 * NEITHER side is paused, so resuming requires every side that paused to clear it. */
export async function setChatPaused(connectionId: string, paused: boolean): Promise<void> {
  const { error } = await supabase.rpc('set_chat_paused', { conn_id: connectionId, paused });
  if (error) throw new Error(error.message);
}

/** Mark the thread read up to now (resets this user's unread count). */
export async function markChatRead(connectionId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_chat_read', { conn_id: connectionId });
  if (error) throw new Error(error.message);
}
