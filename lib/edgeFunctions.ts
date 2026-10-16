import { FunctionsHttpError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export class EdgeFunctionError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'EdgeFunctionError';
  }
}

/**
 * Invoke a Supabase Edge Function as the signed-in user. Upstream API keys live
 * in the function's secrets, never in the app bundle. Throws EdgeFunctionError
 * with the function's own message and HTTP status on failure.
 */
export async function callEdgeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (!error) return data as T;

  if (error instanceof FunctionsHttpError) {
    const status = error.context?.status as number | undefined;
    let message = `Request failed (${status ?? 'unknown'}).`;
    try {
      const parsed = (await error.context.json()) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      // body wasn't JSON; keep the generic message
    }
    throw new EdgeFunctionError(message, status);
  }
  throw new EdgeFunctionError('Network error — check your connection and try again.');
}
