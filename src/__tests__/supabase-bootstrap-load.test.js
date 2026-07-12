import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test, vi } from "vitest";
import { loadBootstrapCollections } from "../lib/supabaseBootstrapLoad";

const bootstrapLoadSource = readFileSync(resolve(process.cwd(), "src/lib/supabaseBootstrapLoad.js"), "utf8");

function createSupabaseStub(responsesByTable) {
  const attemptsByTable = {};

  const from = vi.fn((table) => {
    const nextResult = () => {
      const attempt = attemptsByTable[table] || 0;
      attemptsByTable[table] = attempt + 1;
      return Promise.resolve(responsesByTable[table]?.[attempt] || { data: [], error: null });
    };

    const builder = {
      select: vi.fn(() => builder),
      order: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      maybeSingle: vi.fn(() => builder),
      then: (onFulfilled, onRejected) => nextResult().then(onFulfilled, onRejected),
      catch: (onRejected) => nextResult().catch(onRejected),
      finally: (onFinally) => nextResult().finally(onFinally),
    };

    return builder;
  });

  return {
    client: { from },
    attemptsByTable,
  };
}

function createSuccessfulResponses() {
  return {
    profiles: [{ data: [{ id: "user-1" }], error: null }],
    fun_predictions: [{ data: [], error: null }],
    champion_road_predictions: [{ data: [], error: null }],
    champion_road_prediction_items: [{ data: [], error: null }],
    sponsor_predictions: [{ data: [], error: null }],
    match_overrides: [{ data: [], error: null }],
    live_match_states: [{ data: [], error: null }],
    world_cup_results: [{ data: [], error: null }],
    fun_results: [{ data: null, error: null }],
    sponsor_prediction_results: [{ data: [], error: null }],
  };
}

describe("loadBootstrapCollections", () => {
  test("retries retryable required queries before succeeding", async () => {
    const responses = createSuccessfulResponses();
    responses.profiles = [
      { data: null, error: { code: "503", message: "connection timeout" } },
      { data: [{ id: "user-1" }], error: null },
    ];
    const supabase = createSupabaseStub(responses);
    const fetchAllRows = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { code: "503", message: "upstream connect error" } })
      .mockResolvedValueOnce({ data: [{ id: "prediction-1" }], error: null });

    const result = await loadBootstrapCollections({
      supabase: supabase.client,
      fetchAllRows,
      timeoutMs: 100,
      retryDelayMs: 0,
      maxAttempts: 2,
    });

    expect(supabase.attemptsByTable.profiles).toBe(2);
    expect(fetchAllRows).toHaveBeenCalledTimes(2);
    expect(result.warnings).toEqual([]);
    expect(result.data.profiles).toEqual([{ id: "user-1" }]);
    expect(result.data.predictions).toEqual([{ id: "prediction-1" }]);
  });

  test("returns fallback data and a warning when an optional table keeps failing", async () => {
    const responses = createSuccessfulResponses();
    responses.champion_road_predictions = [
      { data: null, error: { code: "503", message: "connection timeout" } },
      { data: null, error: { code: "503", message: "connection timeout" } },
    ];
    const supabase = createSupabaseStub(responses);
    const fetchAllRows = vi.fn().mockResolvedValue({ data: [{ id: "prediction-1" }], error: null });

    const result = await loadBootstrapCollections({
      supabase: supabase.client,
      fetchAllRows,
      timeoutMs: 100,
      retryDelayMs: 0,
      maxAttempts: 2,
    });

    expect(result.data.championRoadPredictions).toEqual([]);
    expect(result.warnings).toEqual([
      expect.objectContaining({
        key: "championRoadPredictions",
        table: "champion_road_predictions",
      }),
    ]);
  });

  test("throws when a required table still fails after all retries", async () => {
    const responses = createSuccessfulResponses();
    responses.profiles = [
      { data: null, error: { code: "503", message: "connection timeout" } },
      { data: null, error: { code: "503", message: "connection timeout" } },
    ];
    const supabase = createSupabaseStub(responses);
    const fetchAllRows = vi.fn().mockResolvedValue({ data: [{ id: "prediction-1" }], error: null });

    await expect(loadBootstrapCollections({
      supabase: supabase.client,
      fetchAllRows,
      timeoutMs: 100,
      retryDelayMs: 0,
      maxAttempts: 2,
    })).rejects.toMatchObject({
      code: "503",
      message: "connection timeout",
    });
  });

  test("loads optional collections without Promise.all fan-out", () => {
    expect(bootstrapLoadSource).toContain("for (const descriptor of OPTIONAL_COLLECTIONS)");
    expect(bootstrapLoadSource).not.toContain("Promise.all(OPTIONAL_COLLECTIONS");
  });
});
