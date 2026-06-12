import {
  BOOKMAKER_META,
  DEFAULT_BOOKMAKER_KEYS,
  LOCAL_TEAM_NAME_TO_ENGLISH,
  americanToDecimalOdds,
  buildProbabilitySummary,
} from "../../../src/lib/matchOdds.js";

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type MatchOddsRequest = {
  matchId?: string;
  matchNo?: number;
  home?: string;
  away?: string;
  kickoff?: string;
};

type BettingProsParticipant = {
  id: string | number;
  name: string;
  team?: {
    country?: string;
    slug?: string;
  };
};

type BettingProsEvent = {
  id: number;
  home: string | number;
  visitor: string | number;
  participants: BettingProsParticipant[];
};

type BettingProsBook = {
  id: number;
  name?: string;
  display_name?: string;
  slug?: string;
};

type BettingProsLine = {
  cost: number | null;
};

type BettingProsSelectionBook = {
  id: number;
  lines?: BettingProsLine[];
};

type BettingProsSelection = {
  participant: string | number | null;
  selection?: string;
  label?: string;
  short_label?: string;
  books: BettingProsSelectionBook[];
};

type BettingProsOffer = {
  event_id: number;
  selections: BettingProsSelection[];
};

const BETTINGPROS_API_BASE_URL = "https://api.bettingpros.com/v3";
const BETTINGPROS_PUBLIC_API_KEY = "CHi8Hy5CEE4khd46XNYL23dCFX96oUdw6qOt1Dnh";
const BETTINGPROS_WORLD_CUP_COMPETITION_ID = 8;
const MONEYLINE_MARKET_ID = 242;
const CACHE_TTL_MS = 5 * 60 * 1000;
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const COMMON_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
  Accept: "application/json,text/plain,*/*",
  "Accept-Language": "en-US,en;q=0.9",
};
const BOOKMAKER_MATCHERS: Record<string, string[]> = {
  draftkings: ["draftkings"],
  betmgm: ["betmgm", "bet mgm"],
  caesars: ["caesars"],
  betrivers: ["betrivers", "bet rivers"],
  partycasino: ["partycasino", "party casino"],
};

let cachedBooks: BettingProsBook[] | null = null;
let booksCachedAt = 0;
const responseCache = new Map<string, { cachedAt: number; payload: Json }>();

