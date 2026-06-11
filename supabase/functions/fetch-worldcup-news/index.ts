import {
  attachThumbnailsByUrl,
  extractArticleMetadata,
  parseDongqiudiNewsHtml,
  parseHupuNewsHtml,
  parseHupuThumbnailMap,
  selectWorldCupNewsFeed,
} from "../../../src/lib/worldcupNews.js";

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

const CACHE_TTL_MS = 5 * 60 * 1000;
const NEWS_LIMIT = 12;
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const COMMON_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
};

let cachedPayload: Json | null = null;
let cachedAt = 0;

function jsonResponse(body: Json, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

async function fetchHtml(url: string) {
  const response = await fetch(url, { headers: COMMON_HEADERS });
  if (!response.ok) throw new Error(`fetch_failed:${response.status}:${url}`);
  return response.text();
}

async function fetchHupuNews() {
  const responses = await Promise.allSettled([
    fetchHtml("https://soccer.hupu.com/"),
    fetchHtml("https://www.hupu.com/news"),
  ]);

  const htmlPages = responses
    .filter((result): result is PromiseFulfilledResult<string> => result.status === "fulfilled")
    .map((result) => result.value);

  const items = htmlPages.flatMap((html) => parseHupuNewsHtml(html));
  const thumbnailMap = Object.assign({}, ...htmlPages.map((html) => parseHupuThumbnailMap(html)));
  return attachThumbnailsByUrl(items, thumbnailMap);
}

async function fetchDongqiudiNews() {
  const html = await fetchHtml("https://m.dongqiudi.com/home/104");
  return parseDongqiudiNewsHtml(html);
}

async function hydrateArticleMetadata(items: Array<Record<string, unknown>>) {
  const safeItems = (items || []).filter((item): item is Record<string, unknown> => Boolean(item));
  const missingItems = safeItems.filter((item) => (!item.thumbnailUrl || !item.summary) && typeof item.url === "string");
  if (!missingItems.length) return items;

  const results = await Promise.allSettled(
    missingItems.map(async (item) => {
      const html = await fetchHtml(String(item.url));
      return [String(item.url), extractArticleMetadata(html)] as const;
    }),
  );

  const metadataMap = Object.fromEntries(
    results
      .filter((result): result is PromiseFulfilledResult<readonly [string, { summary: string; thumbnailUrl: string }]> => result.status === "fulfilled")
      .filter((result) => result.value[1]),
  );

  const thumbnailMap = Object.fromEntries(
    Object.entries(metadataMap)
      .filter(([, meta]) => meta && typeof meta === "object" && "thumbnailUrl" in meta)
      .map(([url, meta]) => [url, String((meta as { thumbnailUrl?: string }).thumbnailUrl || "")]),
  );

  const itemsWithThumbnails = attachThumbnailsByUrl(safeItems, thumbnailMap);
  return itemsWithThumbnails.map((item) => {
    const metadata = typeof item.url === "string" ? metadataMap[item.url] : null;
    return {
      ...item,
      summary: item.summary || metadata?.summary || "",
      thumbnailUrl: item.thumbnailUrl || metadata?.thumbnailUrl || "",
    };
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: CORS_HEADERS,
      });
    }

    const now = Date.now();
    if (cachedPayload && now - cachedAt < CACHE_TTL_MS) {
      return jsonResponse(cachedPayload);
    }

    const [hupuResult, dongqiudiResult] = await Promise.allSettled([
      fetchHupuNews(),
      fetchDongqiudiNews(),
    ]);

    const hupuItems = hupuResult.status === "fulfilled" ? await hydrateArticleMetadata(hupuResult.value) : [];
    const dongqiudiItems = dongqiudiResult.status === "fulfilled" ? await hydrateArticleMetadata(dongqiudiResult.value) : [];
    const mergedItems = selectWorldCupNewsFeed({
      hupuItems,
      dongqiudiItems,
      limit: NEWS_LIMIT,
    });

    if (!mergedItems.length && cachedPayload) {
      return jsonResponse(cachedPayload);
    }

    const payload = {
      items: mergedItems,
      sourceStatus: {
        hupu: hupuResult.status === "fulfilled" ? (hupuItems.length ? "ok" : "empty") : "failed",
        dongqiudi: dongqiudiResult.status === "fulfilled" ? (dongqiudiItems.length ? "ok" : "empty") : "failed",
      },
      primarySource: hupuItems.length ? "hupu" : dongqiudiItems.length ? "dongqiudi" : "none",
      fetchedAt: new Date().toISOString(),
    };

    cachedPayload = payload;
    cachedAt = now;
    return jsonResponse(payload);
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "",
      },
      500,
    );
  }
});
