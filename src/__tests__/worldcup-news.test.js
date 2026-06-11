import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test, vi } from "vitest";
import {
  DEFAULT_WORLD_CUP_NEWS_IMAGE,
  FALLBACK_WORLD_CUP_NEWS,
  attachThumbnailsByUrl,
  dedupeWorldCupNews,
  extractSummaryFromArticleHtml,
  extractThumbnailFromArticleHtml,
  fetchWorldCupNews,
  filterWorldCupNews,
  isFallbackWorldCupNews,
  isWorldCupRelevant,
  mergeWorldCupNews,
  parseDongqiudiNewsHtml,
  parseHupuArticleDetails,
  parseHupuNewsHtml,
  parseHupuThumbnailMap,
  selectWorldCupNewsFeed,
} from "../lib/worldcupNews";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");
const edgeFunctionSource = readFileSync(resolve(process.cwd(), "supabase/functions/fetch-worldcup-news/index.ts"), "utf8");

describe("world cup news aggregation", () => {
  test("parses hupu world cup items from html snippets", () => {
    const items = parseHupuNewsHtml(`
      <a href="https://bbs.hupu.com/1" title="世界杯揭幕战前瞻：墨西哥对阵南非">
        世界杯揭幕战前瞻：墨西哥对阵南非
      </a>
    `);

    expect(items[0]).toMatchObject({
      source: "hupu",
      title: "世界杯揭幕战前瞻：墨西哥对阵南非",
    });
  });

  test("extracts hupu thumbnail mappings from list html", () => {
    const map = parseHupuThumbnailMap(`
      <a href="https://bbs.hupu.com/1">
        <div><img src="https://img.example.com/news.jpg" alt="img" /></div>
      </a>
    `);

    expect(map["https://bbs.hupu.com/1"]).toBe("https://img.example.com/news.jpg");
  });

  test("does not leak nearby hupu copy into unrelated item summaries", () => {
    const items = parseHupuNewsHtml(`
      <a href="https://bbs.hupu.com/1" title="下赛季的首发十一人基本出炉">下赛季的首发十一人基本出炉</a>
      <div>世界杯揭幕战前瞻：墨西哥对阵南非</div>
    `);

    expect(items[0].summary).not.toContain("世界杯");
  });

  test("extracts thumbnail from article meta or first useful image", () => {
    expect(
      extractThumbnailFromArticleHtml(`
        <meta property="og:image" content="https://img.example.com/meta.jpg" />
        <img src="https://img.example.com/body.jpg" />
      `),
    ).toBe("https://img.example.com/meta.jpg");

    expect(
      extractThumbnailFromArticleHtml(`
        <img src="data:image/png;base64,abc" />
        <img src="https://img.example.com/body.jpg" />
      `),
    ).toBe("https://img.example.com/body.jpg");
  });

  test("extracts summary from article meta description before body text", () => {
    expect(
      extractSummaryFromArticleHtml(`
        <meta name="description" content="世界杯揭幕战前，墨西哥与南非都在进行最后备战。" />
        <p>这段正文不该被优先使用。</p>
      `),
    ).toBe("世界杯揭幕战前，墨西哥与南非都在进行最后备战。");
  });

  test("extracts hupu article details from next data content and video cover", () => {
    const details = parseHupuArticleDetails(`
      <script id="__NEXT_DATA__" type="application/json">
        {
          "props": {
            "pageProps": {
              "detail": {
                "thread": {
                  "content": "<p>法国队在世界杯前的训练强度持续拉满，德尚重点演练边路压制。</p>",
                  "videoCover": "https://img.example.com/hupu-cover.jpg"
                }
              }
            }
          }
        }
      </script>
    `);

    expect(details).toMatchObject({
      summary: "法国队在世界杯前的训练强度持续拉满，德尚重点演练边路压制。",
      thumbnailUrl: "https://img.example.com/hupu-cover.jpg",
    });
  });

  test("attaches thumbnails by article url without dropping the item", () => {
    const items = attachThumbnailsByUrl(
      [
        {
          id: "h1",
          source: "hupu",
          title: "title",
          summary: "",
          url: "https://bbs.hupu.com/1",
          publishedAt: "",
          fetchedAt: "",
          thumbnailUrl: "",
          dedupeKey: "h1",
        },
      ],
      {
        "https://bbs.hupu.com/1": "https://img.example.com/news.jpg",
      },
    );

    expect(items).toHaveLength(1);
    expect(items[0].thumbnailUrl).toBe("https://img.example.com/news.jpg");
  });

  test("parses dongqiudi article snippets and ignores blocked pages", () => {
    expect(parseDongqiudiNewsHtml("<div id='statusCode'>567</div>")).toEqual([]);

    const items = parseDongqiudiNewsHtml(`
      <a href="https://m.dongqiudi.com/article/5875842.html">世界杯赛程全览：小组赛焦点战一图速览</a>
      <p>世界杯赛程全览，方便快速追踪揭幕战与出线形势。</p>
    `);

    expect(items[0]).toMatchObject({
      source: "dongqiudi",
      title: "世界杯赛程全览：小组赛焦点战一图速览",
    });
  });

  test("keeps only world cup relevant items and dedupes by normalized title", () => {
    const merged = mergeWorldCupNews(
      [
        {
          id: "h1",
          source: "hupu",
          title: "世界杯揭幕战今晚开打，墨西哥对阵南非",
          summary: "世界杯揭幕战即将开赛",
          url: "https://hupu.com/1",
          publishedAt: "2026-06-11T10:00:00.000Z",
          fetchedAt: "2026-06-12T00:00:00.000Z",
          thumbnailUrl: "",
          dedupeKey: "opener",
        },
      ],
      [
        {
          id: "d1",
          source: "dongqiudi",
          title: "世界杯揭幕战今晚开打，墨西哥对阵南非！",
          summary: "美加墨世界杯首战前瞻",
          url: "https://dongqiudi.com/1",
          publishedAt: "2026-06-11T11:00:00.000Z",
          fetchedAt: "2026-06-12T00:00:00.000Z",
          thumbnailUrl: "https://img.example.com/1.jpg",
          dedupeKey: "opener",
        },
        {
          id: "d2",
          source: "dongqiudi",
          title: "英超夏窗转会流言汇总",
          summary: "与世界杯无关",
          url: "https://dongqiudi.com/2",
          publishedAt: "2026-06-11T12:00:00.000Z",
          fetchedAt: "2026-06-12T00:00:00.000Z",
          thumbnailUrl: "",
          dedupeKey: "epl-transfer",
        },
      ],
    );

    const filtered = filterWorldCupNews(merged).filter((item) => !item.title.includes("英超"));
    expect(filtered).toHaveLength(2);
    expect(dedupeWorldCupNews(filtered)).toHaveLength(1);
    expect(dedupeWorldCupNews(filtered)[0]).toMatchObject({
      source: "dongqiudi",
      thumbnailUrl: "https://img.example.com/1.jpg",
    });
  });

  test("ships a safe fallback list for empty or failed fetches", () => {
    expect(FALLBACK_WORLD_CUP_NEWS).toHaveLength(4);
    expect(FALLBACK_WORLD_CUP_NEWS.every((item) => item.isWorldCupRelevant)).toBe(true);
  });

  test("detects fallback news payloads", () => {
    expect(isFallbackWorldCupNews(FALLBACK_WORLD_CUP_NEWS)).toBe(true);
    expect(isFallbackWorldCupNews([{ ...FALLBACK_WORLD_CUP_NEWS[0] }])).toBe(false);
  });

  test("does not treat a generic 2026 timestamp as world cup relevance", () => {
    expect(isWorldCupRelevant("Transfer update", "Published on 2026-06-11 with squad notes")).toBe(false);
  });

  test("does not treat generic lineup or finals wording as world cup by itself", () => {
    expect(isWorldCupRelevant("下赛季的首发十一人基本出炉", "")).toBe(false);
    expect(isWorldCupRelevant("NBA官方晒图：多位明星现场观看总决赛G4", "")).toBe(false);
    expect(isWorldCupRelevant("西吉斯蒙迪杯不是小世界杯", "")).toBe(false);
  });

  test("prefers hupu items and only uses dongqiudi as fallback fill", () => {
    const hupuItems = [
      {
        id: "h1",
        source: "hupu",
        title: "世界杯揭幕战前瞻：墨西哥对阵南非",
        summary: "揭幕战赛前观察",
        url: "https://hupu.com/1",
        publishedAt: "2026-06-11T10:00:00.000Z",
        fetchedAt: "2026-06-12T00:00:00.000Z",
        thumbnailUrl: "",
        dedupeKey: "opener-preview",
      },
    ];
    const dongqiudiItems = [
      {
        id: "d1",
        source: "dongqiudi",
        title: "世界杯伤情更新：多队继续调整阵容",
        summary: "最新国家队名单动态",
        url: "https://dongqiudi.com/1",
        publishedAt: "2026-06-11T11:00:00.000Z",
        fetchedAt: "2026-06-12T00:00:00.000Z",
        thumbnailUrl: "",
        dedupeKey: "injury-update",
      },
      {
        id: "d2",
        source: "dongqiudi",
        title: "世界杯首发猜想：热门球队阵容预估",
        summary: "赛前前瞻汇总",
        url: "https://dongqiudi.com/2",
        publishedAt: "2026-06-11T12:00:00.000Z",
        fetchedAt: "2026-06-12T00:00:00.000Z",
        thumbnailUrl: "",
        dedupeKey: "lineups",
      },
    ];

    expect(selectWorldCupNewsFeed({ hupuItems, dongqiudiItems, limit: 2 }).map((item) => item.source)).toEqual([
      "hupu",
      "dongqiudi",
    ]);
  });

  test("falls back to direct function url when invoke fails", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "h1",
            source: "hupu",
            title: "世界杯揭幕战前瞻",
            summary: "",
            url: "https://hupu.com/1",
            publishedAt: "2026-06-11T10:00:00.000Z",
            fetchedAt: "2026-06-12T00:00:00.000Z",
            thumbnailUrl: "",
            dedupeKey: "h1",
          },
        ],
      }),
    });

    const items = await fetchWorldCupNews({
      supabase: {
        functions: {
          invoke: vi.fn().mockRejectedValue(new Error("invoke_failed")),
        },
      },
      isSupabaseConfigured: true,
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "test-key",
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith("https://example.supabase.co/functions/v1/fetch-worldcup-news", {
      headers: {
        Authorization: "Bearer test-key",
        apikey: "test-key",
      },
    });
    expect(items).toHaveLength(1);
    expect(items[0].source).toBe("hupu");
  });

  test("renders the home news marquee between next match and top 3 cards without subtitle", () => {
    expect(appSource).toContain("function WorldCupNewsMarquee(");
    expect(appSource).toContain("世界杯新闻");
    expect(appSource).not.toContain("虎扑 + 懂球帝双源聚合");
    expect(appSource).toContain("DEFAULT_WORLD_CUP_NEWS_IMAGE");
    expect(appSource).toContain("readCachedWorldCupNews");
    expect(appSource).not.toContain("const [worldCupNews, setWorldCupNews] = useState(FALLBACK_WORLD_CUP_NEWS);");
    expect(appSource).not.toContain("这条资讯来自世界杯新闻流，点击原文可查看完整内容。");
    expect(appSource).not.toContain("点击查看站内预览与原文入口。");
    const insertIndex = appSource.indexOf("<WorldCupNewsMarquee items={worldCupNews}");
    expect(appSource.indexOf("下一场比赛竞猜入口")).toBeLessThan(insertIndex);
    expect(insertIndex).toBeLessThan(appSource.indexOf("排行榜 Top 3"));
  });

  test("edge function includes cors handling for browser invocation", () => {
    expect(edgeFunctionSource).toContain("Access-Control-Allow-Origin");
    expect(edgeFunctionSource).toContain('req.method === "OPTIONS"');
  });
});
