import { describe, expect, test } from "vitest";
import {
  americanToDecimalOdds,
  buildEmptyBookmakers,
  buildProbabilitySummary,
  BOOKMAKER_META,
  fetchMatchOdds,
  LOCAL_TEAM_NAME_TO_ENGLISH,
  normalizeMatchOddsPayload,
} from "../lib/matchOdds";

describe("match odds helpers", () => {
  test("converts American odds into decimal odds", () => {
    expect(americanToDecimalOdds(150)).toBe(2.5);
    expect(americanToDecimalOdds(-200)).toBe(1.5);
    expect(americanToDecimalOdds(null)).toBeNull();
  });

  test("computes de-vigged probabilities from available real-odds rows only", () => {
    const probabilities = buildProbabilitySummary([
      { homeOdds: 2.3, drawOdds: 3.2, awayOdds: 3.4 },
      { homeOdds: 2.25, drawOdds: 3.1, awayOdds: 3.5 },
      { homeOdds: null, drawOdds: null, awayOdds: null },
    ]);

    expect(probabilities).toMatchObject({
      sampleSize: 2,
      completeness: 0.4,
    });
    expect(probabilities.home + probabilities.draw + probabilities.away).toBe(100);
  });

  test("normalizes partial payloads and keeps missing bookmakers visible", () => {
    const payload = normalizeMatchOddsPayload({
      bookmakers: [
        {
          key: "draftkings",
          homeOdds: 2.15,
          drawOdds: 3.25,
          awayOdds: 3.6,
          status: "ready",
        },
      ],
    });

    expect(payload.bookmakers).toHaveLength(5);
    expect(payload.bookmakers[0]).toMatchObject({
      key: "draftkings",
      status: "ready",
    });
    expect(payload.bookmakers.slice(1).every((bookmaker) => bookmaker.status === "missing")).toBe(true);
    expect(payload.probabilities).not.toBeNull();
  });

  test("builds the fixed bookmaker scaffold when nothing is available", () => {
    expect(buildEmptyBookmakers().map((bookmaker) => bookmaker.key)).toEqual([
      "draftkings",
      "betmgm",
      "caesars",
      "betrivers",
      "partycasino",
    ]);
  });

  test("uses the updated real-odds bookmaker labels", () => {
    expect(BOOKMAKER_META).toMatchObject({
      draftkings: { label: "DraftKings" },
      betmgm: { label: "BetMGM" },
      caesars: { label: "Caesars" },
      betrivers: { label: "BetRivers" },
      partycasino: { label: "PartyCasino" },
    });
  });

  test("keeps the local Chinese team mapping stable for real-odds lookups", () => {
    expect(LOCAL_TEAM_NAME_TO_ENGLISH["\u52a0\u62ff\u5927"]).toBe("Canada");
    expect(LOCAL_TEAM_NAME_TO_ENGLISH["\u6ce2\u9ed1"]).toBe("Bosnia and Herzegovina");
    expect(LOCAL_TEAM_NAME_TO_ENGLISH["\u897f\u73ed\u7259"]).toBe("Spain");
  });

  test("falls back to direct real-odds fetching when function config is missing", async () => {
    const payload = await fetchMatchOdds({
      supabase: null,
      isSupabaseConfigured: false,
      supabaseUrl: "",
      supabaseAnonKey: "",
      match: {
        id: "m3",
        no: 3,
        home: "\u52a0\u62ff\u5927",
        away: "\u6ce2\u9ed1",
        kickoff: "2026-06-13T03:00:00+08:00",
      },
    });

    expect(payload.bookmakers.some((bookmaker) => bookmaker.status === "ready")).toBe(true);
  });
});
