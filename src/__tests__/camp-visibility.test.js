import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");

describe("camp UI visibility", () => {
  test("does not expose the camp battle tab", () => {
    expect(appSource).not.toContain('{ id: "campBattle"');
  });

  test("does not mount the camp battle panel", () => {
    expect(appSource).not.toContain('activeTab === "campBattle"');
  });

  test("does not render the player profile camp contribution card", () => {
    expect(appSource).not.toContain("阵营贡献");
  });

  test("does not render the admin camp assignment card", () => {
    expect(appSource).not.toContain("<AdminCampAssignmentCard");
  });
});
