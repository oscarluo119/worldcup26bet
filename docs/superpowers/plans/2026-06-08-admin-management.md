# Admin Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin-only UI for promoting and revoking administrator accounts while keeping `profiles.is_admin` as the single source of truth.

**Architecture:** Extend the existing Supabase permission model with one guarded RPC for admin role changes, then wire the existing admin tab to load profile data and expose a compact admin-account management panel. Keep the frontend dependent on `profiles.is_admin`, and let the database enforce "last admin cannot be removed" so the UI stays thin.

**Tech Stack:** React, Vite, Supabase JS, Postgres SQL RPCs, existing app test/build tooling

---

### Task 1: Add the guarded admin-role RPC

**Files:**
- Modify: `supabase-schema.sql`

- [ ] **Step 1: Add the failing database behavior target to the plan**

```sql
-- New RPC contract:
-- public.admin_set_user_admin(target_user_id uuid, make_admin boolean)
-- Rules:
-- 1. Caller must satisfy public.is_admin()
-- 2. Target profile must exist
-- 3. Revoking the final remaining admin must raise an exception
-- 4. Return the updated public.profiles row
```

- [ ] **Step 2: Implement the RPC next to the other admin RPCs**

```sql
create or replace function public.admin_set_user_admin(
  target_user_id uuid,
  make_admin boolean
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
  admin_count bigint;
begin
  if not public.is_admin() then
    raise exception 'Only admins can manage admin accounts.';
  end if;

  if make_admin = false then
    select count(*)
    into admin_count
    from public.profiles
    where is_admin = true;

    if admin_count <= 1 then
      perform 1
      from public.profiles
      where id = target_user_id
        and is_admin = true;

      if found then
        raise exception 'At least one admin account must remain.';
      end if;
    end if;
  end if;

  update public.profiles
  set is_admin = make_admin
  where id = target_user_id
  returning *
  into updated_profile;

  if updated_profile is null then
    raise exception 'Target profile not found.';
  end if;

  return updated_profile;
end;
$$;

grant execute on function public.admin_set_user_admin(uuid, boolean) to authenticated;
```

- [ ] **Step 3: Preserve the existing bootstrap note but make it multi-admin friendly**

```sql
-- Bootstrap an initial admin manually after signup, then manage admin access in-app.
update public.profiles
set is_admin = true
where lower(email) = 'oscarluo119@gmail.com';
```

- [ ] **Step 4: Commit the schema change**

```bash
git add supabase-schema.sql
git commit -m "feat: add admin role management rpc"
```

### Task 2: Add frontend state and filtering for admin account management

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Write the failing UI behavior target in the plan**

```jsx
// Expected new UI state:
// - adminAccountQuery
// - adminActionLoadingId
// - adminActionMessage
// Derived views:
// - currentAdmins from players.filter((player) => player.isAdmin)
// - adminCandidates from players.filter((player) => !player.isAdmin)
// - query filter matches email/displayName/name case-insensitively
```

- [ ] **Step 2: Add state and derived lists near the other admin screen state**

```jsx
const [adminAccountQuery, setAdminAccountQuery] = useState("");
const [adminActionLoadingId, setAdminActionLoadingId] = useState("");
const [adminActionMessage, setAdminActionMessage] = useState("");

const normalizedAdminQuery = adminAccountQuery.trim().toLowerCase();
const currentAdmins = players.filter((player) => player.isAdmin);
const adminCandidates = players.filter((player) => {
  if (player.isAdmin) return false;
  if (!normalizedAdminQuery) return true;

  return [player.displayName, player.name, player.email]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalizedAdminQuery));
});
```

- [ ] **Step 3: Add helper actions for promote/revoke that call the new RPC**

```jsx
async function setUserAdminRole(targetUserId, makeAdmin) {
  setAdminActionMessage("");
  setAdminActionLoadingId(targetUserId);

  const { error } = await supabase.rpc("admin_set_user_admin", {
    target_user_id: targetUserId,
    make_admin: makeAdmin,
  });

  setAdminActionLoadingId("");

  if (error) {
    setAdminActionMessage(error.message || "管理员权限更新失败");
    return;
  }

  setAdminActionMessage(makeAdmin ? "已添加管理员" : "已取消管理员");
  await loadAppData();
}

async function handleRevokeAdmin(targetUser) {
  const confirmed = window.confirm(`确认取消 ${targetUser.displayName || targetUser.email || "该用户"} 的管理员权限吗？`);
  if (!confirmed) return;
  await setUserAdminRole(targetUser.id, false);
}
```

