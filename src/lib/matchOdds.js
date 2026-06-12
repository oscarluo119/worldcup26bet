import { getTeamProfileByName } from "./teamProfiles.js";

export const DEFAULT_BOOKMAKER_KEYS = [
  "draftkings",
  "betmgm",
  "caesars",
  "betrivers",
  "partycasino",
];

export const BOOKMAKER_META = {
  draftkings: { label: "DraftKings" },
  betmgm: { label: "BetMGM" },
  caesars: { label: "Caesars" },
  betrivers: { label: "BetRivers" },
  partycasino: { label: "PartyCasino" },
};

const BETTINGPROS_API_BASE_URL = "https://api.bettingpros.com/v3";
const BETTINGPROS_PUBLIC_API_KEY = "CHi8Hy5CEE4khd46XNYL23dCFX96oUdw6qOt1Dnh";
const BETTINGPROS_WORLD_CUP_COMPETITION_ID = 8;
const BETTINGPROS_MONEYLINE_MARKET_ID = 242;
const BOOKMAKER_MATCHERS = {
  draftkings: ["draftkings"],
  betmgm: ["betmgm", "bet mgm"],
  caesars: ["caesars"],
  betrivers: ["betrivers", "bet rivers"],
  partycasino: ["partycasino", "party casino"],
};

export const LOCAL_TEAM_NAME_TO_ENGLISH = {
  "\u58a8\u897f\u54e5": "Mexico",
  "\u5357\u975e": "South Africa",
  "\u97e9\u56fd": "South Korea",
  "\u6377\u514b": "Czech Republic",
  "\u52a0\u62ff\u5927": "Canada",
  "\u6ce2\u9ed1": "Bosnia and Herzegovina",
  "\u7f8e\u56fd": "USA",
  "\u5df4\u62c9\u572d": "Paraguay",
  "\u5361\u5854\u5c14": "Qatar",
  "\u745e\u58eb": "Switzerland",
  "\u5df4\u897f": "Brazil",
  "\u6469\u6d1b\u54e5": "Morocco",
  "\u6d77\u5730": "Haiti",
  "\u82cf\u683c\u5170": "Scotland",
  "\u6fb3\u5927\u5229\u4e9a": "Australia",
  "\u571f\u8033\u5176": "Turkey",
  "\u5fb7\u56fd": "Germany",
  "\u5e93\u62c9\u7d22": "Curacao",
  "\u8377\u5170": "Netherlands",
  "\u65e5\u672c": "Japan",
  "\u79d1\u7279\u8fea\u74e6": "Ivory Coast",
  "\u5384\u74dc\u591a\u5c14": "Ecuador",
  "\u745e\u5178": "Sweden",
  "\u7a81\u5c3c\u65af": "Tunisia",
  "\u897f\u73ed\u7259": "Spain",
  "\u4f5b\u5f97\u89d2": "Cape Verde",
  "\u6bd4\u5229\u65f6": "Belgium",
  "\u57c3\u53ca": "Egypt",
  "\u6c99\u7279\u963f\u62c9\u4f2f": "Saudi Arabia",
  "\u4e4c\u62c9\u572d": "Uruguay",
  "\u4f0a\u6717": "Iran",
  "\u65b0\u897f\u5170": "New Zealand",
  "\u6cd5\u56fd": "France",
  "\u585e\u5185\u52a0\u5c14": "Senegal",
  "\u4f0a\u62c9\u514b": "Iraq",
  "\u632a\u5a01": "Norway",
  "\u963f\u6839\u5ef7": "Argentina",
  "\u963f\u5c14\u53ca\u5229\u4e9a": "Algeria",
  "\u5965\u5730\u5229": "Austria",
  "\u7ea6\u65e6": "Jordan",
  "\u8461\u8404\u7259": "Portugal",
  "\u521a\u679c\u6c11\u4e3b\u5171\u548c\u56fd": "DR Congo",
  "\u82f1\u683c\u5170": "England",
  "\u514b\u7f57\u5730\u4e9a": "Croatia",
  "\u52a0\u7eb3": "Ghana",
  "\u5df4\u62ff\u9a6c": "Panama",
  "\u4e4c\u5179\u522b\u514b\u65af\u5766": "Uzbekistan",
  "\u54e5\u4f26\u6bd4\u4e9a": "Colombia",
};

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildEmptyBookmakers() {
  return DEFAULT_BOOKMAKER_KEYS.map((key) => ({
    key,
    label: BOOKMAKER_META[key].label,
    homeOdds: null,
    drawOdds: null,
    awayOdds: null,
    status: "missing",
  }));
}

