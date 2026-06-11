import { describe, expect, test } from "vitest";
import {
  buildFifaMappingRows,
  buildLocalScheduleFromRows,
  extractScheduleRowsFromAppSource,
  normalizeFifaMatch,
  shouldSettleFifaResult,
} from "../lib/fifaSync";

describe("fifa sync helpers", () => {
  test("normalizes FIFA match payload into the local provider shape", () => {
    const normalized = normalizeFifaMatch({
      IdMatch: "400021443",
      MatchNumber: 1,
      Date: "2026-06-11T19:00:00Z",
      MatchStatus: 1,
      MatchTime: "0'",
      ResultType: 0,
      HomeTeamScore: null,
      AwayTeamScore: null,
      Home: {
        IdTeam: "43911",
        TeamName: [{ Locale: "en-GB", Description: "Mexico" }],
      },
      Away: {
        IdTeam: "43883",
        TeamName: [{ Locale: "en-GB", Description: "South Africa" }],
      },
    });

    expect(normalized).toMatchObject({
      providerMatchId: "400021443",
      matchNumber: 1,
      kickoff: "2026-06-11T19:00:00.000Z",
      homeName: "Mexico",
      awayName: "South Africa",
      homeNameZh: "墨西哥",
      awayNameZh: "南非",
      homeTeamId: "43911",
      awayTeamId: "43883",
      phase: "pre_match",
    });
  });

  test("translates FIFA naming aliases into local team labels", () => {
    const normalized = normalizeFifaMatch({
      IdMatch: "400021468",
      MatchNumber: 55,
      Date: "2026-07-02T19:00:00Z",
      MatchStatus: 1,
      MatchTime: "0'",
      ResultType: 0,
      HomeTeamScore: null,
      AwayTeamScore: null,
      Home: {
        IdTeam: "1895293",
        TeamName: [{ Locale: "en-GB", Description: "Curaçao" }],
      },
      Away: {
        IdTeam: "43854",
        TeamName: [{ Locale: "en-GB", Description: "Côte d'Ivoire" }],
      },
    });

    expect(normalized.homeNameZh).toBe("库拉索");
    expect(normalized.awayNameZh).toBe("科特迪瓦");
  });

  test("maps schedule rows to FIFA matches by match number", () => {
    const localMatches = buildLocalScheduleFromRows([
      [1, "A组", "墨西哥", "南非", "2026-06-12T03:00:00+08:00", "Azteca", "Mexico City"],
    ]);
    const fifaMatches = [
      normalizeFifaMatch({
        IdMatch: "400021443",
        MatchNumber: 1,
        Date: "2026-06-11T19:00:00Z",
        MatchStatus: 1,
        MatchTime: "0'",
        ResultType: 0,
        HomeTeamScore: null,
        AwayTeamScore: null,
        Home: { IdTeam: "43911", TeamName: [{ Locale: "en-GB", Description: "Mexico" }] },
        Away: { IdTeam: "43883", TeamName: [{ Locale: "en-GB", Description: "South Africa" }] },
      }),
    ];

    expect(buildFifaMappingRows(localMatches, fifaMatches)).toEqual([
      expect.objectContaining({
        match_id: "1",
        match_no: 1,
        provider: "fifa",
        provider_match_id: "400021443",
        mapping_status: "matched",
      }),
    ]);
  });

  test("treats placeholder knockout teams as matchable when match number and kickoff align", () => {
    const localMatches = buildLocalScheduleFromRows([
      [103, "三四名决赛", "半决赛负者A", "半决赛负者B", "2026-07-19T05:00:00+08:00", "Hard Rock", "Miami"],
    ]);
    const fifaMatches = [
      normalizeFifaMatch({
        IdMatch: "400021545",
        MatchNumber: 103,
        Date: "2026-07-18T21:00:00Z",
        MatchStatus: 1,
        MatchTime: "0'",
        ResultType: 0,
        HomeTeamScore: null,
        AwayTeamScore: null,
        Home: { IdTeam: "1", TeamName: [{ Locale: "en-GB", Description: "Germany" }] },
        Away: { IdTeam: "2", TeamName: [{ Locale: "en-GB", Description: "Spain" }] },
      }),
    ];

    expect(buildFifaMappingRows(localMatches, fifaMatches)[0]).toMatchObject({
      mapping_status: "matched",
    });
  });

  test("does not settle final scores for live FIFA matches", () => {
    expect(shouldSettleFifaResult(normalizeFifaMatch({
      IdMatch: "400021443",
      MatchNumber: 1,
      Date: "2026-06-11T19:00:00Z",
      MatchStatus: 3,
      MatchTime: "67'",
      ResultType: 0,
      HomeTeamScore: 1,
      AwayTeamScore: 0,
      Home: { IdTeam: "43911", TeamName: [{ Locale: "en-GB", Description: "Mexico" }] },
      Away: { IdTeam: "43883", TeamName: [{ Locale: "en-GB", Description: "South Africa" }] },
    }))).toBe(false);
  });

  test("extracts the local scheduleRows literal from App source", () => {
    const rows = extractScheduleRowsFromAppSource(`
const somethingElse = [];
const scheduleRows = [
  [1, "A组", "墨西哥", "南非", "2026-06-12T03:00:00+08:00", "Azteca", "Mexico City"],
];

const FALLBACK_COMPLETE_WORLD_CUP_SCHEDULE = [];
`);

    expect(rows).toEqual([
      [1, "A组", "墨西哥", "南非", "2026-06-12T03:00:00+08:00", "Azteca", "Mexico City"],
    ]);
  });
});
