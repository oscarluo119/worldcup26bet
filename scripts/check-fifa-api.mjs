const FIFA_MATCHES_URL = "https://api.fifa.com/api/v3/calendar/matches";
const FIFA_WORLD_CUP_2026_SEASON_ID = "285023";

async function main() {
  const url = `${FIFA_MATCHES_URL}?count=200&idSeason=${FIFA_WORLD_CUP_2026_SEASON_ID}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0",
    },
  });

  const text = await response.text();
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }

  const sample = parsed?.Results?.[0]
    ? {
        IdMatch: parsed.Results[0].IdMatch,
        MatchNumber: parsed.Results[0].MatchNumber,
        Date: parsed.Results[0].Date,
        Home: parsed.Results[0].Home?.TeamName?.[0]?.Description,
        Away: parsed.Results[0].Away?.TeamName?.[0]?.Description,
      }
    : null;

  console.log("FIFA API health check");
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`status=${response.status} ok=${response.ok}`);
  console.log(`results=${Array.isArray(parsed?.Results) ? parsed.Results.length : 0}`);
  console.log(`sample=${sample ? JSON.stringify(sample) : "<empty>"}`);
}

main().catch((error) => {
  console.error("FIFA API health check failed");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
