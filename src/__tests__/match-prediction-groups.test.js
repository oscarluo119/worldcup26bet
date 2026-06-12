import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { buildMatchPredictionGroups, buildPredictionExportFileName } from "../lib/matchPredictionGroups";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");

describe("match prediction groups", () => {
  const players = [
    { id: "u1", name: "Alpha", displayName: "Alpha" },
    { id: "u2", name: "Beta", displayName: "Beta" },
    { id: "u3", name: "Gamma", displayName: "Gamma" },
    { id: "u4", name: "Delta", displayName: "Delta" },
  ];

  const predictions = [
    { playerId: "u1", matchId: "m1", home: 2, away: 1 },
    { playerId: "u2", matchId: "m1", home: 1, away: 1 },
    { playerId: "u3", matchId: "m1", home: 0, away: 2 },
  ];

  const settledMatch = {
    id: "m1",
    no: 1,
    home: "韩国",
    away: "捷克",
    status: "settled",
    homeScore: 2,
    awayScore: 1,
  };

  test("groups predictions into visible outcomes while keeping hidden missing count", () => {
    const grouped = buildMatchPredictionGroups({
      players,
      predictions,
      match: settledMatch,
      currentPlayerId: "u2",
    });

    expect(grouped.visibleGroups.map((group) => [group.key, group.items.length])).toEqual([
      ["H", 1],
      ["D", 1],
      ["A", 1],
    ]);
    expect(grouped.missingCount).toBe(1);
  });

  test("keeps settled-match points on entries for page and export reuse", () => {
    const grouped = buildMatchPredictionGroups({
      players,
      predictions,
      match: settledMatch,
      currentPlayerId: "u2",
    });

    expect(grouped.visibleGroups[0].items[0]).toMatchObject({
      isMe: false,
      points: 4,
      prediction: { home: 2, away: 1 },
    });
    expect(grouped.visibleGroups[1].items[0]).toMatchObject({
      isMe: true,
      points: 0,
      prediction: { home: 1, away: 1 },
    });
  });

  test("builds a readable png export filename from match metadata", () => {
    expect(buildPredictionExportFileName(settledMatch)).toBe("match-001-韩国-vs-捷克-predictions.png");
  });

  test("adds the admin export button and hides the standalone missing group card", () => {
    expect(appSource).toContain("导出截图");
    expect(appSource).toContain("未提交");
    expect(appSource).not.toContain('{ key: "M", title: "未提交", items: groups.M }');
  });

  test("threads isAdmin through the schedule panel before match detail uses it", () => {
    expect(appSource).toContain('<SchedulePanel predictions={predictions} currentPlayerId={currentPlayerId} query={query} setQuery={setQuery} stageFilter={stageFilter} setStageFilter={setStageFilter} groupedMatches={groupedMatches} selectedMatchId={selectedMatchId} setSelectedMatchId={setSelectedMatchId} upsertPrediction={upsertPrediction} players={players} currentTime={currentTime} onOpenPlayerProfile={openPlayerProfile} openSnackbar={openSnackbar} isAdmin={isAdmin} />');
    expect(appSource).toContain("function SchedulePanel({ predictions, currentPlayerId, query, setQuery, stageFilter, setStageFilter, groupedMatches, selectedMatchId, setSelectedMatchId, upsertPrediction, players, currentTime, onOpenPlayerProfile, openSnackbar, isAdmin })");
  });

  test("renders prediction groups as compact rows without submitted status or duplicate score text", () => {
    expect(appSource).toContain("function PredictionEntryRow({ entry, exportMode = false })");
    expect(appSource).not.toContain("function PredictionEntryCard(");
    expect(appSource).not.toContain("prediction ? ` ${prediction.home}:${prediction.away}` : \"\"");
    expect(appSource).not.toContain("<div className={cn(\"mt-1 text-xs\", exportMode ? \"text-emerald-50/70\" : \"md3-subtle\")}>已提交</div>");
  });

  test("upgrades the match info card with world cup match wording and team component rendering", () => {
    expect(appSource).toContain("第 {match.no} 场世界杯比赛");
    expect(appSource).toContain("<TeamName name={match.home} logo={match.homeLogo} interactiveProfile />");
    expect(appSource).toContain("<TeamName name={match.away} logo={match.awayLogo} interactiveProfile />");
  });
});
