import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { getFlagAssetByCountryCode, getFlagAssetByTeamName, getFlagRenderData } from "../lib/flags";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");
const scotlandFlagSource = readFileSync(resolve(process.cwd(), "src/assets/flags/gb-sct.svg"), "utf8");

describe("local flags", () => {
  test("maps France by team name to a local asset", () => {
    expect(getFlagAssetByTeamName("法国")).toContain("data:image/svg+xml");
  });

  test("maps England by special country code to a local asset", () => {
    expect(getFlagAssetByCountryCode("gb-eng")).toContain("data:image/svg+xml");
  });

  test("ships a proper Scotland saltire asset", () => {
    expect(scotlandFlagSource).toContain('fill="#005eb8"');
    expect(scotlandFlagSource).toContain('points="0,0 7,0 60,31.8 60,36 53,36 0,4.2"');
    expect(scotlandFlagSource).toContain('points="53,0 60,0 60,4.2 7,36 0,36 0,31.8"');
  });

  test("prefers local image rendering over emoji fallback", () => {
    expect(getFlagRenderData({ teamName: "France", countryCode: "fr", fallbackEmoji: "🇫🇷" })).toMatchObject({
      type: "image",
    });
  });

  test("app no longer references flagcdn", () => {
    expect(appSource).not.toContain("flagcdn.com");
  });

  test("app removes dark framed flag treatments", () => {
    expect(appSource).not.toContain("rounded-full bg-slate-900 object-contain");
    expect(appSource).not.toContain("rounded-[3px] object-cover shadow-sm");
    expect(appSource).not.toContain("rounded-[4px] object-cover shadow-sm");
  });
});
