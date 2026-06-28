import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import {
  CHAMPION_ROAD_DISPLAY_LANES,
  CHAMPION_ROAD_MATCHES,
  CHAMPION_ROAD_SCORING,
  buildChampionRoadStandings,
  getChampionRoadDesktopScale,
  getChampionRoadLockAt,
  isChampionRoadLocked,
  normalizeChampionRoadPicks,
  rankChampionRoadEntries,
  resolveChampionRoadScheduleMatch,
  resolveChampionRoadSlot,
  scoreChampionRoadEntry,
  validateChampionRoadSubmission,
} from "../lib/championRoad";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");
const migrationSource = readFileSync(resolve(process.cwd(), "supabase/migrations/20260626_add_champion_road.sql"), "utf8");

const schedule = [
  { no: 1, group: "A组", home: "墨西哥", away: "南非" },
  { no: 2, group: "A组", home: "韩国", away: "捷克" },
  { no: 25, group: "A组", home: "捷克", away: "南非" },
  { no: 28, group: "A组", home: "墨西哥", away: "韩国" },
  { no: 53, group: "A组", home: "捷克", away: "墨西哥" },
  { no: 54, group: "A组", home: "南非", away: "韩国" },
  { no: 3, group: "B组", home: "加拿大", away: "波黑" },
  { no: 8, group: "B组", home: "卡塔尔", away: "瑞士" },
  { no: 26, group: "B组", home: "瑞士", away: "波黑" },
  { no: 27, group: "B组", home: "加拿大", away: "卡塔尔" },
  { no: 51, group: "B组", home: "瑞士", away: "加拿大" },
  { no: 52, group: "B组", home: "波黑", away: "卡塔尔" },
];

const results = {
  1: { homeScore: 2, awayScore: 0 },
  2: { homeScore: 1, awayScore: 1 },
  25: { homeScore: 0, awayScore: 0 },
  28: { homeScore: 3, awayScore: 1 },
  53: { homeScore: 1, awayScore: 2 },
  54: { homeScore: 0, awayScore: 1 },
  3: { homeScore: 2, awayScore: 0 },
  8: { homeScore: 1, awayScore: 1 },
  26: { homeScore: 2, awayScore: 0 },
  27: { homeScore: 1, awayScore: 0 },
  51: { homeScore: 1, awayScore: 1 },
  52: { homeScore: 0, awayScore: 1 },
  73: { homeScore: 2, awayScore: 0 },
  74: { homeScore: 1, awayScore: 0 },
  75: { homeScore: 0, awayScore: 2 },
  76: { homeScore: 3, awayScore: 1 },
  77: { homeScore: 2, awayScore: 0 },
  78: { homeScore: 1, awayScore: 0 },
  79: { homeScore: 2, awayScore: 1 },
  80: { homeScore: 0, awayScore: 1 },
  81: { homeScore: 1, awayScore: 0 },
  82: { homeScore: 3, awayScore: 0 },
  83: { homeScore: 0, awayScore: 2 },
  84: { homeScore: 1, awayScore: 0 },
  85: { homeScore: 0, awayScore: 1 },
  86: { homeScore: 2, awayScore: 0 },
  87: { homeScore: 1, awayScore: 0 },
  88: { homeScore: 0, awayScore: 2 },
  89: { homeScore: 0, awayScore: 1 },
  90: { homeScore: 2, awayScore: 0 },
  91: { homeScore: 1, awayScore: 0 },
  92: { homeScore: 2, awayScore: 1 },
  93: { homeScore: 1, awayScore: 0 },
  94: { homeScore: 0, awayScore: 2 },
  95: { homeScore: 3, awayScore: 1 },
  96: { homeScore: 0, awayScore: 1 },
  97: { homeScore: 1, awayScore: 0 },
  98: { homeScore: 2, awayScore: 0 },
  99: { homeScore: 1, awayScore: 0 },
  100: { homeScore: 0, awayScore: 2 },
  101: { homeScore: 2, awayScore: 1 },
  102: { homeScore: 0, awayScore: 1 },
  103: { homeScore: 1, awayScore: 0 },
  104: { homeScore: 3, awayScore: 2 },
};

