import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import {
  ASIA_ROUND2_DEADLINE_AT,
  ASIA_ROUND2_GOALS_EVENT_ID,
  ASIA_ROUND2_POINTS_EVENT_ID,
  CUT_LINE_MASTER_DEADLINE_AT,
  CUT_LINE_MASTER_GOAL_DIFFERENCE_EVENT_ID,
  CUT_LINE_MASTER_GOALS_EVENT_ID,
  CUT_LINE_MASTER_GROUP_ID,
  CUT_LINE_MASTER_POINTS_EVENT_ID,
  FIRST_GOAL_TIME_EVENT_ID,
  SPONSOR_PREDICTION_EVENTS,
  SPONSOR_PREDICTION_GROUP_BY_ID,
  SPONSOR_PREDICTION_GROUPS,
  calculateCutLineMasterStats,
  calculateAsiaRound2Stats,
  getFirstGoalResolvedMatch,
  getCutLineMasterWinners,
  getGroupPredictionWinners,
  getPlayerSponsorTitles,
  getSponsorPredictionDeadlineLabel,
  getSponsorPredictionGroupStandings,
  getSponsorPredictionWinners,
  getVisiblePredictionPlayers,
  isSponsorPredictionLocked,
} from "../lib/sponsorPredictions";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");
const allowNegativeMigrationSource = readFileSync(resolve(process.cwd(), "supabase/migrations/20260624_allow_negative_sponsor_prediction_values.sql"), "utf8");

