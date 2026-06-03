# `cron-job.org` 接入说明

当前项目的实时比分调度链路如下：

- 前端部署在 Vercel
- `cron-job.org` 负责定时触发
- Supabase Edge Function `sync-live-scores` 负责同步 WorldCupAPI 的实时比分

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
- `WORLDCUP_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

说明：

- 前端使用的是 `VITE_WORLDCUP_API_KEY`
- Edge Function 应单独维护 `WORLDCUP_API_KEY`
- 不建议只在前端环境里更新 key，否则 cron 会继续拿旧 key 请求 WorldCupAPI

## 测试通过标准

正常成功响应示例：

```json
{
  "ok": true,
  "provider": "worldcupapi",
  "providerStatus": {
    "fixtures": 200,
    "livescores": 200
  },
  "fixturesPagesFetched": 1,
  "trackedCount": 0,
  "refreshedCount": 0,
  "regulationSettledCount": 0,
  "regulationCorrectedCount": 0,
  "liveFeedCount": 0,
  "syncedAt": "2026-05-24T00:00:00.000Z"
}
```

如果当前没有直播比赛，`trackedCount` 或 `liveFeedCount` 为 `0` 是正常现象。

## 401 Unauthorized 排障

如果返回类似下面的响应：

```json
{
  "ok": false,
  "provider": "worldcupapi",
  "errorType": "provider_auth_failed",
  "endpoint": "fixtures",
  "statusCode": 401,
  "error": "WorldCupAPI fixtures unauthorized (401)",
  "syncedAt": "2026-06-03T00:00:00.000Z"
}
```

表示 WorldCupAPI 鉴权失败。此时函数会停止同步，并且不会继续写入：

- `live_match_states`
- `match_overrides`
- `world_cup_results`

排查步骤：

1. 登录 WorldCupAPI dashboard 检查试用或订阅是否过期。
2. 确认 key 仍有效，必要时重新生成。
3. 更新 Supabase Edge Function 中的 `WORLDCUP_API_KEY`。
4. 如果前端也依赖新的 key，同时更新 Vercel 的 `VITE_WORLDCUP_API_KEY`。
5. 重新部署或重新设置 secrets 后再次触发测试请求。
