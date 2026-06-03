# 世界杯竞猜网站

这是一个基于 `React + Vite + Supabase` 的 2026 世界杯竞猜项目，前端会优先从 WorldCupAPI 拉取赛程，失败时自动回退到内置的本地备用赛程。

## 本地运行

```powershell
npm install
npm run dev
```

默认访问：

```text
http://localhost:5173/
```

## 打包

```powershell
npm run build
```

## WorldCupAPI 配置

项目当前继续使用 `https://api.worldcupapi.com` 作为赛程和实时比分来源，需要分别维护两类环境变量：

- 前端 / Vercel：`VITE_WORLDCUP_API_KEY`
- Supabase Edge Function：`WORLDCUP_API_KEY`

不要只更新前端的 `VITE_WORLDCUP_API_KEY`，否则前端赛程可能恢复了，但 `sync-live-scores` 仍会因为旧 key 失败。

相关变量示例见 `.env.example`：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAILS`
- `VITE_WORLDCUP_API_KEY`
- `WORLDCUP_API_KEY`
- `LIVE_SYNC_SECRET`

## API 诊断

新增了一个本地排障命令：

```powershell
npm run check:worldcup-api
```

它会探测：

- `GET /fixtures`
- `GET /livescores`

并输出每个 endpoint 的状态码和返回摘要，不会打印真实 API key。

## 401 Unauthorized 排查

如果 `check:worldcup-api`、前端赛程，或 Supabase `sync-live-scores` 返回 `401 Unauthorized`，按下面顺序处理：

1. 登录 WorldCupAPI dashboard，确认账号试用或订阅未过期。
2. 确认当前 key 仍有效；如已失效，重新生成新 key。
3. 回填新 key 到本地 `.env.local` 的 `VITE_WORLDCUP_API_KEY` / `WORLDCUP_API_KEY`。
4. 同步更新 Vercel 的 `VITE_WORLDCUP_API_KEY`。
5. 同步更新 Supabase Edge Function 的 `WORLDCUP_API_KEY`。
6. 重新部署前端，并重新设置或部署 Edge Function secrets。

## 降级行为

- 前端赛程接口失败时，会明确提示错误原因，并自动切换到本地备用赛程。
- `sync-live-scores` 遇到 WorldCupAPI 鉴权失败时，会直接返回 provider auth failure，不会继续写入 `live_match_states`、`match_overrides` 或 `world_cup_results`。