const fullGroupStandings = Object.fromEntries("ABCDEFGHIJKL".split("").map((group, index) => {
  const thirdPoints = {
    A: 1,
    B: 5,
    C: 1,
    D: 4,
    E: 5,
    F: 3,
    G: 1,
    H: 1,
    I: 2,
    J: 2,
    K: 2,
    L: 2,
  }[group];
  return [`${group}组`, [
    { group: `${group}组`, team: `${group}组一`, played: 3, won: 3, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 1, goalDifference: 5, points: 9 },
    { group: `${group}组`, team: `${group}组二`, played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 3, goalDifference: 2, points: 6 },
    { group: `${group}组`, team: `${group}组三`, played: 3, won: 1, drawn: thirdPoints === 1 ? 1 : 0, lost: thirdPoints === 1 ? 1 : 2, goalsFor: 3 + index, goalsAgainst: 4, goalDifference: (3 + index) - 4, points: thirdPoints },
    { group: `${group}组`, team: `${group}组四`, played: 3, won: 0, drawn: thirdPoints === 1 ? 0 : 1, lost: thirdPoints === 1 ? 3 : 2, goalsFor: 1, goalsAgainst: 7, goalDifference: -6, points: 0 },
  ]];
}));

describe("champion road logic", () => {
  test("keeps the knockout map fixed from match 73 to 104", () => {
    expect(CHAMPION_ROAD_MATCHES[0]).toMatchObject({ matchNo: 73, round: "R32" });
    expect(CHAMPION_ROAD_MATCHES.at(-1)).toMatchObject({ matchNo: 104, round: "FINAL" });
    expect(CHAMPION_ROAD_MATCHES).toHaveLength(32);
  });

  test("defines display lanes so each round-of-32 match sits nearest its round-of-16 target", () => {
    expect(CHAMPION_ROAD_DISPLAY_LANES.left32).toEqual([74, 77, 73, 75, 76, 78, 79, 80]);
    expect(CHAMPION_ROAD_DISPLAY_LANES.right32).toEqual([83, 84, 81, 82, 86, 88, 85, 87]);
    expect(CHAMPION_ROAD_DISPLAY_LANES.left16).toEqual([89, 90, 91, 92]);
    expect(CHAMPION_ROAD_DISPLAY_LANES.right16).toEqual([93, 94, 95, 96]);
  });

  test("scales the desktop bracket down for narrower or shorter viewports without enlarging past 100%", () => {
    expect(getChampionRoadDesktopScale({ availableWidth: 1800, availableHeight: 1200, contentWidth: 1560, contentHeight: 930 })).toBe(1);
    expect(getChampionRoadDesktopScale({ availableWidth: 1320, availableHeight: 1200, contentWidth: 1560, contentHeight: 930 })).toBeLessThan(1);
    expect(getChampionRoadDesktopScale({ availableWidth: 1320, availableHeight: 1200, contentWidth: 1560, contentHeight: 930 })).toBeGreaterThanOrEqual(0.6);
    expect(getChampionRoadDesktopScale({ availableWidth: 1100, availableHeight: 1200, contentWidth: 1560, contentHeight: 930 })).toBeLessThan(getChampionRoadDesktopScale({ availableWidth: 1320, availableHeight: 1200, contentWidth: 1560, contentHeight: 930 }));
    expect(getChampionRoadDesktopScale({ availableWidth: 1800, availableHeight: 720, contentWidth: 1560, contentHeight: 930 })).toBeLessThan(1);
    expect(getChampionRoadDesktopScale({ availableWidth: 1400, availableHeight: 1200, contentWidth: 1700, contentHeight: 930 })).toBeLessThan(getChampionRoadDesktopScale({ availableWidth: 1500, availableHeight: 1200, contentWidth: 1560, contentHeight: 930 }));
    expect(getChampionRoadDesktopScale({ availableWidth: 1800, availableHeight: 720, contentWidth: 1560, contentHeight: 1080 })).toBeLessThan(getChampionRoadDesktopScale({ availableWidth: 1800, availableHeight: 720, contentWidth: 1560, contentHeight: 930 }));
    expect(getChampionRoadDesktopScale({ availableWidth: 980, availableHeight: 1200, contentWidth: 2000, contentHeight: 930 })).toBe(0.6);
  });

  test("resolves settled group slots to team name and keeps unresolved best-third placeholders", () => {
    const standings = buildChampionRoadStandings(schedule, results);
    const groupSlot = resolveChampionRoadSlot("A组第一", { standings, results });
    const bestThirdSlot = resolveChampionRoadSlot("最佳小组第三（D/E/I/J/L）", { standings, results });

    expect(groupSlot).toMatchObject({
      resolved: true,
      teamName: "墨西哥",
      placeholderName: "A组第一",
    });
    expect(bestThirdSlot).toMatchObject({
      resolved: false,
      teamName: "",
      placeholderName: "最佳第三（D/E/I/J/L）",
    });
  });

  test("resolves best-third slots after all twelve groups finish with official bracket mapping", () => {
    expect(resolveChampionRoadSlot("最佳小组第三（A/B/C/D/F）", { standings: fullGroupStandings, results: {} })).toMatchObject({
      resolved: true,
      teamName: "D组三",
      placeholderName: "最佳第三（A/B/C/D/F）",
    });
    expect(resolveChampionRoadSlot("最佳小组第三（C/D/F/G/H）", { standings: fullGroupStandings, results: {} })).toMatchObject({
      resolved: true,
      teamName: "F组三",
    });
    expect(resolveChampionRoadSlot("最佳小组第三（D/E/I/J/L）", { standings: fullGroupStandings, results: {} })).toMatchObject({
      resolved: true,
      teamName: "L组三",
    });
  });

  test("resolves winner and loser references from knockout results", () => {
    const winnerSlot = resolveChampionRoadSlot("第73场胜者", { standings: {}, results });
    const loserSlot = resolveChampionRoadSlot("第101场负者", { standings: {}, results });

    expect(winnerSlot).toMatchObject({
      resolved: true,
      sourceType: "match_winner",
    });
    expect(loserSlot).toMatchObject({
      resolved: true,
      sourceType: "match_loser",
    });
  });

  test("resolves knockout schedule matches with partial replacement and search aliases", () => {
    const standings = buildChampionRoadStandings(schedule, results);
    const matchDisplay = resolveChampionRoadScheduleMatch(
      { no: 90, group: "16强赛", home: "第73场胜者", away: "第75场胜者" },
      { standings, results },
    );

    expect(matchDisplay).toMatchObject({
      resolvedHomeName: "韩国",
      resolvedAwayName: "第75场胜者",
      homeResolved: true,
      awayResolved: false,
    });
    expect(matchDisplay.searchAliases).toEqual(expect.arrayContaining(["第73场胜者", "第75场胜者", "韩国"]));
  });

  test("leaves group-stage schedule matches untouched", () => {
    const standings = buildChampionRoadStandings(schedule, results);
    const matchDisplay = resolveChampionRoadScheduleMatch(
      { no: 1, group: "A组", home: "墨西哥", away: "南非" },
      { standings, results },
    );

    expect(matchDisplay).toMatchObject({
      resolvedHomeName: "墨西哥",
      resolvedAwayName: "南非",
      homeResolved: true,
      awayResolved: true,
    });
    expect(matchDisplay.searchAliases).toEqual(expect.arrayContaining(["墨西哥", "南非"]));
  });

  test("clears downstream picks when upstream winners change", () => {
    const picks = {
      73: { matchNo: 73, pickSlot: "home", pickTarget: "group:A:2" },
      75: { matchNo: 75, pickSlot: "away", pickTarget: "group:C:2" },
      90: { matchNo: 90, pickSlot: "home", pickTarget: "winner:73" },
      97: { matchNo: 97, pickSlot: "away", pickTarget: "winner:90" },
    };

    const next = normalizeChampionRoadPicks({
      picks: {
        ...picks,
        73: { matchNo: 73, pickSlot: "away", pickTarget: "group:B:2" },
      },
    });

    expect(next[73]).toMatchObject({ pickTarget: "group:B:2" });
    expect(next[90]).toBeUndefined();
    expect(next[97]).toBeUndefined();
  });

  test("blocks incomplete submissions and locks at the first 32-match kickoff", () => {
    const lockAt = getChampionRoadLockAt(CHAMPION_ROAD_MATCHES);

    expect(lockAt).toBe("2026-06-29T03:00:00+08:00");
    expect(isChampionRoadLocked(CHAMPION_ROAD_MATCHES, new Date("2026-06-29T03:00:00+08:00"))).toBe(true);

    const invalid = validateChampionRoadSubmission({
      picks: {
        73: { matchNo: 73, pickSlot: "home", pickTarget: "group:A:2" },
      },
    });

    expect(invalid).toMatchObject({
      valid: false,
      missingMatchNos: expect.arrayContaining([74, 104]),
    });
  });

  test("scores rounds and final placements separately", () => {
    const entry = {
      73: { pickTarget: "group:A:2" },
      74: { pickTarget: "group:E:1" },
      75: { pickTarget: "group:C:2" },
      76: { pickTarget: "group:C:1" },
      89: { pickTarget: "group:I:1" },
      90: { pickTarget: "group:A:2" },
      97: { pickTarget: "group:I:1" },
      101: { pickTarget: "group:I:1" },
      102: { pickTarget: "group:K:1" },
      103: { pickTarget: "group:L:2" },
      104: { pickTarget: "group:I:1" },
    };

    const score = scoreChampionRoadEntry(entry, results);

    expect(score.breakdown).toMatchObject({
      round16: { hits: 4, points: 4, maxPoints: 16 },
      quarterfinals: { hits: 2, points: 4, maxPoints: 16 },
      semifinals: { hits: 1, points: 4, maxPoints: 16 },
      placements: { hits: 3, points: 16, maxPoints: 18 },
    });
    expect(score.total).toBe(28);
  });

  test("sorts ties by champion, finalists, semifinalists, quarterfinalists and round-of-16", () => {
    const rankings = rankChampionRoadEntries([
      {
        userId: "u1",
        playerName: "Alpha",
        score: { total: 24, tiebreak: { champion: 1, finalists: 2, semifinalists: 3, quarterfinalists: 5, round16: 9 } },
      },
      {
        userId: "u2",
        playerName: "Beta",
        score: { total: 24, tiebreak: { champion: 1, finalists: 2, semifinalists: 2, quarterfinalists: 6, round16: 10 } },
      },
      {
        userId: "u3",
        playerName: "Gamma",
        score: { total: 24, tiebreak: { champion: 0, finalists: 1, semifinalists: 4, quarterfinalists: 8, round16: 12 } },
      },
    ]);

    expect(rankings.map((item) => item.userId)).toEqual(["u1", "u2", "u3"]);
    expect(rankings.map((item) => item.rank)).toEqual([1, 2, 3]);
  });

  test("exposes the fixed scoring weights", () => {
    expect(CHAMPION_ROAD_SCORING).toMatchObject({
      round16: 1,
      quarterfinals: 2,
      semifinals: 4,
      champion: 8,
      runnerUp: 4,
      thirdPlace: 4,
      fourthPlace: 2,
    });
  });
});

