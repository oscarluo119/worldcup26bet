import { createClient } from "npm:@supabase/supabase-js@2";

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type NormalizedFixture = {
  fixtureId: string;
  matchId: string;
  resultId: number;
  kickoff: string;
};

type LiveStateRow = {
  match_id: string;
  fixture_id: string | null;
  tracking_until: string | null;
  regulation_final_available: boolean | null;
};

const WORLDCUP_FIXTURES_URL = "https://api.worldcupapi.com/fixtures";
const WORLDCUP_LIVE_SCORES_URL = "https://api.worldcupapi.com/livescores";
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

function parseNumericScore(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function parseScorePair(value: unknown): { home: number | null; away: number | null } {
  if (!value) return { home: null, away: null };

  if (Array.isArray(value) && value.length >= 2) {
    return {
      home: parseNumericScore(value[0]),
      away: parseNumericScore(value[1]),
    };
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return {
      home: parseNumericScore(record.home ?? record.home_score ?? record.localteam_score ?? record.h),
      away: parseNumericScore(record.away ?? record.away_score ?? record.visitorteam_score ?? record.a),
    };
  }

  if (typeof value === "string") {
    const match = value.match(/(\d+)\s*[-:]\s*(\d+)/);
    if (match) {
      return {
        home: Number(match[1]),
        away: Number(match[2]),
      };
    }
  }

  return { home: null, away: null };
}

function getNestedScore(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (key in source) return parseScorePair(source[key]);
  }
  return { home: null, away: null };
}

function parseFullTimeScore(liveItem: Record<string, unknown>) {
  const scores = (liveItem.scores as Record<string, unknown>) || {};
  const outcomes = (liveItem.outcomes as Record<string, unknown>) || {};

  const direct = getNestedScore(scores, ["ft_score", "full_time", "fulltime", "full_time_score"]);
  if (direct.home !== null && direct.away !== null) return direct;

  const outcome = getNestedScore(outcomes, ["full_time", "fulltime", "regulation", "regular_time"]);
  if (outcome.home !== null && outcome.away !== null) return outcome;

  return { home: null, away: null };
}

function normalizePhase(status: unknown, time: unknown, hasRegulationFinal: boolean) {
  const statusText = String(status || "").trim().toUpperCase();
  const timeText = String(time || "").trim();

  if (!statusText && !timeText) return "pre_match";
  if (statusText.includes("PEN")) return "penalties";
  if (statusText.includes("AET") || statusText.includes("ET")) return "extra_time";
  if (statusText.includes("HT") || timeText.toUpperCase() === "HT") return "half_time";
  if (statusText.includes("FT") || statusText.includes("FIN")) {
    return hasRegulationFinal ? "finished" : "full_time_break";
  }
  if (statusText.includes("LIVE") || statusText.includes("IN_PLAY")) {
    if (timeText.includes("90") || timeText.includes("45+") || timeText.includes("90+")) return "second_half";
    return "first_half";
  }
  if (/^\d+\+?\d*'?$/u.test(timeText) || /^\d+$/u.test(timeText)) {
    return Number.parseInt(timeText, 10) >= 46 ? "second_half" : "first_half";
  }
  if (statusText.includes("NS") || statusText.includes("NOT")) return "pre_match";
  return hasRegulationFinal ? "finished" : "pre_match";
}

function toUtcIso(dateText: string, timeText: string) {
  const [year, month, day] = String(dateText).split("-").map(Number);
  const [hour, minute, second = 0] = String(timeText || "00:00:00").split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second)).toISOString();
}