export function americanToDecimalOdds(value) {
  if (!Number.isFinite(value) || value === 0) return null;
  if (value > 0) return Number((1 + (value / 100)).toFixed(2));
  return Number((1 + (100 / Math.abs(value))).toFixed(2));
}

function devigBookmaker(bookmaker) {
  if (
    !Number.isFinite(bookmaker?.homeOdds)
    || !Number.isFinite(bookmaker?.drawOdds)
    || !Number.isFinite(bookmaker?.awayOdds)
  ) {
    return null;
  }

  const home = 1 / bookmaker.homeOdds;
  const draw = 1 / bookmaker.drawOdds;
  const away = 1 / bookmaker.awayOdds;
  const total = home + draw + away;

  return {
    home: home / total,
    draw: draw / total,
    away: away / total,
  };
}

function roundPercentages(probabilities) {
  const raw = [
    { key: "home", value: probabilities.home * 100 },
    { key: "draw", value: probabilities.draw * 100 },
    { key: "away", value: probabilities.away * 100 },
  ];
  const rounded = raw.map((item) => ({ ...item, rounded: Math.floor(item.value) }));
  let remainder = 100 - rounded.reduce((sum, item) => sum + item.rounded, 0);
  const byFraction = [...rounded].sort((a, b) => (b.value - b.rounded) - (a.value - a.rounded));

  while (remainder > 0) {
    const next = byFraction.shift();
    if (!next) break;
    const target = rounded.find((item) => item.key === next.key);
    target.rounded += 1;
    remainder -= 1;
  }

  return Object.fromEntries(rounded.map((item) => [item.key, item.rounded]));
}

export function buildProbabilitySummary(bookmakers) {
  const available = (bookmakers || []).map(devigBookmaker).filter(Boolean);
  if (!available.length) return null;

  const home = average(available.map((item) => item.home));
  const draw = average(available.map((item) => item.draw));
  const away = average(available.map((item) => item.away));
  const rounded = roundPercentages({ home, draw, away });

  return {
    home: rounded.home,
    draw: rounded.draw,
    away: rounded.away,
    sampleSize: available.length,
    completeness: Number((available.length / DEFAULT_BOOKMAKER_KEYS.length).toFixed(1)),
  };
}

