const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRY_DELAY_MS = 1200;
const DEFAULT_MAX_ATTEMPTS = 3;

function createTimeoutError(timeoutMs) {
  return {
    code: "network_timeout",
    message: `Supabase query timed out after ${timeoutMs}ms`,
    details: "query_timeout",
  };
}

function delay(ms) {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function withTimeout(promise, timeoutMs) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return promise;

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(createTimeoutError(timeoutMs)), timeoutMs);
    }),
  ]);
}

export function isRetryableSupabaseError(error) {
  const code = String(error?.code || error?.status || "").trim().toLowerCase();
  const message = String(error?.message || error?.details || "").trim().toLowerCase();

  if (code === "network_timeout") return true;
  if (["408", "429", "500", "502", "503", "504"].includes(code)) return true;

  return (
    message.includes("timeout")
    || message.includes("timed out")
    || message.includes("failed to fetch")
    || message.includes("network request failed")
    || message.includes("upstream connect error")
    || message.includes("service unavailable")
    || message.includes("connection reset")
  );
}

export async function runSupabaseQuery(query, {
  timeoutMs = DEFAULT_TIMEOUT_MS,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
} = {}) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = await withTimeout(Promise.resolve().then(query), timeoutMs);
      if (result?.error) throw result.error;
      return result;
    } catch (error) {
      lastError = error;
      const shouldRetry = attempt < maxAttempts && isRetryableSupabaseError(error);
      if (!shouldRetry) throw error;
      await delay(retryDelayMs);
    }
  }

  throw lastError || createTimeoutError(timeoutMs);
}

export const BOOTSTRAP_PARTIAL_DATA_WARNING = "部分竞猜数据暂时不可用，已加载核心竞猜数据。";

const OPTIONAL_COLLECTIONS = [
  {
    key: "funPredictions",
    table: "fun_predictions",
    fallback: [],
    query: ({ supabase }) => supabase.from("fun_predictions").select("*"),
  },
  {
    key: "championRoadPredictions",
    table: "champion_road_predictions",
    fallback: [],
    query: ({ supabase }) => supabase.from("champion_road_predictions").select("*"),
  },
  {
    key: "championRoadPredictionItems",
    table: "champion_road_prediction_items",
    fallback: [],
    query: ({ supabase }) => supabase.from("champion_road_prediction_items").select("*"),
  },
  {
    key: "sponsorPredictions",
    table: "sponsor_predictions",
    fallback: [],
    query: ({ supabase }) => supabase.from("sponsor_predictions").select("*"),
  },
  {
    key: "matchOverrides",
    table: "match_overrides",
    fallback: [],
    query: ({ supabase }) => supabase.from("match_overrides").select("*"),
  },
  {
    key: "liveMatchStates",
    table: "live_match_states",
    fallback: [],
    query: ({ supabase }) => supabase.from("live_match_states").select("*"),
  },
  {
    key: "worldCupResults",
    table: "world_cup_results",
    fallback: [],
    query: ({ supabase }) => supabase.from("world_cup_results").select("*"),
  },
  {
    key: "funResults",
    table: "fun_results",
    fallback: null,
    query: ({ supabase }) => supabase.from("fun_results").select("*").eq("id", "main").maybeSingle(),
  },
  {
    key: "sponsorPredictionResults",
    table: "sponsor_prediction_results",
    fallback: [],
    query: ({ supabase }) => supabase.from("sponsor_prediction_results").select("*"),
  },
];

export async function loadBootstrapCollections({
  supabase,
  fetchAllRows,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
}) {
  const profilesResult = await runSupabaseQuery(
    () => supabase.from("profiles").select("*").order("joined_at", { ascending: true }),
    { timeoutMs, retryDelayMs, maxAttempts },
  );

  const predictionsResult = await runSupabaseQuery(
    () => fetchAllRows({
      supabase,
      table: "predictions",
      orderBy: "submitted_at",
      ascending: true,
    }),
    { timeoutMs, retryDelayMs, maxAttempts },
  );

  const warnings = [];
  const optionalEntries = [];
  for (const descriptor of OPTIONAL_COLLECTIONS) {
    try {
      const result = await runSupabaseQuery(
        () => descriptor.query({ supabase }),
        { timeoutMs, retryDelayMs, maxAttempts },
      );
      optionalEntries.push([descriptor.key, result.data ?? descriptor.fallback]);
    } catch (error) {
      warnings.push({
        key: descriptor.key,
        table: descriptor.table,
        error,
      });
      optionalEntries.push([descriptor.key, descriptor.fallback]);
    }
  }

  return {
    data: {
      profiles: profilesResult.data || [],
      predictions: predictionsResult.data || [],
      ...Object.fromEntries(optionalEntries),
    },
    warnings,
  };
}