describe("champion road UI integration", () => {
  test("adds the champion road tab and dedicated page sections", () => {
    expect(appSource).toContain('{ id: "championRoad", label: "冠军之路"');
    expect(appSource).toContain('activeTab === "championRoad"');
    expect(appSource).toContain("分数结构");
    expect(appSource).toContain("排行榜");
    expect(appSource).toContain("提交冠军之路");
  });

  test("keeps champion road ranking columns limited to rank, player and score", () => {
    expect(appSource).toContain("排名");
    expect(appSource).toContain("玩家");
    expect(appSource).toContain("积分");
    expect(appSource).not.toContain("冠军之路榜单冠军");
  });

  test("reuses knockout display resolution for champion road, schedule cards, and full schedule search", () => {
    expect(appSource).toContain("resolveChampionRoadScheduleMatch");
    expect(appSource).toContain("resolvedHomeName");
    expect(appSource).toContain("resolvedAwayName");
    expect(appSource).toContain("searchAliases");
  });

  test("uses resolved knockout teams for the home next-match entry instead of raw placeholders", () => {
    expect(appSource).toContain("const resolvedNextDeadline = useMemo(() => {");
    expect(appSource).toContain("const matchDisplay = resolveChampionRoadScheduleMatch(nextDeadline");
    expect(appSource).toContain("...nextDeadline,");
    expect(appSource).toContain("home: matchDisplay.resolvedHomeName,");
    expect(appSource).toContain("away: matchDisplay.resolvedAwayName,");
    expect(appSource).toContain('const nextDeadlineOpponent = resolvedNextDeadline ? `${teamName(resolvedNextDeadline.home)} vs ${teamName(resolvedNextDeadline.away)}` : "当前暂无可竞猜比赛"');
    expect(appSource).toContain("match={resolvedNextDeadline}");
  });

  test("keeps the bracket centered, height-aware, removes the background image, and tightens score-card layout", () => {
    expect(appSource).not.toContain("images.unsplash.com");
    expect(appSource).toContain("transform: `scale(${desktopScale})`");
    expect(appSource).toContain("const availableHeight =");
    expect(appSource).toContain("availableHeight,");
    expect(appSource).toContain("const [desktopContentWidth, setDesktopContentWidth] = useState(1560)");
    expect(appSource).toContain("const nextContentWidth = Math.max(grid?.scrollWidth || 0, 1560)");
    expect(appSource).toContain("contentWidth: nextContentWidth");
    expect(appSource).toContain('width: `${Math.round(desktopContentWidth * desktopScale)}px`');
    expect(appSource).toContain("const [desktopContentHeight, setDesktopContentHeight] = useState(930)");
    expect(appSource).toContain("contentHeight: nextHeight");
    expect(appSource).toContain('height: `${Math.round(desktopContentHeight * desktopScale)}px`');
    expect(appSource).toContain('transformOrigin: "top left"');
    expect(appSource).toContain('className="mx-auto"');
    expect(appSource).toContain('className="overflow-hidden rounded-[32px]"');
    expect(appSource).toContain('className="grid gap-2"');
    expect(appSource).toContain('gridTemplateColumns: "1fr 0.84fr 0.64fr 0.58fr 0.82fr 0.58fr 0.64fr 0.84fr 1fr"');
    expect(appSource).toContain('className="rounded-[22px] bg-white/8 p-4 min-w-0"');
    expect(appSource).toContain('className="text-base font-black text-white xl:text-lg"');
  });

  test("compresses the top status area and splits final and third-place cards into separate center groups", () => {
    expect(appSource).toContain('className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-5"');
    expect(appSource).toContain('className="rounded-[20px] bg-white/6 px-4 py-3"');
    expect(appSource).toContain('className="space-y-5"');
    expect(appSource).toContain("desktopRounds.final.map((matchNo)");
    expect(appSource).toContain("desktopRounds.thirdPlace.map((matchNo)");
    expect(appSource).not.toContain("desktopRounds.center.map((matchNo)");
    expect(appSource).toContain('className="space-y-6 rounded-[28px] bg-white/[0.04] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"');
    expect(appSource).toContain('className="space-y-6 rounded-[28px] bg-white/[0.04] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"');
  });

  test("removes the round-of-32 wrapper cards while keeping grouped spacing and separate center cards", () => {
    expect(appSource).toContain('key={`left32-${groupIndex}`}');
    expect(appSource).toContain('key={`right32-${groupIndex}`}');
    expect(appSource).not.toContain('left32-${groupIndex}`} className="space-y-3 rounded-[24px] bg-white/[0.03] px-2 py-2"');
    expect(appSource).not.toContain('right32-${groupIndex}`} className="space-y-3 rounded-[24px] bg-white/[0.03] px-2 py-2"');
    expect(appSource).not.toContain("desktopRounds.center.map((matchNo)");
  });
  test("creates champion road persistence tables and policies", () => {
    const normalized = migrationSource.toLowerCase();

    expect(normalized).toContain("create table if not exists public.champion_road_predictions");
    expect(normalized).toContain("create table if not exists public.champion_road_prediction_items");
    expect(normalized).toContain("alter table public.champion_road_predictions enable row level security");
    expect(normalized).toContain("alter table public.champion_road_prediction_items enable row level security");
  });
});
