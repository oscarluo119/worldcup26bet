import { describe, expect, test } from "vitest";
import { buildWorldCupTeamCardMatches } from "../lib/worldCupTeamCardMatches";

describe("world cup team card matches", () => {
  test("hydrates settled scores from world cup results onto the schedule", () => {
    const matches = buildWorldCupTeamCardMatches(
      [
        {
          id: "m-17",
          no: 17,
          stage: "GROUP",
          group: "I组",
          home: "France",
          away: "Senegal",
          kickoff: "2026-06-17T03:00:00.000Z",
          status: "open",
          homeScore: null,
          awayScore: null,
        },
        {
          id: "m-18",
          no: 18,
          stage: "GROUP",
          group: "I组",
          home: "Iraq",
          away: "Norway",
          kickoff: "2026-06-17T06:00:00.000Z",
          status: "open",
          homeScore: null,
          awayScore: null,
        },
      ],
      {
        17: { homeScore: 3, awayScore: 1 },
      },
    );

    expect(matches[0]).toMatchObject({
      status: "settled",
      homeScore: 3,
      awayScore: 1,
    });
    expect(matches[1]).toMatchObject({
      status: "open",
      homeScore: null,
      awayScore: null,
    });
  });

  test("falls back to settled matches when world cup results are unavailable", () => {
    const matches = buildWorldCupTeamCardMatches(
      [
        {
          id: "17",
          no: 17,
          stage: "GROUP",
          group: "I组",
          home: "法国",
          away: "塞内加尔",
          kickoff: "2026-06-17T03:00:00.000Z",
          status: "open",
          homeScore: null,
          awayScore: null,
        },
      ],
      {},
      [
        {
          id: "17",
          no: 17,
          stage: "GROUP",
          group: "I组",
          home: "法国",
          away: "塞内加尔",
          kickoff: "2026-06-17T03:00:00.000Z",
          status: "settled",
          homeScore: 2,
          awayScore: 0,
        },
      ],
    );

    expect(matches[0]).toMatchObject({
      status: "settled",
      homeScore: 2,
      awayScore: 0,
    });
  });
});
