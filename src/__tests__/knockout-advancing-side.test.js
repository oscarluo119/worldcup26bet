import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");
const schemaSource = readFileSync(resolve(process.cwd(), "supabase-schema.sql"), "utf8");

describe("knockout advancing side schema", () => {
  test("stores advancing side alongside manual match results", () => {
    const normalized = schemaSource.toLowerCase();

    expect(normalized).toContain("advancing_side text check (advancing_side in ('home', 'away'))");
    expect(normalized).toContain("p_advancing_side text default null");
    expect(normalized).toContain("advancing_side = excluded.advancing_side");
  });
});

describe("knockout advancing side admin wiring", () => {
  test("sends advancing side through the admin result save path", () => {
    expect(appSource).toContain("async function updateMatchResult(matchId, homeScore, awayScore, advancingSide = null)");
    expect(appSource).toContain("p_advancing_side: advancingSide");
    expect(appSource).toContain("advancingSide: nextAdvancingSide");
  });

  test("requires advancing side for drawn knockout admin results and shows the selection UI", () => {
    expect(appSource).toContain('const requiresAdvancingSide = isKnockoutMatch(match) && homeScore !== "" && awayScore !== "" && Number(homeScore) === Number(awayScore)');
    expect(appSource).toContain('const canSave = Number.isFinite(Number(homeScore)) && Number.isFinite(Number(awayScore)) && homeScore !== "" && awayScore !== "" && (!requiresAdvancingSide || Boolean(advancingSide))');
    expect(appSource).toContain("主队晋级");
    expect(appSource).toContain("客队晋级");
    expect(appSource).toContain("平局时请选择晋级球队");
  });

  test("shows the resolved advancing team on settled knockout draws", () => {
    expect(appSource).toContain("match.advancingSide && Number(match.homeScore) === Number(match.awayScore)");
    expect(appSource).toContain('晋级：{teamName(match.advancingSide === "home" ? match.home : match.away)}');
  });
});
