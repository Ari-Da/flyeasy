// Phase 3 MVP — calls the Anthropic API directly from the client. Same trade-off
// as lib/aerodatabox.ts: the API key ships in the JS bundle (EXPO_PUBLIC_*),
// acceptable for personal-use dev only. Move to a Supabase Edge Function before
// any public release; that layer should use @anthropic-ai/sdk properly.
//
// Using fetch instead of @anthropic-ai/sdk because the SDK has known runtime
// quirks under Hermes/Metro. One HTTP call doesn't need the SDK; the future
// server-side proxy will.

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5';
// const MODEL = 'claude-opus-4-7';

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

const CATEGORIES_LIST = SUGGESTION_CATEGORIES.join(' | ');

const SYSTEM_PROMPT = `You are a knowledgeable airport guide. The traveler will tell you which airport (and possibly which terminal) they will be at. Suggest 4 to 6 specific spots they should consider — restaurants, lounges, sleeping pods, attractions, or notable shops.

Rules:
- Frame suggestions as "worth checking out" — never claim opening hours or prices, since those change.
- Walking-time estimates are approximate; phrase them relative to typical gates in the terminal.
- Be specific: name actual venues over generic categories (e.g., "Plaza Premium Lounge" not "a lounge").
- If a terminal is provided, prefer spots in that terminal. If not, prefer well-known airside spots.
- One or two sentences per description. Skip the puffery.

Respond with ONLY a JSON object — no markdown, no code fences, no commentary before or after. The JSON must match this shape exactly:

{
  "suggestions": [
    {
      "name": "string — venue name",
      "category": "${CATEGORIES_LIST}",
      "description": "string — one or two sentences",
      "walkingTime": "string — e.g. '~5 min from typical gates'"
    }
  ]
}

Include 4 to 6 entries in the suggestions array. Use only the category values listed above.`;

function buildUserPrompt(ctx: SuggestionContext): string {
  const lines = [
    `Airport: ${ctx.airportName} (${ctx.airportIata})${ctx.airportCity ? `, ${ctx.airportCity}` : ''}`,
    ctx.terminal ? `Terminal: ${ctx.terminal}` : null,
    `Context: traveler is ${ctx.mode === 'departing' ? 'departing from' : 'arriving at'} this airport.`,
    ctx.hoursUntilFlight !== null
      ? `Time until flight: ~${ctx.hoursUntilFlight} hour(s).`
      : null,
    '',
    'Suggest 4 to 6 specific spots worth checking out.',
  ];
  return lines.filter(Boolean).join('\n');
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
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new SuggestionsError('Missing EXPO_PUBLIC_ANTHROPIC_API_KEY in .env.local');
  }

  let res: Response;
  try {
    res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserPrompt(ctx) }],
      }),
    });
  } catch {
    throw new SuggestionsError('Network error — check your connection and try again.');
  }

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.text();
      const parsed = JSON.parse(body) as { error?: { message?: string; type?: string } };
      detail = parsed.error?.message ?? body.slice(0, 200);
    } catch {
      // body wasn't JSON; ignore
    }
    if (res.status === 401 || res.status === 403) {
      throw new SuggestionsError(`Anthropic rejected the API key. ${detail}`.trim(), res.status);
    }
    if (res.status === 429) {
      throw new SuggestionsError(`Rate limit hit — try again in a moment. ${detail}`.trim(), 429);
    }
    throw new SuggestionsError(`Anthropic error (${res.status}): ${detail || 'no detail'}`, res.status);
  }

  const json = (await res.json()) as {
    content: Array<{ type: string; text?: string }>;
  };

  const text = json.content.find((b) => b.type === 'text')?.text;
  if (!text) throw new SuggestionsError('No text response from Claude.');

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
