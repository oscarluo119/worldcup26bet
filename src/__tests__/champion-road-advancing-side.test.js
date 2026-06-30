import { describe, expect, test } from "vitest";
import { resolveChampionRoadSlot } from "../lib/championRoad";

describe("champion road advancing side", () => {
  test("uses advancing side to resolve knockout draw winners and losers", () => {
    const results = {
      73: { homeScore: 1, awayScore: 1, advancingSide: "away" },
    };

    expect(resolveChampionRoadSlot("\u7b2c73\u573a\u80dc\u8005", { standings: {}, results })).toMatchObject({
      resolved: true,
      sourceType: "match_winner",
    });
    expect(resolveChampionRoadSlot("\u7b2c73\u573a\u8d1f\u8005", { standings: {}, results })).toMatchObject({
      resolved: true,
      sourceType: "match_loser",
    });
  });

  test("keeps knockout draw winners unresolved when advancing side is missing", () => {
    const results = {
      73: { homeScore: 1, awayScore: 1 },
    };

    expect(resolveChampionRoadSlot("\u7b2c73\u573a\u80dc\u8005", { standings: {}, results })).toMatchObject({
      resolved: false,
      teamName: "",
    });
  });
});
