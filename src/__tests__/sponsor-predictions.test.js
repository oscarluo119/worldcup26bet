import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import {
  FIRST_GOAL_TIME_EVENT_ID,
  SPONSOR_PREDICTION_EVENTS,
  getFirstGoalResolvedMatch,
  getSponsorPredictionWinners,
  getVisiblePredictionPlayers,
} from "../lib/sponsorPredictions";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");

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
        u1: { predictedTotalSeconds: 755 },
        u2: { predictedTotalSeconds: 765 },
        u3: { predictedTotalSeconds: 840 },
      },
      result: {
        actualTotalSeconds: 760,
      },
    });

    expect(winners.map((item) => item.id)).toEqual(["u1", "u2"]);
    expect(winners.every((item) => item.diffSeconds === 5)).toBe(true);
  });

  test("uses the updated sponsor naming for the first-goal event", () => {
    expect(SPONSOR_PREDICTION_EVENTS[0]).toMatchObject({
      sponsorName: "墨鱼",
    });
  });

  test("hides unsubmitted players after predictions become public", () => {
    const players = [
      { id: "u1", name: "Alpha" },
      { id: "u2", name: "Beta" },
      { id: "u3", name: "Gamma" },
    ];
    const predictionsByUserId = {
      u1: { predictedTotalSeconds: 120 },
      u3: { predictedTotalSeconds: 240 },
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
});
