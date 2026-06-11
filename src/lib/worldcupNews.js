const ABSOLUTE_WORLD_CUP_KEYWORDS = [
  "世界杯",
  "美加墨",
];

const CONTEXTUAL_WORLD_CUP_KEYWORDS = [
  "揭幕战",
  "小组赛",
  "淘汰赛",
  "16强",
  "八强",
  "四强",
  "半决赛",
  "决赛",
  "出线",
  "晋级",
  "战报",
  "前瞻",
  "首发",
  "伤情",
  "首球",
  "点球大战",
];

const NEGATIVE_WORLD_CUP_PATTERNS = [
  "小世界杯",
  "世俱杯",
  "非世界杯",
];

const TEAM_CONTEXT_KEYWORDS = [
  "阿根廷",
  "巴西",
  "法国",
  "英格兰",
  "葡萄牙",
  "德国",
  "西班牙",
  "荷兰",
  "比利时",
  "克罗地亚",
  "乌拉圭",
  "墨西哥",
  "美国",
  "加拿大",
  "日本",
  "韩国",
  "摩洛哥",
  "塞内加尔",
  "尼日利亚",
  "喀麦隆",
  "南非",
  "哥斯达黎加",
  "沙特",
  "伊朗",
  "澳大利亚",
];

const MATCH_CONTEXT_KEYWORDS = [
  "国家队",
  "备战",
  "名单",
  "集训",
  "主帅",
  "热身",
  "首战",
  "次战",
  "末轮",
  "出线",
  "晋级",
  "伤情",
  "揭幕战",
];

const SOURCE_PRIORITY = {
  hupu: 2,
  dongqiudi: 1,
};

export const DEFAULT_WORLD_CUP_NEWS_IMAGE = "https://www.news.cn/sports/20260611/35487c0f336b44219eb0b37d6d4e5cad/2026061135487c0f336b44219eb0b37d6d4e5cad_a591a17d50c548589976e2c9ded27287.png";

export const FALLBACK_WORLD_CUP_NEWS = [
  {
    id: "fallback-hupu-1",
    source: "hupu",
    title: "世界杯揭幕战临近，墨西哥与南非进入最后备战",
    summary: "揭幕战赛前气氛持续升温，两队训练与伤情动态仍是球迷关注重点。",
    url: "https://soccer.hupu.com/",
    publishedAt: "2026-06-12T00:00:00.000Z",
    thumbnailUrl: "",
    isWorldCupRelevant: true,
    fetchedAt: "2026-06-12T00:00:00.000Z",
    dedupeKey: "世界杯揭幕战临近墨西哥与南非进入最后备战",
  },
  {
    id: "fallback-hupu-2",
    source: "hupu",
    title: "世界杯小组赛前瞻：强队状态与首发选择成焦点",
    summary: "多支热门球队在开赛前继续调整节奏，首发与轮换安排成为讨论重点。",
    url: "https://soccer.hupu.com/",
    publishedAt: "2026-06-11T18:00:00.000Z",
    thumbnailUrl: "",
    isWorldCupRelevant: true,
    fetchedAt: "2026-06-12T00:00:00.000Z",
    dedupeKey: "世界杯小组赛前瞻强队状态与首发选择成焦点",
  },
  {
    id: "fallback-dongqiudi-1",
    source: "dongqiudi",
    title: "懂球帝世界杯专题：赛程、分组与出线形势一图速览",
    summary: "从揭幕战到淘汰赛，世界杯核心信息已整理成一页总览，便于快速追踪。",
    url: "https://m.dongqiudi.com/",
    publishedAt: "2026-06-11T12:00:00.000Z",
    thumbnailUrl: "",
    isWorldCupRelevant: true,
    fetchedAt: "2026-06-12T00:00:00.000Z",
    dedupeKey: "懂球帝世界杯专题赛程分组与出线形势一图速览",
  },
  {
    id: "fallback-dongqiudi-2",
    source: "dongqiudi",
    title: "世界杯参赛队最新动态汇总：伤情、名单与战术风向",
    summary: "各支国家队继续公布赛前调整信息，球员健康与战术微调最受关注。",
    url: "https://m.dongqiudi.com/",
    publishedAt: "2026-06-10T18:00:00.000Z",
    thumbnailUrl: "",
    isWorldCupRelevant: true,
    fetchedAt: "2026-06-12T00:00:00.000Z",
    dedupeKey: "世界杯参赛队最新动态汇总伤情名单与战术风向",
  },
];