function jsonResponse(body: Json, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

function normalizeName(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildNameCandidates(teamName: string) {
  return [
    teamName,
    LOCAL_TEAM_NAME_TO_ENGLISH[teamName as keyof typeof LOCAL_TEAM_NAME_TO_ENGLISH],
  ]
    .filter(Boolean)
    .map((value) => normalizeName(String(value)));
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildDateCandidates(kickoff: string | undefined) {
  const base = kickoff ? new Date(kickoff) : new Date();
  const dates = new Set<string>();
  dates.add(String(kickoff || "").slice(0, 10));
  dates.add(toDateKey(base));

  const dayMs = 24 * 60 * 60 * 1000;
  dates.add(toDateKey(new Date(base.getTime() - dayMs)));
  dates.add(toDateKey(new Date(base.getTime() + dayMs)));

  return [...dates].filter(Boolean);
}

async function fetchBettingProsJson<T>(path: string) {
  const response = await fetch(`${BETTINGPROS_API_BASE_URL}${path}`, {
    headers: {
      ...COMMON_HEADERS,
      "x-api-key": BETTINGPROS_PUBLIC_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`bettingpros_fetch_failed:${response.status}:${path}`);
  }

  return response.json() as Promise<T>;
}

async function fetchBooks() {
  const now = Date.now();
  if (cachedBooks && now - booksCachedAt < CACHE_TTL_MS) return cachedBooks;

  const payload = await fetchBettingProsJson<{ books?: BettingProsBook[] }>("/books");
  cachedBooks = Array.isArray(payload.books) ? payload.books : [];
  booksCachedAt = now;
  return cachedBooks;
}

function isSameMatch(event: BettingProsEvent, request: MatchOddsRequest) {
  const homeCandidates = buildNameCandidates(request.home || "");
  const awayCandidates = buildNameCandidates(request.away || "");
  const eventNames = event.participants.map((participant) => normalizeName(participant.name));

  return (
    homeCandidates.some((candidate) => eventNames.includes(candidate))
    && awayCandidates.some((candidate) => eventNames.includes(candidate))
  );
}

async function findEvent(request: MatchOddsRequest) {
  for (const dateKey of buildDateCandidates(request.kickoff)) {
    const payload = await fetchBettingProsJson<{ events?: BettingProsEvent[] }>(
      `/events?sport=SOCCER&date=${dateKey}&comp_id=${BETTINGPROS_WORLD_CUP_COMPETITION_ID}&season_type=REG:CC:PST:PIT:CT:IST&lineups=true&park_factors=true&officials=false`,
    );
    const event = (payload.events || []).find((item) => isSameMatch(item, request));
    if (event) return event;
  }

  return null;
}

function mergeOfferResponses(primary: BettingProsOffer | null, secondary: BettingProsOffer | null) {
  if (!primary && !secondary) return null;
  if (!primary) return secondary;
  if (!secondary) return primary;

  const mergedSelections = primary.selections.map((selection) => {
    const counterpart = secondary.selections.find((item) => item.participant === selection.participant && item.selection === selection.selection);
    if (!counterpart) return selection;

    const mergedBooks = new Map<number, BettingProsSelectionBook>();
    for (const book of selection.books || []) mergedBooks.set(book.id, book);
    for (const book of counterpart.books || []) mergedBooks.set(book.id, book);
    return {
      ...selection,
      books: [...mergedBooks.values()],
    };
  });

  return {
    ...primary,
    selections: mergedSelections,
  };
}

async function fetchMoneylineOffer(eventId: number) {
  const [defaultPayload, ontarioPayload] = await Promise.all([
    fetchBettingProsJson<{ offers?: BettingProsOffer[] }>(`/offers?sport=SOCCER&market_id=${MONEYLINE_MARKET_ID}&event_id=${eventId}&limit=10&page=1`),
    fetchBettingProsJson<{ offers?: BettingProsOffer[] }>(`/offers?sport=SOCCER&market_id=${MONEYLINE_MARKET_ID}&event_id=${eventId}&limit=10&page=1&location=ON`),
  ]);

  return mergeOfferResponses(defaultPayload.offers?.[0] || null, ontarioPayload.offers?.[0] || null);
}

function findBookSource(books: BettingProsBook[], key: string) {
  const matchers = BOOKMAKER_MATCHERS[key] || [];
  return books.find((book) => {
    const haystack = `${book.name || ""} ${book.display_name || ""} ${book.slug || ""}`.toLowerCase();
    return matchers.some((matcher) => haystack.includes(matcher));
  }) || null;
}

function findSelectionByTeam(offer: BettingProsOffer, teamName: string) {
  const candidates = buildNameCandidates(teamName);
  return offer.selections.find((item) => {
    const labelCandidates = [item.label, item.short_label]
      .filter(Boolean)
      .map((value) => normalizeName(String(value)));
    return candidates.some((candidate) => labelCandidates.includes(candidate));
  }) || null;
}

function findSelectionOdds(offer: BettingProsOffer, request: MatchOddsRequest, participantType: "home" | "away" | "draw", bookId: number) {
  const selection = participantType === "draw"
    ? offer.selections.find((item) => item.selection === "draw" || item.participant == null)
    : findSelectionByTeam(offer, participantType === "home" ? request.home || "" : request.away || "");
  const book = selection?.books.find((item) => item.id === bookId);
  return americanToDecimalOdds(book?.lines?.[0]?.cost ?? null);
}

function buildBookmakerRows(books: BettingProsBook[], offer: BettingProsOffer | null, request: MatchOddsRequest | null) {
  return DEFAULT_BOOKMAKER_KEYS.map((key) => {
    const sourceBook = findBookSource(books, key);
    if (!sourceBook || !offer || !request) {
      return {
        key,
        label: BOOKMAKER_META[key].label,
        homeOdds: null,
        drawOdds: null,
        awayOdds: null,
        status: "missing",
      };
    }

    const homeOdds = findSelectionOdds(offer, request, "home", sourceBook.id);
    const drawOdds = findSelectionOdds(offer, request, "draw", sourceBook.id);
    const awayOdds = findSelectionOdds(offer, request, "away", sourceBook.id);

    return {
      key,
      label: BOOKMAKER_META[key].label,
      homeOdds,
      drawOdds,
      awayOdds,
      status: Number.isFinite(homeOdds) && Number.isFinite(drawOdds) && Number.isFinite(awayOdds) ? "ready" : "missing",
    };
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: CORS_HEADERS });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const request = (await req.json()) as MatchOddsRequest;
    const cacheKey = `${request.matchId || ""}:${request.home || ""}:${request.away || ""}:${request.kickoff || ""}`;
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return jsonResponse(cached.payload);
    }

    const [books, event] = await Promise.all([
      fetchBooks(),
      findEvent(request),
    ]);
    const offer = event ? await fetchMoneylineOffer(event.id) : null;
    const bookmakers = buildBookmakerRows(books, offer, request);
    const probabilities = buildProbabilitySummary(bookmakers);

    const payload = {
      matchId: request.matchId || null,
      source: "bettingpros",
      fetchedAt: new Date().toISOString(),
      bookmakers,
      probabilities,
    };

    responseCache.set(cacheKey, {
      cachedAt: Date.now(),
      payload,
    });

    return jsonResponse(payload);
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});
