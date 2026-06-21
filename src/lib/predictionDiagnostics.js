export async function reportPredictionSubmissionDiagnostic({
  invoke,
  diagnostics,
  error,
}) {
  if (typeof invoke !== "function") return;

  try {
    const result = await invoke({
      body: {
        diagnostics,
        error: {
          code: error?.code || "unknown_error",
          message: error?.message || "unknown_error",
          category: error?.category || "unknown",
        },
      },
    });

    if (result?.error) {
      console.error("Prediction diagnostic reporting failed", {
        diagnostics,
        error,
        invokeError: {
          code: result.error.code || "",
          message: result.error.message || "",
        },
      });
    }
  } catch (invokeError) {
    console.error("Prediction diagnostic reporting failed", {
      diagnostics,
      error,
      invokeError: {
        message: invokeError instanceof Error ? invokeError.message : String(invokeError || ""),
      },
    });
  }
}
