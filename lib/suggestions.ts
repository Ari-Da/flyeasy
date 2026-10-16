// Suggestions come from the `airport-suggestions` Edge Function
// (supabase/functions/airport-suggestions), which holds the Anthropic key, the
// system prompt and the model choice. The app only sends airport context.

import { callEdgeFunction, EdgeFunctionError } from '@/lib/edgeFunctions';

export const SUGGESTION_CATEGORIES = ['food', 'lounge', 'rest', 'shop', 'attraction'] as const;
export type SuggestionCategory = (typeof SUGGESTION_CATEGORIES)[number];

export type AirportSuggestion = {
  name: string;
  category: SuggestionCategory;
  description: string;
  walkingTime: string;
};

export type SuggestionContext = {
  airportIata: string;
  airportName: string;
  airportCity: string | null;
  terminal: string | null;
  mode: 'departing' | 'arriving';
  hoursUntilFlight: number | null;
};

export class SuggestionsError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'SuggestionsError';
  }
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

export async function fetchAirportSuggestions(ctx: SuggestionContext): Promise<AirportSuggestion[]> {
  let text: string;
  try {
    ({ text } = await callEdgeFunction<{ text: string }>('airport-suggestions', ctx));
  } catch (e) {
    if (e instanceof EdgeFunctionError) throw new SuggestionsError(e.message, e.status);
    throw e;
  }

  let parsed: { suggestions: AirportSuggestion[] };
  try {
    parsed = JSON.parse(extractJson(text));
  } catch {
    throw new SuggestionsError('Could not parse suggestions response.');
  }

  if (!Array.isArray(parsed.suggestions)) {
    throw new SuggestionsError('Suggestions response missing expected shape.');
  }

  return parsed.suggestions;
}
