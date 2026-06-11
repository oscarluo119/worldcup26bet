# 世界杯竞猜站

这是一个基于 `React + Vite + Supabase` 的 2026 世界杯竞猜项目。前端继续以内置赛程作为主基准，后台实时比分与常规时间赛果同步链路已经切换到 FIFA `calendar/matches` 接口。

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

## 环境变量

相关变量示例见 `.env.example`：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAILS`
- `LIVE_SYNC_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

说明：

- `LIVE_SYNC_SECRET` 用于保护 `sync-live-scores` Edge Function。
- `SUPABASE_SERVICE_ROLE_KEY` 仅用于 Edge Function 和本地映射初始化写库脚本。
- FIFA 当前同步实现不依赖单独的 provider API key。

## FIFA 数据检查

新增了本地诊断命令：

```powershell
npm run check:fifa-api
```

它会请求 FIFA `calendar/matches` 接口，并输出：

- HTTP 状态码
- 返回比赛数量
- 一条样本比赛摘要

## 映射初始化

新增了本地映射初始化脚本，用于把项目内赛程和 FIFA 比赛建立映射：

```powershell
node scripts/bootstrap-fifa-mappings.mjs
```

预览模式只打印统计信息，不写数据库。确认无误后可执行：

```powershell
node scripts/bootstrap-fifa-mappings.mjs --write
```

脚本会读取：

- `src/App.jsx` 中的本地完整赛程
- FIFA `calendar/matches` 返回
- `.env.local` 或当前 shell 中的 Supabase 环境变量

并写入 `match_provider_mappings`。

## 实时比分同步

Supabase Edge Function `sync-live-scores` 现在会：

- 读取 `match_provider_mappings`
- 拉取 FIFA `calendar/matches`
- 更新 `live_match_states`
- 在常规时间最终比分可确认时更新 `world_cup_results`
- 同步维护 `match_overrides`

为了避免自动同步覆盖较新的人工结算，函数会对已存在的手工 `settled` 覆盖记录做保护。

## 降级行为

- 若 FIFA 接口暂时不可用，前端本地赛程仍可继续展示。
- 若某场比赛尚未建立 provider 映射，该场不会写入自动比分，但不会影响其他已映射场次同步。
- 若管理员已手工结算某场比赛，自动同步会尽量保留人工结果优先。
