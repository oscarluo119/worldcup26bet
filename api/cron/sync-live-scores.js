export default async function handler(req, res) {
  const authHeader = req.headers.authorization || "";
  const expectedCronSecret = process.env.CRON_SECRET;
  const liveSyncSecret = process.env.LIVE_SYNC_SECRET;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;

  if (!expectedCronSecret || !liveSyncSecret || !supabaseUrl) {
    return res.status(500).json({
      error: "Missing CRON_SECRET, LIVE_SYNC_SECRET, or VITE_SUPABASE_URL",
    });
  }

  if (authHeader !== `Bearer ${expectedCronSecret}`) {
    return res.status(401).json({ error: "Unauthorized cron request" });
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/sync-live-scores`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${liveSyncSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trigger: "vercel-cron",
        triggeredAt: new Date().toISOString(),
      }),
    });

    const text = await response.text();
    let payload = { raw: text };
    try {
      payload = JSON.parse(text);
    } catch {
      // Keep raw text fallback when the function doesn't return JSON.
    }

    return res.status(response.status).json(payload);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to invoke sync-live-scores",
    });
  }
}
