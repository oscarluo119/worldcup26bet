import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");
const bootstrapLoadSource = readFileSync(resolve(process.cwd(), "src/lib/supabaseBootstrapLoad.js"), "utf8");

describe("schedule source bootstrap", () => {
  test("boots from the local schedule instead of WorldCupAPI", () => {
    expect(appSource).toContain('const [scheduleSource, setScheduleSource] = useState("local")');
    expect(appSource).toContain('setScheduleSource("local")');
    expect(appSource).not.toContain("fetchWorldCupFixtures()");
    expect(appSource).not.toContain('setScheduleSource("worldcupapi")');
  });

  test("keeps the schedule page collapsed by default without auto-falling back to the first match", () => {
    expect(appSource).toContain('const [selectedMatchId, setSelectedMatchId] = useState("")');
    expect(appSource).toContain('if (!prev) return prev;');
    expect(appSource).toContain('return scheduleVisibleMatches.some((match) => match.id === prev) ? prev : "";');
    expect(appSource).not.toContain('return scheduleVisibleMatches.some((match) => match.id === prev) ? prev : scheduleVisibleMatches[0].id;');
  });

  test("keeps only the most recent past match day on the schedule page", () => {
    expect(appSource).toContain("const scheduleVisibleMatches = useMemo(() => filterVisibleScheduleMatches(filteredMatches, currentTime, 1), [filteredMatches, currentTime]);");
    expect(appSource).not.toContain("const scheduleVisibleMatches = useMemo(() => filterVisibleScheduleMatches(filteredMatches, currentTime, 2), [filteredMatches, currentTime]);");
  });

  test("loads predictions through paginated Supabase reads instead of a single 1000-row page", () => {
    expect(appSource).toContain('loadBootstrapCollections({');
    expect(bootstrapLoadSource).toContain('fetchAllRows({');
    expect(bootstrapLoadSource).toContain('table: "predictions"');
    expect(bootstrapLoadSource).not.toContain('supabase.from("predictions").select("*").order("submitted_at", { ascending: true })');
  });

  test("shows the local schedule source label in the full schedule page", () => {
    expect(appSource).toContain("本地权威赛程");
    expect(appSource).not.toContain("WorldCupAPI 实时赛程");
  });
});
