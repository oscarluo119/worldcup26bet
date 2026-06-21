import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test, vi } from "vitest";
import { reportPredictionSubmissionDiagnostic } from "../lib/predictionDiagnostics";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");
const edgeFunctionSource = readFileSync(resolve(process.cwd(), "supabase/functions/report-prediction-submit-diagnostic/index.ts"), "utf8");

describe("prediction diagnostics reporting", () => {
  test("reports structured failure payloads through a Supabase edge function", async () => {
    const invoke = vi.fn().mockResolvedValue({ data: { ok: true }, error: null });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await reportPredictionSubmissionDiagnostic({
      invoke: (payload) => invoke("report-prediction-submit-diagnostic", payload),
      diagnostics: {
        matchId: "match-1",
        currentPlayerId: "user-1",
        sessionUserId: "user-1",
        existed: false,
        isLocked: false,
      },
      error: {
        code: "session_missing",
        message: "session_missing",
        category: "auth",
      },
    });

    expect(invoke).toHaveBeenCalledWith("report-prediction-submit-diagnostic", {
      body: {
        diagnostics: {
          matchId: "match-1",
          currentPlayerId: "user-1",
          sessionUserId: "user-1",
          existed: false,
          isLocked: false,
        },
        error: {
          code: "session_missing",
          message: "session_missing",
          category: "auth",
        },
      },
    });
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  test("swallows reporting failures after logging them locally", async () => {
    const invoke = vi.fn().mockResolvedValue({ data: null, error: { message: "invoke_failed", code: "500" } });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await reportPredictionSubmissionDiagnostic({
      invoke: (payload) => invoke("report-prediction-submit-diagnostic", payload),
      diagnostics: {
        matchId: "match-2",
        currentPlayerId: "user-2",
        sessionUserId: "user-2",
        existed: true,
        isLocked: true,
      },
      error: {
        code: "prediction_locked",
        message: "prediction_locked",
        category: "validation",
      },
    });

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  test("wires App and edge function source for prediction failure diagnostics", () => {
    expect(appSource).toContain('reportPredictionSubmissionDiagnostic({');
    expect(appSource).toContain('supabase.functions.invoke("report-prediction-submit-diagnostic"');
    expect(edgeFunctionSource).toContain("Prediction submission diagnostic");
    expect(edgeFunctionSource).toContain('req.method === "OPTIONS"');
  });
});