describe("sponsor predictions", () => {
  test("resolves the first scored match by skipping goalless earlier matches", () => {
    const match = getFirstGoalResolvedMatch([
      { id: "m1", no: 1, kickoff: "2026-06-12T03:00:00+08:00", status: "settled", homeScore: 0, awayScore: 0 },
      { id: "m2", no: 2, kickoff: "2026-06-12T10:00:00+08:00", status: "settled", homeScore: 2, awayScore: 1 },
      { id: "m3", no: 3, kickoff: "2026-06-13T03:00:00+08:00", status: "settled", homeScore: 1, awayScore: 0 },
    ]);

    expect(match).toMatchObject({ id: "m2", no: 2 });
  });

  test("returns all tied closest players for the first goal time title", () => {
    const winners = getSponsorPredictionWinners({
      eventId: FIRST_GOAL_TIME_EVENT_ID,
      players: [
        { id: "u1", name: "Alpha" },
        { id: "u2", name: "Beta" },
        { id: "u3", name: "Gamma" },
      ],
      predictionsByUserId: {
        u1: { predictedValue: 755 },
        u2: { predictedValue: 765 },
        u3: { predictedValue: 840 },
      },
      result: {
        actualValue: 760,
      },
    });

    expect(winners.map((item) => item.id)).toEqual(["u1", "u2"]);
    expect(winners.every((item) => item.diff === 5)).toBe(true);
  });

  test("keeps the first-goal sponsor event in the list", () => {
    expect(SPONSOR_PREDICTION_EVENTS.some((event) => event.id === FIRST_GOAL_TIME_EVENT_ID)).toBe(true);
  });

  test("calculates AFC teams round-two totals from each team's second settled group match", () => {
    const stats = calculateAsiaRound2Stats([
      { id: "m1", stage: "GROUP", kickoff: "2026-06-12T03:00:00+08:00", status: "settled", home: "韩国", away: "捷克", homeScore: 1, awayScore: 0 },
      { id: "m2", stage: "GROUP", kickoff: "2026-06-19T09:00:00+08:00", status: "settled", home: "墨西哥", away: "韩国", homeScore: 2, awayScore: 2 },
      { id: "m3", stage: "GROUP", kickoff: "2026-06-14T03:00:00+08:00", status: "settled", home: "卡塔尔", away: "瑞士", homeScore: 0, awayScore: 1 },
      { id: "m4", stage: "GROUP", kickoff: "2026-06-19T06:00:00+08:00", status: "settled", home: "加拿大", away: "卡塔尔", homeScore: 1, awayScore: 3 },
      { id: "m5", stage: "GROUP", kickoff: "2026-06-14T12:00:00+08:00", status: "settled", home: "澳大利亚", away: "土耳其", homeScore: 0, awayScore: 0 },
      { id: "m6", stage: "GROUP", kickoff: "2026-06-20T03:00:00+08:00", status: "settled", home: "美国", away: "澳大利亚", homeScore: 1, awayScore: 0 },
      { id: "m7", stage: "GROUP", kickoff: "2026-06-16T09:00:00+08:00", status: "settled", home: "伊朗", away: "新西兰", homeScore: 2, awayScore: 1 },
      { id: "m8", stage: "GROUP", kickoff: "2026-06-22T03:00:00+08:00", status: "settled", home: "比利时", away: "伊朗", homeScore: 2, awayScore: 2 },
      { id: "m9", stage: "GROUP", kickoff: "2026-06-22T11:00:00+08:00", status: "open", home: "日本", away: "巴西", homeScore: null, awayScore: null },
    ]);

    expect(stats).toMatchObject({
      totalPoints: 5,
      totalGoals: 7,
      completedTeams: 4,
      totalTeams: 9,
      isComplete: false,
    });
    expect(stats.includedMatches.map((match) => match.id)).toEqual(["m2", "m4", "m6", "m8"]);
  });

  test("locks Asia round-two prediction at the fixed Beijing deadline", () => {
    expect(isSponsorPredictionLocked({ id: ASIA_ROUND2_POINTS_EVENT_ID }, { now: "2026-06-18T15:59:59.000Z" })).toBe(false);
    expect(isSponsorPredictionLocked({ id: ASIA_ROUND2_POINTS_EVENT_ID }, { now: ASIA_ROUND2_DEADLINE_AT })).toBe(true);
    expect(getSponsorPredictionDeadlineLabel({ id: ASIA_ROUND2_POINTS_EVENT_ID })).toContain("2026/06/19 00:00");
  });

  test("defines cut line master as the current sponsor prediction group and archives Asia summit", () => {
    const cutLineGroup = SPONSOR_PREDICTION_GROUP_BY_ID[CUT_LINE_MASTER_GROUP_ID];
    const asiaGroup = SPONSOR_PREDICTION_GROUPS.find((group) => group.id === "asia_round2");

    expect(cutLineGroup).toMatchObject({
      awardTitle: "卡线大师",
      historical: false,
      collapseByDefault: false,
    });
    expect(cutLineGroup.events.map((event) => event.id)).toEqual([
      CUT_LINE_MASTER_POINTS_EVENT_ID,
      CUT_LINE_MASTER_GOAL_DIFFERENCE_EVENT_ID,
      CUT_LINE_MASTER_GOALS_EVENT_ID,
    ]);
    expect(asiaGroup).toMatchObject({
      historical: true,
      collapseByDefault: true,
    });
    expect(isSponsorPredictionLocked({ id: CUT_LINE_MASTER_POINTS_EVENT_ID }, { now: "2026-06-24T18:59:59.000Z" })).toBe(false);
    expect(isSponsorPredictionLocked({ id: CUT_LINE_MASTER_POINTS_EVENT_ID }, { now: CUT_LINE_MASTER_DEADLINE_AT })).toBe(true);
    expect(getSponsorPredictionDeadlineLabel({ id: CUT_LINE_MASTER_POINTS_EVENT_ID })).toContain("2026/06/25 03:00");
  });

  test("tracks the eighth-best third place team for cut line master stats", () => {
    const standings = {};
    "ABCDEFGHIJKL".split("").forEach((group, index) => {
      standings[`${group}组`] = [
        { group: `${group}组`, team: `${group}1`, points: 9, goalDifference: 5, goalsFor: 8 },
        { group: `${group}组`, team: `${group}2`, points: 6, goalDifference: 2, goalsFor: 5 },
        { group: `${group}组`, team: `${group}3`, points: 4 + (index % 2), goalDifference: 3 - index, goalsFor: 10 - index },
        { group: `${group}组`, team: `${group}4`, points: 0, goalDifference: -6, goalsFor: 1 },
      ];
    });

    const stats = calculateCutLineMasterStats(standings);

    expect(stats).toMatchObject({
      team: "C3",
      group: "C组",
      points: 4,
      goalDifference: 1,
      goalsFor: 8,
      completedGroups: 12,
      isComplete: true,
    });
  });

  test("marks cut line master stats incomplete until all twelve third-place teams exist", () => {
    const stats = calculateCutLineMasterStats({
      A组: [
        { group: "A组", team: "A1", points: 7, goalDifference: 3, goalsFor: 6 },
        { group: "A组", team: "A2", points: 5, goalDifference: 1, goalsFor: 4 },
        { group: "A组", team: "A3", points: 4, goalDifference: 0, goalsFor: 3 },
      ],
      B组: [
        { group: "B组", team: "B1", points: 6, goalDifference: 2, goalsFor: 5 },
        { group: "B组", team: "B2", points: 5, goalDifference: 1, goalsFor: 4 },
      ],
    });

    expect(stats).toMatchObject({
      team: "A3",
      group: "A组",
      points: 4,
      completedGroups: 1,
      totalGroups: 12,
      isComplete: false,
    });
  });

  test("scores Asia round-two group standings by combining two ranked numeric events", () => {
    const standings = getSponsorPredictionGroupStandings({
      eventIds: [ASIA_ROUND2_POINTS_EVENT_ID, ASIA_ROUND2_GOALS_EVENT_ID],
      players: [
        { id: "u1", name: "Alpha" },
        { id: "u2", name: "Beta" },
        { id: "u3", name: "Gamma" },
      ],
      sponsorPredictions: {
        [ASIA_ROUND2_POINTS_EVENT_ID]: {
          u1: { predictedValue: 8 },
          u2: { predictedValue: 7 },
          u3: { predictedValue: 10 },
        },
        [ASIA_ROUND2_GOALS_EVENT_ID]: {
          u1: { predictedValue: 6 },
          u2: { predictedValue: 7 },
          u3: { predictedValue: 8 },
        },
      },
      sponsorPredictionResults: {
        [ASIA_ROUND2_POINTS_EVENT_ID]: { actualValue: 8 },
        [ASIA_ROUND2_GOALS_EVENT_ID]: { actualValue: 7 },
      },
    });

    expect(standings.map((entry) => [entry.id, entry.totalScore])).toEqual([
      ["u1", 5],
      ["u2", 5],
      ["u3", 3],
    ]);

    const winners = getGroupPredictionWinners(standings);
    expect(winners.map((entry) => entry.id)).toEqual(["u1", "u2"]);
  });

  test("picks cut line master winners by points diff before goal difference and goals", () => {
    const winners = getCutLineMasterWinners({
      players: [
        { id: "u1", name: "Alpha" },
        { id: "u2", name: "Beta" },
        { id: "u3", name: "Gamma" },
      ],
      sponsorPredictions: {
        [CUT_LINE_MASTER_POINTS_EVENT_ID]: {
          u1: { predictedValue: 4 },
          u2: { predictedValue: 4 },
          u3: { predictedValue: 6 },
        },
        [CUT_LINE_MASTER_GOAL_DIFFERENCE_EVENT_ID]: {
          u1: { predictedValue: -3 },
          u2: { predictedValue: -4 },
          u3: { predictedValue: -4 },
        },
        [CUT_LINE_MASTER_GOALS_EVENT_ID]: {
          u1: { predictedValue: 2 },
          u2: { predictedValue: 3 },
          u3: { predictedValue: 4 },
        },
      },
      sponsorPredictionResults: {
        [CUT_LINE_MASTER_POINTS_EVENT_ID]: { actualValue: 5 },
        [CUT_LINE_MASTER_GOAL_DIFFERENCE_EVENT_ID]: { actualValue: -4 },
        [CUT_LINE_MASTER_GOALS_EVENT_ID]: { actualValue: 3 },
      },
    });

    expect(winners.map((entry) => entry.id)).toEqual(["u2"]);
    expect(winners[0]).toMatchObject({
      pointsDiff: 1,
      goalDifferenceDiff: 0,
      goalsDiff: 0,
    });
  });

  test("allows tied cut line master winners when all three diffs match", () => {
    const winners = getCutLineMasterWinners({
      players: [
        { id: "u1", name: "Alpha" },
        { id: "u2", name: "Beta" },
      ],
      sponsorPredictions: {
        [CUT_LINE_MASTER_POINTS_EVENT_ID]: {
          u1: { predictedValue: 4 },
          u2: { predictedValue: 6 },
        },
        [CUT_LINE_MASTER_GOAL_DIFFERENCE_EVENT_ID]: {
          u1: { predictedValue: -3 },
          u2: { predictedValue: -5 },
        },
        [CUT_LINE_MASTER_GOALS_EVENT_ID]: {
          u1: { predictedValue: 2 },
          u2: { predictedValue: 4 },
        },
      },
      sponsorPredictionResults: {
        [CUT_LINE_MASTER_POINTS_EVENT_ID]: { actualValue: 5 },
        [CUT_LINE_MASTER_GOAL_DIFFERENCE_EVENT_ID]: { actualValue: -4 },
        [CUT_LINE_MASTER_GOALS_EVENT_ID]: { actualValue: 3 },
      },
    });

    expect(winners.map((entry) => entry.id)).toEqual(["u1", "u2"]);
  });

  test("awards the cut line master title through sponsor titles", () => {
    const titles = getPlayerSponsorTitles({
      playerId: "u2",
      players: [
        { id: "u1", name: "Alpha" },
        { id: "u2", name: "Beta" },
      ],
      sponsorPredictions: {
        [CUT_LINE_MASTER_POINTS_EVENT_ID]: {
          u1: { predictedValue: 4 },
          u2: { predictedValue: 5 },
        },
        [CUT_LINE_MASTER_GOAL_DIFFERENCE_EVENT_ID]: {
          u1: { predictedValue: -3 },
          u2: { predictedValue: -4 },
        },
        [CUT_LINE_MASTER_GOALS_EVENT_ID]: {
          u1: { predictedValue: 2 },
          u2: { predictedValue: 3 },
        },
      },
      sponsorPredictionResults: {
        [CUT_LINE_MASTER_POINTS_EVENT_ID]: { actualValue: 5 },
        [CUT_LINE_MASTER_GOAL_DIFFERENCE_EVENT_ID]: { actualValue: -4 },
        [CUT_LINE_MASTER_GOALS_EVENT_ID]: { actualValue: 3 },
      },
    });

    expect(titles).toContain("卡线大师");
  });

  test("hides unsubmitted players after predictions become public", () => {
    const players = [
      { id: "u1", name: "Alpha" },
      { id: "u2", name: "Beta" },
      { id: "u3", name: "Gamma" },
    ];
    const predictionsByUserId = {
      u1: { predictedValue: 120 },
      u3: { predictedValue: 240 },
    };

    expect(
      getVisiblePredictionPlayers({
        players,
        predictionsByUserId,
        showAll: true,
        currentPlayerId: "u2",
      }).map((player) => player.id),
    ).toEqual(["u1", "u3"]);

    expect(
      getVisiblePredictionPlayers({
        players,
        predictionsByUserId,
        showAll: false,
        currentPlayerId: "u2",
      }).map((player) => player.id),
    ).toEqual(["u2"]);
  });

  test("adds the sponsor prediction tab before fun prediction in extra navigation", () => {
    const sponsorIndex = appSource.indexOf('{ id: "sponsorPredictions", label: "冠名预测"');
    const funIndex = appSource.indexOf('{ id: "fun", label: "趣味预测"');

    expect(sponsorIndex).toBeGreaterThan(-1);
    expect(funIndex).toBeGreaterThan(-1);
    expect(sponsorIndex).toBeLessThan(funIndex);
  });

  test("keeps the football institute title ahead of the older fun titles", () => {
    const sponsorTitleIndex = appSource.indexOf('titles.push("足球研究所所长")');
    const championTitleIndex = appSource.indexOf('titles.push("世界杯导演")');

    expect(sponsorTitleIndex).toBeGreaterThan(-1);
    expect(championTitleIndex).toBeGreaterThan(-1);
    expect(sponsorTitleIndex).toBeLessThan(championTitleIndex);
  });

  test("removes the old personal sponsor prediction heading", () => {
    expect(appSource.includes("我的冠名预测")).toBe(false);
  });

  test("shows cut line master as the current sponsor UI and archives older sponsor events", () => {
    expect(appSource.includes("卡线大师")).toBe(true);
    expect(appSource.includes("新的主玩法是“卡线大师”")).toBe(true);
    expect(appSource.includes("北京时间 2026/06/25 03:00")).toBe(true);
    expect(appSource.includes("最边缘第三名")).toBe(true);
    expect(appSource.includes("亚洲之巅")).toBe(true);
    expect(appSource.includes("足球研究所所长")).toBe(true);
    expect(appSource.includes("已结束")).toBe(true);
    expect(SPONSOR_PREDICTION_EVENTS.some((event) => event.label === "第二轮总积分")).toBe(true);
    expect(SPONSOR_PREDICTION_EVENTS.some((event) => event.label === "第二轮总进球")).toBe(true);
    expect(SPONSOR_PREDICTION_EVENTS.some((event) => event.id === CUT_LINE_MASTER_GOAL_DIFFERENCE_EVENT_ID)).toBe(true);
  });

  test("database migration allows negative sponsor prediction values", () => {
    const normalizedSource = allowNegativeMigrationSource.toLowerCase();

    expect(normalizedSource).toContain("drop constraint if exists sponsor_predictions_predicted_total_seconds_check");
    expect(normalizedSource).not.toContain("predicted_total_seconds >= 0");
  });

  test("adds the all-features tab and replaces the mobile profile tab", () => {
    expect(appSource.includes('{ id: "allFeatures", label: "全部功能"')).toBe(true);
    expect(appSource.includes('const MOBILE_PRIMARY_NAV_IDS = ["home", "schedule", "ranking", "achievements", "allFeatures"]')).toBe(true);
  });

  test("keeps desktop profile navigation and adds the all-features panel", () => {
    expect(appSource.includes('const DESKTOP_PRIMARY_NAV_IDS = ["home", "schedule", "ranking", "achievements", "playerProfile"]')).toBe(true);
    expect(appSource.includes("function AllFeaturesPanel(")).toBe(true);
  });
});
