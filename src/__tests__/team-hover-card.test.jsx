import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { TeamProfileCard } from "../components/teamProfileCard";
import { TEAM_PROFILE_DIMENSIONS, getTeamProfileByName } from "../lib/teamProfiles";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const teamProfileSource = readFileSync(resolve(process.cwd(), "src/components/teamProfileCard.jsx"), "utf8");

describe("team hover card", () => {
  test("exposes the agreed six radar dimensions", () => {
    expect(TEAM_PROFILE_DIMENSIONS.map((item) => item.label)).toEqual([
      "进攻火力",
      "防守硬度",
      "中场控制",
      "速度冲击",
      "阵容深度",
      "大赛经验",
    ]);
  });

  test("maps common team display names to local profiles", () => {
    expect(getTeamProfileByName("法国")).toMatchObject({
      key: "FRA",
      fifaRank: 2,
    });
    expect(getTeamProfileByName("英格兰")).toMatchObject({
      key: "ENG",
      countryCode: "gb-eng",
    });
    expect(getTeamProfileByName("第73场胜者")).toBeNull();
  });

  test("renders the compact team scouting content", () => {
    const profile = getTeamProfileByName("法国");
    const markup = renderToStaticMarkup(<TeamProfileCard profile={profile} />);

    expect(markup).toContain("法国");
    expect(markup).toContain("France");
    expect(markup).toContain("FIFA排名 #2");
    expect(markup).toContain("主教练");
    expect(markup).toContain("头号球星");
    expect(markup).toContain("高压逼抢");
    expect(markup).toContain("六维战力");
  });

  test("uses a translucent glass-like card shell", () => {
    const profile = getTeamProfileByName("法国");
    const markup = renderToStaticMarkup(<TeamProfileCard profile={profile} />);

    expect(markup).toContain("backdrop-blur-xl");
    expect(markup).toContain("rgba(8, 15, 28, 0.42)");
    expect(markup).toContain("rgba(15, 23, 42, 0.7)");
  });

  test("renders the floating profile layer through a portal so parent overflow does not clip it", () => {
    expect(teamProfileSource).toContain("createPortal(");
    expect(teamProfileSource).toContain('position: "fixed"');
  });
});
