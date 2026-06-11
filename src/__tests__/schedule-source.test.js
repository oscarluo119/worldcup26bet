import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");

describe("schedule source bootstrap", () => {
  test("boots from the local schedule instead of WorldCupAPI", () => {
    expect(appSource).toContain('const [scheduleSource, setScheduleSource] = useState("local")');
    expect(appSource).toContain('setScheduleSource("local")');
    expect(appSource).not.toContain("fetchWorldCupFixtures()");
    expect(appSource).not.toContain('setScheduleSource("worldcupapi")');
  });

  test("shows the local schedule source label in the full schedule page", () => {
    expect(appSource).toContain("本地权威赛程");
    expect(appSource).not.toContain("WorldCupAPI 实时赛程");
  });
});