async function fetchAllFixtures(apiKey: string): Promise<NormalizedFixture[]> {
  const fixtures: Record<string, unknown>[] = [];

  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch(`${WORLDCUP_FIXTURES_URL}?key=${encodeURIComponent(apiKey)}&page=${page}`);
    if (!response.ok) throw new Error(`Fixtures request failed: ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload) || payload.length === 0) break;
    fixtures.push(...payload);
  }

  return fixtures.map((fixture) => ({
    fixtureId: String(fixture.id),
    matchId: String(fixture.id),
    resultId: Number(fixture.id),
    kickoff: toUtcIso(String(fixture.date), String(fixture.time || "00:00:00")),
  }));
}

function shouldTrackFixture(fixture: NormalizedFixture, liveRow: LiveStateRow | undefined, now: Date) {
  if (liveRow?.tracking_until && new Date(liveRow.tracking_until).getTime() > now.getTime()) return true;

  const kickoff = new Date(fixture.kickoff).getTime();
  const startWindow = kickoff - PREMATCH_WINDOW_MINUTES * 60_000;
  const fallbackEnd = kickoff + FALLBACK_TRACKING_HOURS * 60 * 60_000;
  const nowTime = now.getTime();
  return nowTime >= startWindow && nowTime <= fallbackEnd;
}

Deno.serve(async (req) => {
  const liveSyncSecret = Deno.env.get("LIVE_SYNC_SECRET");
  const worldCupApiKey = Deno.env.get("WORLDCUP_API_KEY") || Deno.env.get("VITE_WORLDCUP_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization") || "";

  if (!liveSyncSecret || !worldCupApiKey || !supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Missing LIVE_SYNC_SECRET, WORLDCUP_API_KEY, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY" }, 500);
  }

  if (authHeader !== `Bearer ${liveSyncSecret}`) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const [fixtures, liveResponse, liveStateResult] = await Promise.all([
      fetchAllFixtures(worldCupApiKey),
      fetch(`${WORLDCUP_LIVE_SCORES_URL}?key=${encodeURIComponent(worldCupApiKey)}`),
      supabase.from("live_match_states").select("match_id, fixture_id, tracking_until, regulation_final_available"),
    ]);

    if (!liveResponse.ok) throw new Error(`Live scores request failed: ${liveResponse.status}`);
    if (liveStateResult.error) throw liveStateResult.error;

    const livePayload = await liveResponse.json();
    const liveItems = Array.isArray(livePayload) ? livePayload : [];
    const liveByFixtureId = new Map(liveItems.map((item) => [String((item as Record<string, unknown>).fixture_id ?? (item as Record<string, unknown>).id), item as Record<string, unknown>]));
    const existingLiveRows = new Map((liveStateResult.data || []).map((row) => [row.match_id, row as LiveStateRow]));
    const now = new Date();

    let trackedCount = 0;
    let refreshedCount = 0;
    let regulationSettledCount = 0;
    let regulationCorrectedCount = 0;

    for (const fixture of fixtures) {
      const liveRow = existingLiveRows.get(fixture.matchId);
      if (!shouldTrackFixture(fixture, liveRow, now)) continue;

      trackedCount += 1;
      const liveItem = liveByFixtureId.get(fixture.fixtureId);
      const kickoffTime = new Date(fixture.kickoff).getTime();
      const hasStarted = now.getTime() >= kickoffTime;
      const scores = liveItem ? parseScorePair((liveItem.scores as Record<string, unknown>)?.score ?? (liveItem.scores as Record<string, unknown>)?.current) : { home: null, away: null };
      const fullTime = liveItem ? parseFullTimeScore(liveItem) : { home: null, away: null };
      const hasRegulationFinal = fullTime.home !== null && fullTime.away !== null;
      const previousRegulationFinal = Boolean(liveRow?.regulation_final_available);
      const phase = normalizePhase(liveItem?.status, liveItem?.time, hasRegulationFinal);
      const trackingUntil = new Date(
        now.getTime() + (phase === "finished" ? REGULATION_BUFFER_MINUTES : 20) * 60_000,
      ).toISOString();

      const liveStatePayload = {
        match_id: fixture.matchId,
        fixture_id: fixture.fixtureId,
        display_home_score: scores.home,
        display_away_score: scores.away,
        match_phase: phase,
        match_clock: liveItem?.time ? String(liveItem.time) : null,
        reg_home_score: fullTime.home,
        reg_away_score: fullTime.away,
        regulation_final_available: hasRegulationFinal,
        last_synced_at: now.toISOString(),
        tracking_until: trackingUntil,
        updated_at: now.toISOString(),
      };

      const { error: liveUpsertError } = await supabase.from("live_match_states").upsert(liveStatePayload, { onConflict: "match_id" });
      if (liveUpsertError) throw liveUpsertError;
      refreshedCount += 1;

      if (!hasRegulationFinal) {
        if (hasStarted) {
          await supabase.from("match_overrides").upsert({
            match_id: fixture.matchId,
            status: "closed",
            home_score: null,
            away_score: null,
            updated_at: now.toISOString(),
          }, { onConflict: "match_id" });
        }
        if (!previousRegulationFinal) {
          await supabase.from("world_cup_results").delete().eq("match_no", fixture.resultId);
        }
        continue;
      }

      if (previousRegulationFinal) regulationCorrectedCount += 1;
      else regulationSettledCount += 1;

      const { error: resultUpsertError } = await supabase.from("world_cup_results").upsert({
        match_no: fixture.resultId,
        home_score: fullTime.home,
        away_score: fullTime.away,
        updated_at: now.toISOString(),
      }, { onConflict: "match_no" });
      if (resultUpsertError) throw resultUpsertError;

      const { error: overrideUpsertError } = await supabase.from("match_overrides").upsert({
        match_id: fixture.matchId,
        status: "settled",
        home_score: fullTime.home,
        away_score: fullTime.away,
        updated_at: now.toISOString(),
      }, { onConflict: "match_id" });
      if (overrideUpsertError) throw overrideUpsertError;
    }

    return jsonResponse({
      ok: true,
      trackedCount,
      refreshedCount,
      regulationSettledCount,
      regulationCorrectedCount,
      liveFeedCount: liveItems.length,
      syncedAt: now.toISOString(),
    });
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : "Unexpected sync-live-scores failure",
    }, 500);
  }
});
