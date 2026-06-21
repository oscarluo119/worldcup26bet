type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Json, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({ code: "session_required", message: "session_required" }, 401);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const diagnostics = body?.diagnostics || {};
    const error = body?.error || {};

    console.error("Prediction submission diagnostic", {
      authHeaderPresent: Boolean(authHeader),
      diagnostics: {
        matchId: String(diagnostics?.matchId || ""),
        currentPlayerId: String(diagnostics?.currentPlayerId || ""),
        sessionUserId: String(diagnostics?.sessionUserId || ""),
        existed: Boolean(diagnostics?.existed),
        isLocked: Boolean(diagnostics?.isLocked),
      },
      error: {
        code: String(error?.code || ""),
        message: String(error?.message || ""),
        category: String(error?.category || ""),
      },
      reportedAt: new Date().toISOString(),
    });

    return jsonResponse({ ok: true }, 200);
  } catch (error) {
    return jsonResponse({
      code: "unknown_error",
      message: error instanceof Error ? error.message : "unknown_error",
    }, 500);
  }
});
