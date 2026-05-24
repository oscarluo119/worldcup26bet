# `cron-job.org` 接入说明

当前项目的实时比分调度采用：

- 前端继续部署在 Vercel
- 定时调用由 `cron-job.org` 负责
- 实际同步逻辑由 Supabase Edge Function `sync-live-scores` 负责

## 任务配置

在 `https://cron-job.org` 新建一个任务，填写如下：

- `URL`
  - `https://prmdmcbujzyojsbkfqgj.supabase.co/functions/v1/sync-live-scores`
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

至少添加以下两个请求头：

- `Authorization`
  - `Bearer <LIVE_SYNC_SECRET>`
- `Content-Type`
  - `application/json`

其中 `<LIVE_SYNC_SECRET>` 必须与 Supabase Edge Function 环境变量中的 `LIVE_SYNC_SECRET` 完全一致。

## 测试通过标准

使用 `cron-job.org` 的测试请求功能时，成功响应应类似：

```json
{
  "ok": true,
  "trackedCount": 0,
  "refreshedCount": 0,
  "regulationSettledCount": 0,
  "regulationCorrectedCount": 0,
  "liveFeedCount": 0,
  "syncedAt": "2026-05-24T00:00:00.000Z"
}
```

如果当前没有直播比赛，`trackedCount` 和 `liveFeedCount` 为 `0` 是正常现象。

## 运行说明

`cron-job.org` 会每分钟请求一次函数，但函数内部只会在这些窗口内真正处理比赛：

- 开赛前 10 分钟
- 比赛进行中
- 比赛整体结束后约 10 分钟缓冲期内

窗口外的请求会快速返回，不会持续写库。
