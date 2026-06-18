import { describe, expect, test } from "vitest";
import { buildTeamTournamentRecord } from "../lib/teamTournamentRecord";

describe("team tournament record", () => {
  test("builds a settled summary from both home and away matches", () => {
    const record = buildTeamTournamentRecord("France", [
      {
        id: "group-1",
        stage: "GROUP",
        group: "I组",
        home: "France",
        away: "Senegal",
        kickoff: "2026-06-17T03:00:00.000Z",
        status: "settled",
        homeScore: 3,
        awayScore: 1,
      },
      {
        id: "group-2",
        stage: "GROUP",
        group: "I组",
        home: "Iraq",
        away: "France",
        kickoff: "2026-06-23T05:00:00.000Z",
        status: "settled",
        homeScore: 1,
        awayScore: 1,
      },
      {
        id: "group-3",
        stage: "GROUP",
        group: "I组",
        home: "Norway",
        away: "France",
        kickoff: "2026-06-27T03:00:00.000Z",
        status: "open",
        homeScore: null,
        awayScore: null,
      },
    ]);

    expect(record).toMatchObject({
      played: 2,
      won: 1,
      drawn: 1,
      lost: 0,
      goalsFor: 4,
      goalsAgainst: 2,
      summary: "1胜1平0负",
      goalsSummary: "进4失2",
    });
    expect(record.matchResults).toHaveLength(2);
    expect(record.matchResults[0]).toMatchObject({
      opponent: "Senegal",
      stageLabel: "I组",
      scoreline: "3 : 1",
      result: "胜",
    });
    expect(record.matchResults[1]).toMatchObject({
      opponent: "Iraq",
      stageLabel: "I组",
      scoreline: "1 : 1",
      result: "平",
    });
  });

  test("falls back to knockout stage labels when no group label is present", () => {
    const record = buildTeamTournamentRecord("France", [
      {
        id: "knockout-1",
        stage: "ROUND16",
        group: "16强赛",
        home: "France",
        away: "Mexico",
        kickoff: "2026-06-30T04:30:00.000Z",
        status: "settled",
        homeScore: 2,
        awayScore: 0,
      },
    ]);

    expect(record.matchResults[0]).toMatchObject({
      stageLabel: "16强赛",
      result: "胜",
    });
  });

  test("returns an empty record when a team has no settled matches", () => {
    expect(
      buildTeamTournamentRecord("France", [
        {
          id: "future-1",
          stage: "GROUP",
          group: "I组",
          home: "France",
          away: "Norway",
          kickoff: "2026-06-27T03:00:00.000Z",
          status: "open",
          homeScore: null,
          awayScore: null,
        },
      ]),
    ).toMatchObject({
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      matchResults: [],
    });
  });
});
