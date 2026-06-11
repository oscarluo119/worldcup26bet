# `cron-job.org` 接入说明

当前项目的实时比分调度链路如下：

- 前端部署在 Vercel
- `cron-job.org` 负责定时触发
- Supabase Edge Function `sync-live-scores` 负责同步 FIFA 比分

## 任务配置

在 `https://cron-job.org` 新建任务并填写：

- `URL`
  - `https://<your-project-ref>.supabase.co/functions/v1/sync-live-scores`
- `Request method`
  - `POST`
- `Schedule`
  - `Every 1 minute`
- `Timezone`
  - 推荐 `Asia/Shanghai`
- `Request body`

```json
{"trigger":"cron-job-org"}
```

## 请求头

至少添加以下请求头：

- `Authorization: Bearer <LIVE_SYNC_SECRET>`
- `Content-Type: application/json`

其中 `<LIVE_SYNC_SECRET>` 必须与 Supabase Edge Function 环境变量中的 `LIVE_SYNC_SECRET` 完全一致。

## 必要环境变量

`sync-live-scores` 至少依赖下面几个变量：

- `LIVE_SYNC_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

说明：

- FIFA 当前同步链路不依赖 `WORLDCUP_API_KEY`。
- 若本地要执行 `bootstrap-fifa-mappings.mjs --write`，也需要同一套 Supabase 写入凭据。

## 测试通过标准

正常成功响应示例：

```json
{
  "ok": true,
  "provider": "fifa",
  "providerStatus": {
    "matches": 200
  },
  "fifaMatchCount": 104,
  "mappingCount": 104,
  "matchedMappingCount": 104,
  "unmappedProviderMatches": 0,
  "trackedCount": 0,
  "refreshedCount": 0,
  "regulationSettledCount": 0,
  "regulationCorrectedCount": 0,
  "manualProtectedCount": 0,
  "syncedAt": "2026-06-11T00:00:00.000Z"
}
```

如果当前没有进入同步窗口的比赛，`trackedCount` 和 `refreshedCount` 为 `0` 是正常现象。

## 失败排查

如果返回类似下面的响应：

```json
{
  "ok": false,
  "provider": "fifa",
  "errorType": "provider_http_error",
  "statusCode": 403,
  "error": "FIFA matches request failed (403)",
  "syncedAt": "2026-06-11T00:00:00.000Z"
}
```

优先检查：

1. FIFA `calendar/matches` 当前是否可访问。
2. Supabase Edge Function 中的 `LIVE_SYNC_SECRET`、`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY` 是否齐全。
3. `match_provider_mappings` 是否已经初始化，且存在 `mapping_status = matched` 的记录。
4. 若是空数据或单场无法对上，重新执行映射初始化脚本并检查 `needs_review` 项。