export function isFallbackWorldCupNews(items) {
  if (!Array.isArray(items) || items.length !== FALLBACK_WORLD_CUP_NEWS.length) return false;
  return items.every((item, index) => item?.id === FALLBACK_WORLD_CUP_NEWS[index]?.id);
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeUrl(value) {
  if (!value) return "";
  if (value.startsWith("data:image/")) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return `https://www.hupu.com${value}`;
  return value;
}

function normalizeTitle(title) {
  return stripHtml(title)
    .replace(/^[\[\]【】]?流言板[\]\[]?/g, "")
    .replace(/[，。、“”"'‘’：:·\-\s!?？！,.()（）]/g, "")
    .toLowerCase();
}

function buildNewsItem({ source, title, summary, url, publishedAt = "", thumbnailUrl = "" }) {
  const cleanTitle = stripHtml(title);
  const cleanSummary = stripHtml(summary).slice(0, 140);
  return {
    id: `${source}-${normalizeTitle(cleanTitle).slice(0, 32) || Math.random().toString(36).slice(2, 10)}`,
    source,
    title: cleanTitle,
    summary: cleanSummary,
    url: decodeUrl(url),
    publishedAt,
    thumbnailUrl: decodeUrl(thumbnailUrl),
    isWorldCupRelevant: isWorldCupRelevant(cleanTitle, cleanSummary),
    fetchedAt: new Date().toISOString(),
    dedupeKey: normalizeTitle(cleanTitle),
  };
}

function includesKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function isLikelyNewsTitle(title) {
  const clean = stripHtml(title);
  if (clean.length < 8) return false;
  if (/资讯$|专区$|话题$|足球页$|下载$|登录$|注册$/.test(clean)) return false;
  return true;
}

function isUsefulImageUrl(url) {
  const normalized = decodeUrl(url);
  if (!normalized || normalized.startsWith("data:image/")) return false;
  return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(normalized) || /newsPost|news-editor|fastdfs|qunliao/i.test(normalized);
}

function sanitizeSummary(summary) {
  const cleaned = stripHtml(summary)
    .replace(/懂球帝手机客户端.*$/u, "")
    .replace(/点击(?:查看|打开)原文.*$/u, "")
    .replace(/在小宇宙查看该单集文稿.*$/u, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned.length < 8) return "";
  if (/^(骄傲|202\d?|查看原文|懂球帝|虎扑)$/u.test(cleaned)) return "";
  return cleaned.slice(0, 140);
}

function extractJsonScript(raw, scriptId) {
  const scriptPattern = new RegExp(`<script[^>]+id=["']${scriptId}["'][^>]*>([\\s\\S]*?)<\\/script>`, "i");
  return raw.match(scriptPattern)?.[1] || "";
}

export function extractSummaryFromArticleHtml(html) {
  const raw = String(html || "");
  const metaPatterns = [
    /<meta[^>]+(?:property|name)=["'](?:og:description|description|twitter:description)["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:description|description|twitter:description)["'][^>]*>/i,
  ];

  for (const pattern of metaPatterns) {
    const metaSummary = sanitizeSummary(raw.match(pattern)?.[1] || "");
    if (metaSummary) return metaSummary;
  }

  const paragraphs = [...raw.matchAll(/<(?:p|div)[^>]*>([\s\S]{8,300}?)<\/(?:p|div)>/gi)];
  for (const paragraph of paragraphs) {
    const summary = sanitizeSummary(paragraph[1] || "");
    if (summary) return summary;
  }

  return "";
}

export function parseHupuArticleDetails(html) {
  const raw = String(html || "");
  const nextDataRaw = extractJsonScript(raw, "__NEXT_DATA__");
  if (!nextDataRaw) return { summary: "", thumbnailUrl: "" };

  try {
    const nextData = JSON.parse(nextDataRaw);
    const thread = nextData?.props?.pageProps?.detail?.thread || {};
    const summary = sanitizeSummary(thread.content || thread.titleBeforeMerge || "");
    const thumbnailUrl = decodeUrl(thread.videoCover || thread.sharePic || "");
    return {
      summary,
      thumbnailUrl: isUsefulImageUrl(thumbnailUrl) ? thumbnailUrl : "",
    };
  } catch {
    return { summary: "", thumbnailUrl: "" };
  }
}

export function isWorldCupRelevant(title, summary = "") {
  const text = `${stripHtml(title)} ${stripHtml(summary)}`.toLowerCase();
  if (!text) return false;
  if (includesKeyword(text, NEGATIVE_WORLD_CUP_PATTERNS)) return false;
  if (includesKeyword(text, ABSOLUTE_WORLD_CUP_KEYWORDS)) return true;

  const hasTeamContext = includesKeyword(text, TEAM_CONTEXT_KEYWORDS);
  const hasMatchContext = includesKeyword(text, MATCH_CONTEXT_KEYWORDS);
  const hasWorldCupContext = includesKeyword(text, CONTEXTUAL_WORLD_CUP_KEYWORDS);
  return hasWorldCupContext && (hasTeamContext || hasMatchContext);
}

export function parseHupuNewsHtml(html) {
  const raw = String(html || "");
  const items = [];
  const regex = /<a([^>]+)href=["']([^"']*(?:hupu\.com|bbs\.hupu\.com)[^"']*)["']([^>]*)>([\s\S]*?)<\/a>/g;
  const seen = new Set();
  let match;

  while ((match = regex.exec(raw))) {
    const attrs = `${match[1]} ${match[3]}`;
    const url = decodeUrl(match[2]);
    const titleAttrMatch = attrs.match(/title=["']([^"']+)["']/i);
    const title = stripHtml(titleAttrMatch?.[1] || match[4]);
    if (!isLikelyNewsTitle(title) || seen.has(url)) continue;

    seen.add(url);
    items.push(
      buildNewsItem({
        source: "hupu",
        title,
        summary: "",
        url,
      }),
    );

    if (items.length >= 40) break;
  }

  return items;
}

export function parseHupuThumbnailMap(html) {
  const raw = String(html || "");
  const thumbnailMap = {};
  const regex = /<a[^>]+href=["']([^"']*bbs\.hupu\.com[^"']*)["'][^>]*>([\s\S]{0,600}?)<\/a>/g;
  let match;

  while ((match = regex.exec(raw))) {
    const url = decodeUrl(match[1]);
    if (thumbnailMap[url]) continue;
    const imageMatch = match[2].match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    const imageUrl = decodeUrl(imageMatch?.[1] || "");
    if (!isUsefulImageUrl(imageUrl)) continue;
    thumbnailMap[url] = imageUrl;
  }

  return thumbnailMap;
}

export function parseDongqiudiNewsHtml(html) {
  const raw = String(html || "");
  if (raw.includes("statusCode>567") || raw.includes("请求已被站点的安全策略拦截")) return [];

  const items = [];
  const regex = /<a[^>]+href=["']([^"']*dongqiudi\.com\/article\/[^"']*)["'][^>]*>([\s\S]*?)<\/a>/g;
  const seen = new Set();
  let match;

  while ((match = regex.exec(raw))) {
    const url = decodeUrl(match[1]);
    const title = stripHtml(match[2]);
    if (!isLikelyNewsTitle(title) || seen.has(url)) continue;

    seen.add(url);
    items.push(
      buildNewsItem({
        source: "dongqiudi",
        title,
        summary: "",
        url,
      }),
    );

    if (items.length >= 40) break;
  }

  return items;
}

export function extractThumbnailFromArticleHtml(html) {
  const raw = String(html || "");
  const hupuDetails = parseHupuArticleDetails(raw);
  if (isUsefulImageUrl(hupuDetails.thumbnailUrl)) return hupuDetails.thumbnailUrl;

  const metaMatch = raw.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  const metaImage = decodeUrl(metaMatch?.[1] || "");
  if (isUsefulImageUrl(metaImage)) return metaImage;

  const imageMatches = [...raw.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
  for (const imageMatch of imageMatches) {
    const imageUrl = decodeUrl(imageMatch[1] || "");
    if (isUsefulImageUrl(imageUrl)) return imageUrl;
  }

  return "";
}

export function extractArticleMetadata(html) {
  const raw = String(html || "");
  const hupuDetails = parseHupuArticleDetails(raw);
  const summary = hupuDetails.summary || extractSummaryFromArticleHtml(raw);
  const thumbnailUrl = hupuDetails.thumbnailUrl || extractThumbnailFromArticleHtml(raw);
  return {
    summary: sanitizeSummary(summary),
    thumbnailUrl: isUsefulImageUrl(thumbnailUrl) ? thumbnailUrl : "",
  };
}

export function attachThumbnailsByUrl(items, thumbnailMap) {
  return (items || [])
    .filter(Boolean)
    .map((item) => ({
      ...item,
      thumbnailUrl: item?.thumbnailUrl || thumbnailMap?.[item?.url] || "",
    }));
}

export function filterWorldCupNews(items) {
  return (items || []).filter((item) => item?.title && item.url && isWorldCupRelevant(item.title, item.summary));
}

export function dedupeWorldCupNews(items) {
  const deduped = new Map();
  for (const item of items || []) {
    const existing = deduped.get(item.dedupeKey);
    if (!existing) {
      deduped.set(item.dedupeKey, item);
      continue;
    }

    const existingScore = Number(Boolean(existing.thumbnailUrl)) + existing.summary.length;
    const currentScore = Number(Boolean(item.thumbnailUrl)) + item.summary.length;
    const existingTime = new Date(existing.publishedAt || 0).getTime();
    const currentTime = new Date(item.publishedAt || 0).getTime();

    if (currentScore > existingScore || (currentScore === existingScore && currentTime > existingTime)) {
      deduped.set(item.dedupeKey, item);
    }
  }
  return [...deduped.values()];
}

function scoreItem(item) {
  const text = `${item.title} ${item.summary}`;
  let score = 0;
  if (/揭幕战|决赛|半决赛|淘汰赛|战报|前瞻|伤情|首发/u.test(text)) score += 3;
  if (/世界杯|美加墨/u.test(text)) score += 3;
  if (/国家队|备战|名单|主帅/u.test(text)) score += 1;
  score += SOURCE_PRIORITY[item.source] || 0;
  return score;
}

export function mergeWorldCupNews(...groups) {
  return groups
    .flat()
    .filter(Boolean)
    .sort((left, right) => {
      const scoreGap = scoreItem(right) - scoreItem(left);
      if (scoreGap) return scoreGap;
      return new Date(right.publishedAt || 0).getTime() - new Date(left.publishedAt || 0).getTime();
    });
}

function normalizeWorldCupNewsList(items) {
  return dedupeWorldCupNews(filterWorldCupNews(items));
}

export function selectWorldCupNewsFeed({ hupuItems = [], dongqiudiItems = [], limit = 10 }) {
  const primaryItems = normalizeWorldCupNewsList(hupuItems);
  if (primaryItems.length >= limit) {
    return primaryItems.slice(0, limit);
  }

  const fallbackItems = normalizeWorldCupNewsList(dongqiudiItems);
  const merged = [];
  const seen = new Set();

  for (const item of [...primaryItems, ...fallbackItems]) {
    if (seen.has(item.dedupeKey)) continue;
    seen.add(item.dedupeKey);
    merged.push(item);
    if (merged.length >= limit) break;
  }

  return merged;
}

export function normalizeWorldCupNewsPayload(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const merged = normalizeWorldCupNewsList(items);
  return merged.length ? merged : FALLBACK_WORLD_CUP_NEWS;
}

async function fetchWorldCupNewsByUrl({ fetchImpl, supabaseUrl, supabaseAnonKey }) {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("missing_supabase_function_config");
  const response = await fetchImpl(`${supabaseUrl}/functions/v1/fetch-worldcup-news`, {
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    },
  });
  if (!response.ok) throw new Error("news_function_fetch_failed");
  return normalizeWorldCupNewsPayload(await response.json());
}

export async function fetchWorldCupNews({
  supabase,
  isSupabaseConfigured,
  supabaseUrl = "",
  supabaseAnonKey = "",
  fetchImpl = fetch,
}) {
  if (isSupabaseConfigured && supabase?.functions?.invoke) {
    try {
      const { data, error } = await supabase.functions.invoke("fetch-worldcup-news");
      if (error) throw error;
      return normalizeWorldCupNewsPayload(data);
    } catch {
      try {
        return await fetchWorldCupNewsByUrl({ fetchImpl, supabaseUrl, supabaseAnonKey });
      } catch {
        return FALLBACK_WORLD_CUP_NEWS;
      }
    }
  }

  try {
    if (supabaseUrl && supabaseAnonKey) {
      return await fetchWorldCupNewsByUrl({ fetchImpl, supabaseUrl, supabaseAnonKey });
    }
    const response = await fetchImpl("/api/worldcup-news");
    if (!response.ok) throw new Error("news_proxy_failed");
    return normalizeWorldCupNewsPayload(await response.json());
  } catch {
    return FALLBACK_WORLD_CUP_NEWS;
  }
}
