import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");

describe("team hover profile scope", () => {
  test("enables team profile triggers in schedule and full schedule entries", () => {
    expect(appSource).toContain('<TeamName name={match.home} logo={match.homeLogo} interactiveProfile />');
    expect(appSource).toContain('<TeamName name={match.away} logo={match.awayLogo} interactiveProfile />');
  });

  test("keeps the player ranking table focused on player rows, not extra team triggers", () => {
    expect(appSource).toContain('<button key={player.id} type="button" onClick={() => onOpenPlayerProfile?.(player.id)} className={cn("md3-card w-full text-left", isCurrent && "md3-filled-card")}>');
  });

  test("lets the expanded schedule card show hover profiles above the prediction detail area", () => {
    expect(appSource).toContain('overflow-visible rounded-[28px] transition');
    expect(appSource).toContain('relative z-20 md3-card w-full !p-3 text-left');
  });

  test("also enables team profile triggers in the world cup standings page", () => {
    expect(appSource).toContain('<TeamName name={team.team} logo={team.logo} interactiveProfile />');
  });
});
