function isMatchLocked(match, now = new Date()) {
  return Boolean(match.status !== "open" || new Date(match.kickoff).getTime() <= new Date(now).getTime());
}

function createSubmissionError(code, message, category = "validation", cause = null) {
  return {
    code,
    message,
    category,
    cause,
  };
}

function logFailure(logger, label, payload) {
  if (typeof logger === "function") {
    logger(label, payload);
  }
}

export async function savePredictionWithRecovery({
  supabase,
  match,
  currentPlayerId,
  sessionUser,
  home,
  away,
  now = new Date(),
  existed = false,
  ensureProfile,
  logger,
  submittedAt = new Date().toISOString(),
}) {
  const diagnostics = {
    matchId: match?.id || "",
    currentPlayerId: currentPlayerId || "",
    sessionUserId: sessionUser?.id || "",
    existed,
    isLocked: match ? isMatchLocked(match, now) : false,
  };

  if (!sessionUser?.id || !currentPlayerId || currentPlayerId !== sessionUser.id) {
    const error = createSubmissionError("session_missing", "session_missing", "auth");
    logFailure(logger, "Prediction submission blocked", { ...diagnostics, error });
    return { ok: false, error, diagnostics };
  }

  if (!match || diagnostics.isLocked) {
    const error = createSubmissionError("prediction_locked", "prediction_locked");
    logFailure(logger, "Prediction submission blocked", { ...diagnostics, error });
    return { ok: false, error, diagnostics };
  }

  if (!Number.isFinite(home) || !Number.isFinite(away)) {
    const error = createSubmissionError("invalid_prediction_input", "invalid_prediction_input");
    logFailure(logger, "Prediction submission blocked", { ...diagnostics, error });
    return { ok: false, error, diagnostics };
  }

  try {
    await ensureProfile?.(sessionUser);
  } catch (cause) {
    const error = createSubmissionError("profile_not_ready", "profile_not_ready", "data", cause);
    logFailure(logger, "Prediction profile bootstrap failed", {
      ...diagnostics,
      error: {
        code: error.code,
        message: error.message,
        causeCode: cause?.code || "",
        causeMessage: cause?.message || "",
        causeDetails: cause?.details || "",
      },
    });
    return { ok: false, error, diagnostics };
  }

  const safeHome = Math.max(0, Math.floor(home));
  const safeAway = Math.max(0, Math.floor(away));
  const { data, error } = await supabase
    .from("predictions")
    .upsert({
      user_id: currentPlayerId,
      match_id: match.id,
      home: safeHome,
      away: safeAway,
      submitted_at: submittedAt,
    }, { onConflict: "user_id,match_id" })
    .select()
    .single();

  if (error) {
    logFailure(logger, "Prediction submission failed", {
      ...diagnostics,
      error: {
        code: error.code || "",
        message: error.message || "",
        details: error.details || "",
      },
    });
    return { ok: false, error, diagnostics };
  }

  return {
    ok: true,
    existed,
    saved: data,
  };
}
