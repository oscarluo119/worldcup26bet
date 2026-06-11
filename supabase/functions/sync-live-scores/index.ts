import { createClient } from "npm:@supabase/supabase-js@2";
import {
  FIFA_MATCHES_URL,
  FIFA_REQUEST_HEADERS,
  FIFA_WORLD_CUP_2026_SEASON_ID,
  normalizeFifaMatch,
  shouldSettleFifaResult,
} from "../../../src/lib/fifaSync.js";

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type MappingRow = {
  match_id: string;
  match_no: number;
  provider_match_id: string | null;
  mapping_status: "matched" | "needs_review";
};

type LiveStateRow = {
  match_id: string;
  fixture_id: string | null;
  tracking_until: string | null;
  regulation_final_available: boolean | null;
  last_synced_at: string | null;
};

type OverrideRow = {
  match_id: string;
  status: "open" | "closed" | "settled";
  home_score: number | null;
  away_score: number | null;
  updated_at: string | null;
};

class FifaProviderError extends Error {
  status: number | null;
  errorType: string;

  constructor(message: string, options: { status?: number | null; errorType: string }) {
    super(message);
    this.name = "FifaProviderError";
    this.status = options.status ?? null;
    this.errorType = options.errorType;
  }
}

const REGULATION_BUFFER_MINUTES = 10;
const PREMATCH_WINDOW_MINUTES = 10;
const FALLBACK_TRACKING_HOURS = 4;

