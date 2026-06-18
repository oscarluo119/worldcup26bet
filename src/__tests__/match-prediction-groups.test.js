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
    expect(appSource).toContain('<SchedulePanel predictions={predictions} currentPlayerId={currentPlayerId} query={query} setQuery={setQuery} stageFilter={stageFilter} setStageFilter={setStageFilter} groupedMatches={groupedMatches} selectedMatchId={selectedMatchId} setSelectedMatchId={setSelectedMatchId} upsertPrediction={upsertPrediction} players={players} currentTime={currentTime} onOpenPlayerProfile={openPlayerProfile} openSnackbar={openSnackbar} isAdmin={isAdmin} matches={matches} />');
    expect(appSource).toContain("function SchedulePanel({ predictions, currentPlayerId, query, setQuery, stageFilter, setStageFilter, groupedMatches, selectedMatchId, setSelectedMatchId, upsertPrediction, players, currentTime, onOpenPlayerProfile, openSnackbar, isAdmin, matches = [] })");
  });

  test("renders prediction groups as compact rows without submitted status or duplicate score text", () => {
    expect(appSource).toContain("function PredictionEntryRow({ entry, exportMode = false })");
    expect(appSource).not.toContain("function PredictionEntryCard(");
    expect(appSource).not.toContain("prediction ? ` ${prediction.home}:${prediction.away}` : \"\"");
    expect(appSource).not.toContain('<div className={cn("mt-1 text-xs", exportMode ? "text-emerald-50/70" : "md3-subtle")}>已提交</div>');
  });

  test("upgrades the match info card with world cup match wording and team component rendering", () => {
    expect(appSource).toContain("第 {match.no} 场世界杯比赛");
    expect(appSource).toContain("<TeamName name={match.home} logo={match.homeLogo} interactiveProfile teamCardMatches={matches} />");
    expect(appSource).toContain("<TeamName name={match.away} logo={match.awayLogo} interactiveProfile teamCardMatches={matches} />");
  });

  test("shows result, my points, prediction, and average score in the schedule card summary area", () => {
    expect(appSource).toContain('<div className="text-[10px] uppercase tracking-[0.16em] md3-subtle">比赛结果</div>');
    expect(appSource).toContain('<div className="text-[10px] uppercase tracking-[0.16em] md3-subtle">我的得分</div>');
    expect(appSource).toContain('<div className="text-[10px] uppercase tracking-[0.16em] md3-subtle">我的预测</div>');
    expect(appSource).toContain('<div className="text-[10px] uppercase tracking-[0.16em] md3-subtle">平均得分</div>');
  });

  test("adds my points and average score labels to full history rows", () => {
    expect(appSource).toContain('<InfoRow label="我的得分" value={summary.myPointsLabel} />');
    expect(appSource).toContain('<InfoRow label="平均得分" value={summary.averagePointsLabel} />');
    expect(appSource).toContain('<div className="mt-3 flex flex-wrap gap-2">');
    expect(appSource).toContain('<div className="mb-2 flex flex-wrap items-center gap-2">');
    expect(appSource).toContain('<Pill className="bg-emerald-500/15 text-emerald-200">{(STAGES[match.stage] || STAGES.GROUP).label}</Pill>');
  });

  test("matches the compact score layout in the player profile history list", () => {
    expect(appSource).toContain("<PredictionHistoryList items={recentHistory} />");
    expect(appSource).toContain('<InfoRow label="我的得分" value={summary.myPointsLabel} />');
    expect(appSource).toContain('<InfoRow label="平均得分" value={summary.averagePointsLabel} />');
  });

  test("adds mainstream odds and match preview sections to the single-match card", () => {
    expect(appSource).toContain("主流赔率");
    expect(appSource).toContain("比赛前瞻");
    expect(appSource).not.toContain("AI比赛前瞻");
    expect(appSource).not.toContain("结构化生成");
  });
});
