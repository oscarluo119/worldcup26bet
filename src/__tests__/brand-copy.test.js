import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");

describe("homepage brand copy", () => {
  test("renders the updated homepage brand and sponsor copy", () => {
    expect(appSource).toContain("来来来聪明的小孩");
    expect(appSource).toContain("world cup 2026");
    expect(appSource).toContain("本次竞猜由月半洛夫维奇独家赞助。");
  });

  test("uses the shared world cup trophy image for brand badges", () => {
    expect(appSource).toContain("import brandTrophyImage from \"./assets/brand-trophy.png\"");
    expect(appSource).toContain("src={brandTrophyImage}");
    expect(appSource).not.toContain("<Trophy className=\"h-7 w-7\" />");
    expect(appSource).not.toContain("<Trophy className=\"h-7 w-7 sm:h-8 sm:w-8\" />");
  });

  test("removes the previous homepage brand and intro copy", () => {
    expect(appSource).not.toContain("世界杯竞猜局");
    expect(appSource).not.toContain("World Cup Prediction Club");
    expect(appSource).not.toContain("和朋友一起预测每一场胜负与比分，在 2026 美加墨世界杯里看看谁才是真正最懂球的人。");
  });
});