function jsonResponse(body: Json, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function extractProviderErrorDetail(response: Response) {
  try {
    const rawText = await response.text();
    if (!rawText) return "";

    try {
      const parsed = JSON.parse(rawText) as Record<string, unknown>;
      const detail = parsed.error ?? parsed.message ?? parsed.code ?? rawText;
      return String(detail).trim().slice(0, 200);
    } catch {
      return rawText.trim().slice(0, 200);
    }
  } catch {
    return "";
  }
}

async function buildProviderError(response: Response) {
  const detail = await extractProviderErrorDetail(response);
  const status = response.status;
  const errorType = status >= 500 ? "provider_upstream_error" : "provider_http_error";
  const baseMessage = `FIFA matches request failed (${status})`;

  return new FifaProviderError(
    detail ? `${baseMessage}: ${detail}` : baseMessage,
    { status, errorType },
  );
}

function normalizeProviderError(error: unknown) {
  if (error instanceof FifaProviderError) return error;
  if (error instanceof TypeError) {
    return new FifaProviderError("FIFA matches network request failed", {
      status: null,
      errorType: "provider_network_error",
    });
  }
  if (error instanceof Error) {
    return new FifaProviderError(error.message, {
      status: null,
      errorType: "provider_unknown_error",
    });
  }
  return new FifaProviderError("FIFA matches request failed", {
    status: null,
    errorType: "provider_unknown_error",
  });
}

async function fetchFifaMatches() {
  try {
    const response = await fetch(
      `${FIFA_MATCHES_URL}?count=200&idSeason=${FIFA_WORLD_CUP_2026_SEASON_ID}`,
      { headers: FIFA_REQUEST_HEADERS },
    );
    if (!response.ok) throw await buildProviderError(response);

    const payload = await response.json();
    const results = Array.isArray(payload?.Results) ? payload.Results : [];
    if (!results.length) {
      throw new FifaProviderError("FIFA matches returned empty data", {
        status: response.status,
        errorType: "provider_empty_data",
      });
    }

    return {
      status: response.status,
      matches: results.map(normalizeFifaMatch),
    };
  } catch (error) {
    throw normalizeProviderError(error);
  }
}

function shouldTrackKickoff(kickoff: string, liveRow: LiveStateRow | undefined, now: Date) {
  if (liveRow?.tracking_until && new Date(liveRow.tracking_until).getTime() > now.getTime()) return true;

  const kickoffTime = new Date(kickoff).getTime();
  const startWindow = kickoffTime - PREMATCH_WINDOW_MINUTES * 60_000;
  const fallbackEnd = kickoffTime + FALLBACK_TRACKING_HOURS * 60 * 60_000;
  const nowTime = now.getTime();
  return nowTime >= startWindow && nowTime <= fallbackEnd;
}

function hasManualSettledOverride(liveRow: LiveStateRow | undefined, overrideRow: OverrideRow | undefined) {
  if (!overrideRow || overrideRow.status !== "settled") return false;
  if (overrideRow.home_score === null || overrideRow.away_score === null) return false;
  if (!overrideRow.updated_at) return false;
  if (!liveRow?.last_synced_at) return true;
  return new Date(overrideRow.updated_at).getTime() > new Date(liveRow.last_synced_at).getTime();
}

Deno.serve(async (req) => {
  const liveSyncSecret = Deno.env.get("LIVE_SYNC_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization") || "";

  if (!liveSyncSecret || !supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Missing LIVE_SYNC_SECRET, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY" }, 500);
  }

  if (authHeader !== `Bearer ${liveSyncSecret}`) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const [fifaResult, mappingResult, liveStateResult, overrideResult] = await Promise.all([
      fetchFifaMatches(),
      supabase
        .from("match_provider_mappings")
        .select("match_id, match_no, provider_match_id, mapping_status")
        .eq("provider", "fifa"),
      supabase.from("live_match_states").select("match_id, fixture_id, tracking_until, regulation_final_available, last_synced_at"),
      supabase.from("match_overrides").select("match_id, status, home_score, away_score, updated_at"),
    ]);

    if (mappingResult.error) throw mappingResult.error;
    if (liveStateResult.error) throw liveStateResult.error;
    if (overrideResult.error) throw overrideResult.error;

    const allMappings = (mappingResult.data || []) as MappingRow[];
    const matchedMappings = allMappings.filter((row) => row.mapping_status === "matched" && row.provider_match_id);
    if (!matchedMappings.length) {
      return jsonResponse({
        ok: false,
        provider: "fifa",
        errorType: "mapping_missing",
        error: "No matched FIFA mappings found. Run the FIFA mapping bootstrap first.",
        syncedAt: new Date().toISOString(),
      }, 500);
    }

    const fifaByMatchId = new Map(fifaResult.matches.map((match) => [match.providerMatchId, match]));
    const existingLiveRows = new Map((liveStateResult.data || []).map((row) => [row.match_id, row as LiveStateRow]));
    const existingOverrides = new Map((overrideResult.data || []).map((row) => [row.match_id, row as OverrideRow]));
    const now = new Date();

    let trackedCount = 0;
    let refreshedCount = 0;
    let regulationSettledCount = 0;
    let regulationCorrectedCount = 0;
    let unmappedProviderMatches = 0;
    let manualProtectedCount = 0;

    for (const mapping of matchedMappings) {
      const fifaMatch = fifaByMatchId.get(String(mapping.provider_match_id));
      if (!fifaMatch) {
        unmappedProviderMatches += 1;
        continue;
      }

      const liveRow = existingLiveRows.get(mapping.match_id);
      const overrideRow = existingOverrides.get(mapping.match_id);
      if (!shouldTrackKickoff(fifaMatch.kickoff, liveRow, now)) continue;

      trackedCount += 1;
      const previousRegulationFinal = Boolean(liveRow?.regulation_final_available);
      const hasRegulationFinal = shouldSettleFifaResult(fifaMatch);
      const hasStarted = now.getTime() >= new Date(fifaMatch.kickoff).getTime();
      const manualProtected = hasManualSettledOverride(liveRow, overrideRow);
      const trackingUntil = new Date(
        now.getTime() + (fifaMatch.phase === "finished" ? REGULATION_BUFFER_MINUTES : 20) * 60_000,
      ).toISOString();

      const liveStatePayload = {
        match_id: mapping.match_id,
        fixture_id: fifaMatch.providerMatchId,
        display_home_score: fifaMatch.homeScore,
        display_away_score: fifaMatch.awayScore,
        match_phase: fifaMatch.phase,
        match_clock: fifaMatch.matchTime || null,
        reg_home_score: hasRegulationFinal ? fifaMatch.homeScore : null,
        reg_away_score: hasRegulationFinal ? fifaMatch.awayScore : null,
        regulation_final_available: hasRegulationFinal,
        last_synced_at: now.toISOString(),
        tracking_until: trackingUntil,
        updated_at: now.toISOString(),
      };

      const { error: liveUpsertError } = await supabase
        .from("live_match_states")
        .upsert(liveStatePayload, { onConflict: "match_id" });
      if (liveUpsertError) throw liveUpsertError;
      refreshedCount += 1;

      if (!hasRegulationFinal) {
        if (hasStarted && !manualProtected && !["cancelled", "postponed", "abandoned"].includes(fifaMatch.phase)) {
          const { error: pendingOverrideError } = await supabase.from("match_overrides").upsert({
            match_id: mapping.match_id,
            status: "closed",
            home_score: null,
            away_score: null,
            updated_at: now.toISOString(),
          }, { onConflict: "match_id" });
          if (pendingOverrideError) throw pendingOverrideError;
        }
        continue;
      }

      if (manualProtected) {
        manualProtectedCount += 1;
        continue;
      }

      if (previousRegulationFinal) regulationCorrectedCount += 1;
      else regulationSettledCount += 1;

      const { error: resultUpsertError } = await supabase.from("world_cup_results").upsert({
        match_no: mapping.match_no,
        home_score: fifaMatch.homeScore,
        away_score: fifaMatch.awayScore,
        updated_at: now.toISOString(),
      }, { onConflict: "match_no" });
      if (resultUpsertError) throw resultUpsertError;

      const { error: overrideUpsertError } = await supabase.from("match_overrides").upsert({
        match_id: mapping.match_id,
        status: "settled",
        home_score: fifaMatch.homeScore,
        away_score: fifaMatch.awayScore,
        updated_at: now.toISOString(),
      }, { onConflict: "match_id" });
      if (overrideUpsertError) throw overrideUpsertError;
    }

    return jsonResponse({
      ok: true,
      provider: "fifa",
      providerStatus: {
        matches: fifaResult.status,
      },
      fifaMatchCount: fifaResult.matches.length,
      mappingCount: allMappings.length,
      matchedMappingCount: matchedMappings.length,
      unmappedProviderMatches,
      trackedCount,
      refreshedCount,
      regulationSettledCount,
      regulationCorrectedCount,
      manualProtectedCount,
      syncedAt: now.toISOString(),
    });
  } catch (error) {
    if (error instanceof FifaProviderError) {
      return jsonResponse({
        ok: false,
        provider: "fifa",
        errorType: error.errorType,
        statusCode: error.status,
        error: error.message,
        syncedAt: new Date().toISOString(),
      }, 502);
    }

    return jsonResponse({
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected sync-live-scores failure",
      errorType: "internal_error",
      syncedAt: new Date().toISOString(),
    }, 500);
  }
});
