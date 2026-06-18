import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { TeamProfileCard } from "../components/teamProfileCard";
import { getTeamProfileByName } from "../lib/teamProfiles";

describe("team hover record section", () => {
  test("renders a settled tournament record section when match data is provided", () => {
    const profile = getTeamProfileByName("France");
    const markup = renderToStaticMarkup(
      <TeamProfileCard
        profile={profile}
        matches={[
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
        ]}
      />,
    );

    expect(markup).toContain("本届战绩");
    expect(markup).toContain("1胜1平0负");
    expect(markup).toContain("进4失2");
    expect(markup).toContain("Senegal");
    expect(markup).toContain("Iraq");
    expect(markup).toContain("3 : 1");
    expect(markup).toContain("1 : 1");
  });

  test("shows an empty-state message when a team has no settled matches yet", () => {
    const profile = getTeamProfileByName("France");
    const markup = renderToStaticMarkup(
      <TeamProfileCard
        profile={profile}
        matches={[
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
        ]}
      />,
    );

    expect(markup).toContain("本届战绩");
    expect(markup).toContain("本届暂无已结束比赛");
  });
});