- [ ] **Step 4: Commit the state/action scaffolding**

```bash
git add src/App.jsx
git commit -m "feat: scaffold admin account management ui state"
```

### Task 3: Render the admin account management panel

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add the new admin panel inside the existing admin tab content**

```jsx
<section className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
  <div className="flex items-center justify-between gap-3">
    <div>
      <h3 className="text-xl font-black">管理员账号</h3>
      <p className="mt-1 text-sm text-slate-400">在后台授予或取消管理员权限，至少保留一个管理员账号。</p>
    </div>
    <Pill>{`当前 ${currentAdmins.length} 位管理员`}</Pill>
  </div>

  {adminActionMessage ? <p className="mt-3 text-sm text-slate-300">{adminActionMessage}</p> : null}

  <div className="mt-5 grid gap-4 lg:grid-cols-2">
    <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
      <h4 className="text-sm font-bold text-white">当前管理员</h4>
      <div className="mt-3 space-y-3">
        {currentAdmins.map((player) => (
          <div key={player.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 px-3 py-3">
            <div className="min-w-0">
              <div className="truncate font-semibold text-white">{player.displayName || player.name || "未命名用户"}</div>
              <div className="truncate text-xs text-slate-400">{player.email || "未填写邮箱"}</div>
            </div>
            <button
              type="button"
              className="rounded-full border border-rose-400/30 px-3 py-1 text-xs font-semibold text-rose-200 disabled:opacity-50"
              disabled={adminActionLoadingId === player.id}
              onClick={() => handleRevokeAdmin(player)}
            >
              取消权限
            </button>
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
      <h4 className="text-sm font-bold text-white">添加管理员</h4>
      <input
        value={adminAccountQuery}
        onChange={(event) => setAdminAccountQuery(event.target.value)}
        placeholder="搜索邮箱或昵称"
        className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
      />
      <div className="mt-3 space-y-3">
        {adminCandidates.slice(0, 12).map((player) => (
          <div key={player.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 px-3 py-3">
            <div className="min-w-0">
              <div className="truncate font-semibold text-white">{player.displayName || player.name || "未命名用户"}</div>
              <div className="truncate text-xs text-slate-400">{player.email || "未填写邮箱"}</div>
            </div>
            <button
              type="button"
              className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
              disabled={adminActionLoadingId === player.id}
              onClick={() => setUserAdminRole(player.id, true)}
            >
              设为管理员
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add empty-state copy for both lists**

```jsx
{currentAdmins.length ? currentAdmins.map(...) : (
  <p className="text-sm text-slate-400">当前还没有可显示的管理员账号。</p>
)}

{adminCandidates.length ? adminCandidates.slice(0, 12).map(...) : (
  <p className="text-sm text-slate-400">没有匹配的普通用户，先让对方完成注册登录。</p>
)}
```

- [ ] **Step 3: Commit the UI rendering**

```bash
git add src/App.jsx
git commit -m "feat: add admin account management panel"
```

### Task 4: Verify the flow

**Files:**
- Modify: `docs/superpowers/specs/2026-06-08-admin-management-design.md` only if behavior changed during implementation

- [ ] **Step 1: Run the frontend test suite**

```bash
npm test -- --runInBand
```

Expected: existing tests pass without regressions.

- [ ] **Step 2: Run the production build**

```bash
npm run build
```

Expected: Vite build completes successfully.

- [ ] **Step 3: Manually smoke-test the admin view**

```bash
npm run dev
```

Expected: the admin tab shows the new admin account panel; promote/revoke buttons render; revoke asks for confirmation.

- [ ] **Step 4: Commit the final integrated change**

```bash
git add supabase-schema.sql src/App.jsx docs/superpowers/specs/2026-06-08-admin-management-design.md docs/superpowers/plans/2026-06-08-admin-management.md
git commit -m "feat: add in-app admin account management"
```
