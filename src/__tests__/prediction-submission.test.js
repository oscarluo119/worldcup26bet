import { describe, expect, test, vi } from "vitest";
import { savePredictionWithRecovery } from "../lib/predictionSubmission";

function createSupabaseStub({ upsertResult }) {
  const single = vi.fn().mockResolvedValue(upsertResult);
  const select = vi.fn(() => ({ single }));
  const upsert = vi.fn(() => ({ select }));
  const from = vi.fn(() => ({ upsert }));

  return {
    client: { from },
    from,
    upsert,
  };
}

describe("savePredictionWithRecovery", () => {
  test("ensures the profile exists before saving a first prediction", async () => {
    const ensureProfile = vi.fn().mockResolvedValue(undefined);
    const logger = vi.fn();
    const upsertResult = {
      data: {
        id: "prediction-1",
        user_id: "user-1",
        match_id: "match-1",
        home: 2,
        away: 1,
        submitted_at: "2026-06-21T10:00:00.000Z",
      },
      error: null,
    };
    const supabase = createSupabaseStub({ upsertResult });

    const result = await savePredictionWithRecovery({
      supabase: supabase.client,
      match: { id: "match-1", kickoff: "2026-06-22T10:00:00.000Z", status: "open" },
      currentPlayerId: "user-1",
      sessionUser: { id: "user-1" },
      home: 2,
      away: 1,
      now: new Date("2026-06-21T09:00:00.000Z"),
      ensureProfile,
      existed: false,
      logger,
    });

    expect(ensureProfile).toHaveBeenCalledWith({ id: "user-1" });
    expect(supabase.from).toHaveBeenCalledWith("predictions");
    expect(result).toMatchObject({
      ok: true,
      existed: false,
      saved: upsertResult.data,
    });
    expect(logger).not.toHaveBeenCalled();
  });

  test("surfaces a profile initialization error when ensureProfile fails", async () => {
    const ensureProfile = vi.fn().mockRejectedValue({ code: "42501", message: "row-level security" });
    const logger = vi.fn();
    const supabase = createSupabaseStub({ upsertResult: { data: null, error: null } });

    const result = await savePredictionWithRecovery({
      supabase: supabase.client,
      match: { id: "match-1", kickoff: "2026-06-22T10:00:00.000Z", status: "open" },
      currentPlayerId: "user-1",
      sessionUser: { id: "user-1" },
      home: 1,
      away: 0,
      now: new Date("2026-06-21T09:00:00.000Z"),
      ensureProfile,
      existed: false,
      logger,
    });

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "profile_not_ready",
      },
      diagnostics: {
        matchId: "match-1",
        currentPlayerId: "user-1",
        sessionUserId: "user-1",
        existed: false,
      },
    });
    expect(supabase.upsert).not.toHaveBeenCalled();
    expect(logger).toHaveBeenCalled();
  });

  test("returns a locked error instead of silently bailing out", async () => {
    const result = await savePredictionWithRecovery({
      supabase: { from: vi.fn() },
      match: { id: "match-1", kickoff: "2026-06-21T09:00:00.000Z", status: "open" },
      currentPlayerId: "user-1",
      sessionUser: { id: "user-1" },
      home: 1,
      away: 1,
      now: new Date("2026-06-21T09:00:00.000Z"),
      ensureProfile: vi.fn(),
      existed: true,
      logger: vi.fn(),
    });

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "prediction_locked",
      },
      diagnostics: {
        matchId: "match-1",
      },
    });
  });

  test("returns an invalid-input error instead of silently bailing out", async () => {
    const result = await savePredictionWithRecovery({
      supabase: { from: vi.fn() },
      match: { id: "match-1", kickoff: "2026-06-22T09:00:00.000Z", status: "open" },
      currentPlayerId: "user-1",
      sessionUser: { id: "user-1" },
      home: Number.NaN,
      away: 1,
      now: new Date("2026-06-21T09:00:00.000Z"),
      ensureProfile: vi.fn(),
      existed: false,
      logger: vi.fn(),
    });

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "invalid_prediction_input",
      },
      diagnostics: {
        currentPlayerId: "user-1",
      },
    });
  });
});
