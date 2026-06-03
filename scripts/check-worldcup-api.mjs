import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const ENV_PATH = path.join(PROJECT_ROOT, ".env.local");
const FIXTURES_URL = "https://api.worldcupapi.com/fixtures";
const LIVE_SCORES_URL = "https://api.worldcupapi.com/livescores";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing env file: ${filePath}`);
  }

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

function sanitizePreview(text, apiKey) {
  if (!text) return "";
  return text.replaceAll(apiKey, "<redacted>").replace(/\s+/gu, " ").trim().slice(0, 220);
}

async function inspectEndpoint(name, baseUrl, apiKey) {
  const url = `${baseUrl}?key=${encodeURIComponent(apiKey)}${name === "fixtures" ? "&page=1" : ""}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    const preview = sanitizePreview(text, apiKey);
    return {
      name,
      ok: response.ok,
      status: response.status,
      preview,
    };
  } catch (error) {
    return {
      name,
      ok: false,
      status: "NETWORK_ERROR",
      preview: error instanceof Error ? error.message : "Unknown fetch error",
    };
  }
}

async function main() {
  const env = loadEnvFile(ENV_PATH);
  const apiKey = env.VITE_WORLDCUP_API_KEY || env.WORLDCUP_API_KEY;

  if (!apiKey) {
    throw new Error("Missing VITE_WORLDCUP_API_KEY or WORLDCUP_API_KEY in .env.local");
  }

  const results = await Promise.all([
    inspectEndpoint("fixtures", FIXTURES_URL, apiKey),
    inspectEndpoint("livescores", LIVE_SCORES_URL, apiKey),
  ]);

  console.log("WorldCupAPI health check");
  console.log(`Date: ${new Date().toISOString()}`);
  for (const result of results) {
    console.log(`- ${result.name}: status=${result.status} ok=${result.ok}`);
    console.log(`  preview=${result.preview || "<empty>"}`);
  }
}

main().catch((error) => {
  console.error("WorldCupAPI health check failed");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
