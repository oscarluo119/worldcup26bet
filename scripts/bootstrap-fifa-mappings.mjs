import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  buildFifaMappingRows,
  buildLocalScheduleFromRows,
  extractScheduleRowsFromAppSource,
  FIFA_MATCHES_URL,
  FIFA_REQUEST_HEADERS,
  FIFA_WORLD_CUP_2026_SEASON_ID,
  normalizeFifaMatch,
} from "../src/lib/fifaSync.js";

const PROJECT_ROOT = process.cwd();
const APP_PATH = path.join(PROJECT_ROOT, "src", "App.jsx");
const ENV_PATH = path.join(PROJECT_ROOT, ".env.local");
const SHOULD_WRITE = process.argv.includes("--write");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, "utf8");
  return content.split(/\r?\n/u).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return acc;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return acc;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    acc[key] = value;
    return acc;
  }, {});
}

async function fetchFifaMatches() {
  const url = `${FIFA_MATCHES_URL}?count=200&idSeason=${FIFA_WORLD_CUP_2026_SEASON_ID}`;
  const response = await fetch(url, { headers: FIFA_REQUEST_HEADERS });
  if (!response.ok) {
    throw new Error(`FIFA matches request failed (${response.status})`);
  }

  const data = await response.json();
  const results = Array.isArray(data?.Results) ? data.Results : [];
  return results.map(normalizeFifaMatch);
}

async function upsertMappings(rows, env) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for --write");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("match_provider_mappings").upsert(rows, {
    onConflict: "match_id,provider",
  });

  if (error) throw error;
}

async function main() {
  const env = loadEnvFile(ENV_PATH);
  const appSource = fs.readFileSync(APP_PATH, "utf8");
  const scheduleRows = extractScheduleRowsFromAppSource(appSource);
  const localMatches = buildLocalScheduleFromRows(scheduleRows);
  const fifaMatches = await fetchFifaMatches();
  const mappingRows = buildFifaMappingRows(localMatches, fifaMatches);
  const matched = mappingRows.filter((row) => row.mapping_status === "matched");
  const needsReview = mappingRows.filter((row) => row.mapping_status !== "matched");

  console.log("FIFA mapping bootstrap");
  console.log(`localMatches=${localMatches.length}`);
  console.log(`fifaMatches=${fifaMatches.length}`);
  console.log(`matched=${matched.length}`);
  console.log(`needsReview=${needsReview.length}`);

  if (needsReview.length) {
    console.log("needsReview sample=");
    console.log(JSON.stringify(needsReview.slice(0, 10), null, 2));
  }

  if (SHOULD_WRITE) {
    await upsertMappings(mappingRows, env);
    console.log("databaseWrite=ok");
  } else {
    console.log("databaseWrite=skipped (use --write to persist)");
  }
}

main().catch((error) => {
  console.error("FIFA mapping bootstrap failed");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
