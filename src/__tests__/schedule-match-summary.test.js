import { describe, expect, test } from "vitest";
import { buildScheduleMatchSummary } from "../lib/scheduleMatchSummary";

describe("schedule match summary", () => {
  const settledMatch = {
    id: "m1",
    no: 17,
    stage: "GROUP",
    home: "France",
    away: "Senegal",
    status: "settled",
    homeScore: 3,
    awayScore: 1,
  };

  test("returns my points and submitted-player average for a settled match", () => {
    const summary = buildScheduleMatchSummary({
      match: settledMatch,
      currentPrediction: { playerId: "u1", matchId: "m1", home: 3, away: 1 },
      predictions: [
        { playerId: "u1", matchId: "m1", home: 3, away: 1 },
        { playerId: "u2", matchId: "m1", home: 2, away: 0 },
        { playerId: "u3", matchId: "m1", home: 1, away: 1 },
      ],
    });

    expect(summary).toMatchObject({
      hasSettledResult: true,
      myPredictionLabel: "3:1",
      myPoints: 4,
      submittedPredictionCount: 3,
      averagePoints: 2,
      averagePointsLabel: "2",
      myPointsLabel: "+4",
      resultLabel: "3:1",
    });
  });

  test("ignores non-submitted players and keeps one decimal for averages", () => {
    const summary = buildScheduleMatchSummary({
      match: settledMatch,
      currentPrediction: { playerId: "u1", matchId: "m1", home: 2, away: 1 },
      predictions: [
        { playerId: "u1", matchId: "m1", home: 2, away: 1 },
        { playerId: "u2", matchId: "m1", home: 3, away: 1 },
      ],
    });

    expect(summary.submittedPredictionCount).toBe(2);
    expect(summary.averagePoints).toBe(2.5);
    expect(summary.averagePointsLabel).toBe("2.5");
  });

  test("shows unsettled placeholders while preserving my prediction label", () => {
    const summary = buildScheduleMatchSummary({
      match: {
        ...settledMatch,
        status: "open",
        homeScore: null,
        awayScore: null,
      },
      currentPrediction: { playerId: "u1", matchId: "m1", home: 2, away: 0 },
      predictions: [{ playerId: "u1", matchId: "m1", home: 2, away: 0 }],
    });

    expect(summary).toMatchObject({
      hasSettledResult: false,
      resultLabel: "待结算",
      myPredictionLabel: "2:0",
      myPoints: null,
      averagePoints: null,
      myPointsLabel: "待结算",
      averagePointsLabel: "待结算",
    });
  });

  test("shows unsubmitted and no-average states when appropriate", () => {
    const summary = buildScheduleMatchSummary({
      match: settledMatch,
      currentPrediction: null,
      predictions: [],
    });

    expect(summary).toMatchObject({
      myPredictionLabel: "未提交",
      myPoints: null,
      myPointsLabel: "未提交",
      averagePoints: null,
      averagePointsLabel: "暂无均分",
      submittedPredictionCount: 0,
    });
  });

  test("formats labels for secondary views like history rows", () => {
    const summary = buildScheduleMatchSummary({
      match: settledMatch,
      currentPrediction: { playerId: "u1", matchId: "m1", home: 2, away: 0 },
      predictions: [
        { playerId: "u1", matchId: "m1", home: 2, away: 0 },
        { playerId: "u2", matchId: "m1", home: 3, away: 1 },
      ],
    });

    expect(summary).toMatchObject({
      myPointsLabel: "+2",
      averagePointsLabel: "3",
      myPredictionLabel: "2:0",
      resultLabel: "3:1",
    });
  });
});
