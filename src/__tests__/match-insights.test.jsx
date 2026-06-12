import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { TeamRadarChart, TeamRadarComparison } from "../components/teamProfileCard";
import { buildMatchInsights } from "../lib/matchInsights";
import { getTeamProfileByCountryCode } from "../lib/teamProfiles";

const teamProfileSource = readFileSync(resolve(process.cwd(), "src/components/teamProfileCard.jsx"), "utf8");

describe("match insights", () => {
  const match = {
    id: "m-can-bih",
    no: 3,
    stage: "GROUP",
    group: "B组",
    home: "加拿大",
    away: "波黑",
    kickoff: "2026-06-13T03:00:00.000Z",
  };

  test("keeps match insights focused on profiles and stops generating preview copy", () => {
    const insights = buildMatchInsights(match);

    expect(insights.previewPoints).toEqual([]);
    expect(insights.probabilities).toBeNull();
    expect(insights.bookmakers).toHaveLength(5);
    expect(insights.bookmakers.every((bookmaker) => bookmaker.status === "missing")).toBe(true);
    expect(insights.homeProfile?.displayNameZh).toBe("加拿大");
    expect(insights.awayProfile?.displayNameZh).toBe("波黑");
  });

  test("keeps radar labels visible by using a larger comparison canvas and container", () => {
    const homeProfile = getTeamProfileByCountryCode("ca");
    const awayProfile = getTeamProfileByCountryCode("ba");
    const comparisonMarkup = renderToStaticMarkup(<TeamRadarComparison homeProfile={homeProfile} awayProfile={awayProfile} />);

    expect(teamProfileSource).toContain("size={248}");
    expect(teamProfileSource).toContain("labelOffset={24}");
    expect(teamProfileSource).toContain("max-w-[24rem]");
    expect(comparisonMarkup).toContain("进攻火力");
    expect(comparisonMarkup).toContain("定位球威胁");
  });

  test("reuses the same radar dimensions for single-team and overlap charts", () => {
    const homeProfile = getTeamProfileByCountryCode("ca");
    const awayProfile = getTeamProfileByCountryCode("ba");

    const singleMarkup = renderToStaticMarkup(<TeamRadarChart profile={homeProfile} />);
    const comparisonMarkup = renderToStaticMarkup(<TeamRadarComparison homeProfile={homeProfile} awayProfile={awayProfile} />);

    expect(singleMarkup).toContain("六维战力");
    expect(comparisonMarkup).toContain("六维战力");
    expect(comparisonMarkup).toContain("加拿大");
    expect(comparisonMarkup).toContain("波黑");
  });
});
