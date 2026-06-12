import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { TeamProfileCard } from "../components/teamProfileCard";
import { TEAM_PROFILE_DIMENSIONS, TEAM_PROFILES, getTeamProfileByName } from "../lib/teamProfiles";

const teamProfileSource = readFileSync(resolve(process.cwd(), "src/components/teamProfileCard.jsx"), "utf8");

describe("team hover card", () => {
  test("exposes the agreed six radar dimensions", () => {
    expect(TEAM_PROFILE_DIMENSIONS.map((item) => item.label)).toEqual([
      "进攻火力",
      "防守硬度",
      "中场控制",
      "速度冲击",
      "定位球威胁",
      "大赛经验",
    ]);
  });

  test("maps common team display names to local profiles", () => {
    expect(getTeamProfileByName("法国")).toMatchObject({
      key: "FRA",
    });
    expect(getTeamProfileByName("英格兰")).toMatchObject({
      key: "ENG",
      countryCode: "gb-eng",
    });
    expect(getTeamProfileByName("第一场胜者")).toBeNull();
  });

  test("stores the refreshed Brazil coach snapshot in Chinese", () => {
    expect(getTeamProfileByName("巴西")).toMatchObject({
      key: "BRA",
      coach: "卡洛·安切洛蒂",
      topValuablePlayer: "维尼修斯·儒尼奥尔",
      confederation: "CONMEBOL",
      fifaRank: 6,
    });
  });

  test("renders the richer scouting content", () => {
    const profile = getTeamProfileByName("法国");
    const markup = renderToStaticMarkup(<TeamProfileCard profile={profile} />);

    expect(markup).toContain("法国");
    expect(markup).toContain("France");
    expect(markup).toContain("世界排名");
    expect(markup).toContain("所属大洲");
    expect(markup).toContain("主教练");
    expect(markup).toContain("最高身价");
    expect(markup).toContain("总身价");
    expect(markup).toContain("上届世界杯");
    expect(markup).toContain("六维战力");
    expect(markup).not.toContain("资料快照");
  });

  test("fills market values for teams that previously needed review", () => {
    const completedKeys = [
      "CZE",
      "BIH",
      "PAR",
      "QAT",
      "SUI",
      "MAR",
      "HTI",
      "AUS",
      "TUR",
      "CUW",
      "CIV",
      "ECU",
      "SWE",
      "TUN",
      "BEL",
      "EGY",
      "KSA",
      "IRN",
      "NZL",
      "SEN",
      "IRQ",
      "ALG",
      "AUT",
      "COD",
      "GHA",
      "PAN",
      "UZB",
      "COL",
    ];

    const completedProfiles = TEAM_PROFILES.filter((profile) => completedKeys.includes(profile.key));

    expect(completedProfiles).toHaveLength(completedKeys.length);
    expect(
      completedProfiles.every(
        (profile) =>
          profile.topValuablePlayerValue !== "待复核" &&
          profile.totalSquadValue !== "待复核",
      ),
    ).toBe(true);
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