export function normalizeMatchOddsPayload(payload) {
  const fallback = buildEmptyBookmakers();
  const rows = Array.isArray(payload?.bookmakers) ? payload.bookmakers : [];

  const bookmakers = DEFAULT_BOOKMAKER_KEYS.map((key, index) => {
    const row = rows.find((item) => item?.key === key);
    if (!row) return fallback[index];
    return {
      key,
      label: BOOKMAKER_META[key].label,
      homeOdds: Number.isFinite(row.homeOdds) ? row.homeOdds : null,
      drawOdds: Number.isFinite(row.drawOdds) ? row.drawOdds : null,
      awayOdds: Number.isFinite(row.awayOdds) ? row.awayOdds : null,
      status: row.status === "ready" ? "ready" : "missing",
    };
  });

  const probabilities = payload?.probabilities
    ? {
        home: Number(payload.probabilities.home),
        draw: Number(payload.probabilities.draw),
        away: Number(payload.probabilities.away),
        sampleSize: Number(payload.probabilities.sampleSize),
        completeness: Number(payload.probabilities.completeness),
      }
    : buildProbabilitySummary(bookmakers);

  return {
    bookmakers,
    probabilities: probabilities && Number.isFinite(probabilities.home) ? probabilities : null,
  };
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildNameCandidates(teamName) {
  return [
    teamName,
    LOCAL_TEAM_NAME_TO_ENGLISH[teamName || ""],
    getTeamProfileByName(teamName || "")?.teamName,
  ].filter(Boolean).map((value) => normalizeName(value));
}

function buildDateCandidates(kickoff) {
  const base = kickoff ? new Date(kickoff) : new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const dates = new Set([
    String(kickoff || "").slice(0, 10),
    base.toISOString().slice(0, 10),
    new Date(base.getTime() - dayMs).toISOString().slice(0, 10),
    new Date(base.getTime() + dayMs).toISOString().slice(0, 10),
  ]);
  return [...dates].filter(Boolean);
}

async function fetchBettingProsJson(path, fetchImpl) {
  const response = await fetchImpl(`${BETTINGPROS_API_BASE_URL}${path}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "en-US,en;q=0.9",
      "x-api-key": BETTINGPROS_PUBLIC_API_KEY,
    },
  });
  if (!response.ok) throw new Error(`bettingpros_fetch_failed:${response.status}`);
  return response.json();
}

function isSameEvent(event, match) {
  const eventNames = (event.participants || []).map((participant) => normalizeName(participant.name));
  const homeCandidates = buildNameCandidates(match.home);
  const awayCandidates = buildNameCandidates(match.away);
  return homeCandidates.some((candidate) => eventNames.includes(candidate))
    && awayCandidates.some((candidate) => eventNames.includes(candidate));
}

async function findBettingProsEvent(match, fetchImpl) {
  for (const dateKey of buildDateCandidates(match.kickoff)) {
    const payload = await fetchBettingProsJson(`/events?sport=SOCCER&date=${dateKey}&comp_id=${BETTINGPROS_WORLD_CUP_COMPETITION_ID}&season_type=REG:CC:PST:PIT:CT:IST&lineups=true&park_factors=true&officials=false`, fetchImpl);
    const event = (payload.events || []).find((item) => isSameEvent(item, match));
    if (event) return event;
  }

  return null;
}

function mergeSelections(primary = [], secondary = []) {
  return primary.map((selection) => {
    const counterpart = secondary.find((item) => item.participant === selection.participant && item.selection === selection.selection);
    if (!counterpart) return selection;

    const books = new Map();
    for (const book of selection.books || []) books.set(book.id, book);
    for (const book of counterpart.books || []) books.set(book.id, book);
    return {
      ...selection,
      books: [...books.values()],
    };
  });
}

function findBookSource(books, key) {
  const matchers = BOOKMAKER_MATCHERS[key] || [];
  return (books || []).find((book) => {
    const haystack = `${book.name || ""} ${book.display_name || ""} ${book.slug || ""}`.toLowerCase();
    return matchers.some((matcher) => haystack.includes(matcher));
  }) || null;
}

function findSelectionByTeam(offer, teamName) {
  const candidates = buildNameCandidates(teamName);
  return (offer?.selections || []).find((item) => {
    const labelCandidates = [
      item?.label,
      item?.short_label,
    ]
      .filter(Boolean)
      .map((value) => normalizeName(value));
    return candidates.some((candidate) => labelCandidates.includes(candidate));
  }) || null;
}

function findSelectionOdds(offer, match, participantType, bookId) {
  const selection = participantType === "draw"
    ? (offer?.selections || []).find((item) => item.selection === "draw" || item.participant == null)
    : findSelectionByTeam(offer, participantType === "home" ? match.home : match.away);
  const book = selection?.books?.find((item) => item.id === bookId);
  return americanToDecimalOdds(book?.lines?.[0]?.cost ?? null);
}

function buildBookmakersFromBettingPros({ books, offer, match }) {
  return DEFAULT_BOOKMAKER_KEYS.map((key) => {
    const sourceBook = findBookSource(books, key);
    if (!sourceBook || !offer || !match) {
      return {
        key,
        label: BOOKMAKER_META[key].label,
        homeOdds: null,
        drawOdds: null,
        awayOdds: null,
        status: "missing",
      };
    }

    const homeOdds = findSelectionOdds(offer, match, "home", sourceBook.id);
    const drawOdds = findSelectionOdds(offer, match, "draw", sourceBook.id);
    const awayOdds = findSelectionOdds(offer, match, "away", sourceBook.id);

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

async function fetchMatchOddsDirectly(match, fetchImpl) {
  const event = await findBettingProsEvent(match, fetchImpl);
  if (!event) return normalizeMatchOddsPayload(null);

  const [booksPayload, defaultPayload, ontarioPayload] = await Promise.all([
    fetchBettingProsJson("/books", fetchImpl),
    fetchBettingProsJson(`/offers?sport=SOCCER&market_id=${BETTINGPROS_MONEYLINE_MARKET_ID}&event_id=${event.id}&limit=10&page=1`, fetchImpl),
    fetchBettingProsJson(`/offers?sport=SOCCER&market_id=${BETTINGPROS_MONEYLINE_MARKET_ID}&event_id=${event.id}&limit=10&page=1&location=ON`, fetchImpl),
  ]);

  const primaryOffer = defaultPayload.offers?.[0] || null;
  const secondaryOffer = ontarioPayload.offers?.[0] || null;
  const offer = primaryOffer
    ? { ...primaryOffer, selections: mergeSelections(primaryOffer.selections, secondaryOffer?.selections || []) }
    : secondaryOffer;
  const bookmakers = buildBookmakersFromBettingPros({
    books: booksPayload.books || [],
    offer,
    match,
  });

  return normalizeMatchOddsPayload({
    bookmakers,
    probabilities: buildProbabilitySummary(bookmakers),
  });
}

async function fetchMatchOddsByUrl({ fetchImpl, supabaseUrl, supabaseAnonKey, match }) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("match_odds_function_not_configured");
  }

  const response = await fetchImpl(`${supabaseUrl}/functions/v1/fetch-match-odds`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      matchId: match.id,
      matchNo: match.no,
      home: match.home,
      away: match.away,
      kickoff: match.kickoff,
    }),
  });

  if (!response.ok) throw new Error("match_odds_function_fetch_failed");
  return normalizeMatchOddsPayload(await response.json());
}

export async function fetchMatchOdds({
  supabase,
  isSupabaseConfigured,
  supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || "",
  supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || "",
  match,
  fetchImpl = fetch,
}) {
  if (!match) return normalizeMatchOddsPayload(null);

  if (isSupabaseConfigured && supabase?.functions?.invoke) {
    try {
      const { data, error } = await supabase.functions.invoke("fetch-match-odds", {
        body: {
          matchId: match.id,
          matchNo: match.no,
          home: match.home,
          away: match.away,
          kickoff: match.kickoff,
        },
      });
      if (error) throw error;
      return normalizeMatchOddsPayload(data);
    } catch {
      try {
        return await fetchMatchOddsByUrl({ fetchImpl, supabaseUrl, supabaseAnonKey, match });
      } catch {
        try {
          return await fetchMatchOddsDirectly(match, fetchImpl);
        } catch {
          return normalizeMatchOddsPayload(null);
        }
      }
    }
  }

  try {
    return await fetchMatchOddsByUrl({ fetchImpl, supabaseUrl, supabaseAnonKey, match });
  } catch {
    try {
      return await fetchMatchOddsDirectly(match, fetchImpl);
    } catch {
      return normalizeMatchOddsPayload(null);
    }
  }
}
