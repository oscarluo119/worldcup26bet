create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null,
  avatar_emoji text not null default '⚽',
  camp_id text check (camp_id in ('A', 'B')),
  is_admin boolean not null default false,
  joined_at timestamptz not null default now()
);

alter table public.profiles
add column if not exists avatar_emoji text not null default '⚽';

alter table public.profiles
add column if not exists camp_id text check (camp_id in ('A', 'B'));

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id text not null,
  home integer not null check (home >= 0),
  away integer not null check (away >= 0),
  submitted_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create table if not exists public.fun_predictions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  champion text not null,
  golden_boot text not null,
  first_red_card_team text not null,
  total_goals integer not null check (total_goals >= 0),
  submitted_at timestamptz not null default now()
);

create table if not exists public.match_overrides (
  match_id text primary key,
  status text not null check (status in ('open', 'closed', 'settled')),
  home_score integer check (home_score >= 0),
  away_score integer check (away_score >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.world_cup_results (
  match_no integer primary key,
  home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.fun_results (
  id text primary key default 'main' check (id = 'main'),
  champion text not null default '',
  golden_boot text not null default '',
  first_red_card_team text not null default '',
  total_goals integer,
  updated_at timestamptz not null default now()
);

create table if not exists public.live_match_states (
  match_id text primary key,
  fixture_id text,
  display_home_score integer,
  display_away_score integer,
  match_phase text not null default 'pre_match',
  match_clock text,
  reg_home_score integer,
  reg_away_score integer,
  regulation_final_available boolean not null default false,
  last_synced_at timestamptz not null default now(),
  tracking_until timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists idx_live_match_states_fixture_id on public.live_match_states(fixture_id);
create index if not exists idx_live_match_states_tracking_until on public.live_match_states(tracking_until);

insert into public.fun_results (id)
values ('main')
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.predictions enable row level security;
alter table public.fun_predictions enable row level security;
alter table public.match_overrides enable row level security;
alter table public.world_cup_results enable row level security;
alter table public.fun_results enable row level security;
alter table public.live_match_states enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

create or replace function public.admin_set_match_result(
  p_match_id text,
  p_match_no integer,
  p_home_score integer,
  p_away_score integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  insert into public.match_overrides (match_id, status, home_score, away_score, updated_at)
  values (p_match_id, 'settled', greatest(p_home_score, 0), greatest(p_away_score, 0), now())
  on conflict (match_id) do update
  set
    status = excluded.status,
    home_score = excluded.home_score,
    away_score = excluded.away_score,
    updated_at = excluded.updated_at;

  insert into public.world_cup_results (match_no, home_score, away_score, updated_at)
  values (p_match_no, greatest(p_home_score, 0), greatest(p_away_score, 0), now())
  on conflict (match_no) do update
  set
    home_score = excluded.home_score,
    away_score = excluded.away_score,
    updated_at = excluded.updated_at;
end;
$$;

grant execute on function public.admin_set_match_result(text, integer, integer, integer) to authenticated;

create or replace function public.admin_clear_match_result(
  p_match_id text,
  p_match_no integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  delete from public.match_overrides
  where match_id = p_match_id;

  delete from public.world_cup_results
  where match_no = p_match_no;
end;
$$;

grant execute on function public.admin_clear_match_result(text, integer) to authenticated;

create or replace function public.admin_set_match_lock(
  p_match_id text,
  p_status text,
  p_home_score integer,
  p_away_score integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  if p_status not in ('open', 'closed') then
    raise exception 'Invalid status: %', p_status;
  end if;

  insert into public.match_overrides (match_id, status, home_score, away_score, updated_at)
  values (p_match_id, p_status, p_home_score, p_away_score, now())
  on conflict (match_id) do update
  set
    status = excluded.status,
    home_score = excluded.home_score,
    away_score = excluded.away_score,
    updated_at = excluded.updated_at;
end;
$$;

grant execute on function public.admin_set_match_lock(text, text, integer, integer) to authenticated;

create or replace function public.admin_save_fun_results(
  p_champion text,
  p_golden_boot text,
  p_first_red_card_team text,
  p_total_goals integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  insert into public.fun_results (id, champion, golden_boot, first_red_card_team, total_goals, updated_at)
  values ('main', coalesce(p_champion, ''), coalesce(p_golden_boot, ''), coalesce(p_first_red_card_team, ''), p_total_goals, now())
  on conflict (id) do update
  set
    champion = excluded.champion,
    golden_boot = excluded.golden_boot,
    first_red_card_team = excluded.first_red_card_team,
    total_goals = excluded.total_goals,
    updated_at = excluded.updated_at;
end;
$$;

grant execute on function public.admin_save_fun_results(text, text, text, integer) to authenticated;

drop policy if exists "profiles readable by signed in users" on public.profiles;
create policy "profiles readable by signed in users"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid() and is_admin = false);

create or replace function public.update_my_profile(
  p_username text,
  p_avatar_emoji text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
begin
  update public.profiles
  set
    username = nullif(trim(p_username), ''),
    avatar_emoji = coalesce(nullif(trim(p_avatar_emoji), ''), '⚽')
  where id = auth.uid()
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profile not found';
  end if;

  return updated_profile;
end;
$$;

grant execute on function public.update_my_profile(text, text) to authenticated;

create or replace function public.admin_set_user_camp(
  p_user_id uuid,
  p_camp_id text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  if p_camp_id is not null and p_camp_id not in ('A', 'B') then
    raise exception 'Invalid camp_id: %', p_camp_id;
  end if;

  update public.profiles
  set camp_id = p_camp_id
  where id = p_user_id
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profile not found';
  end if;

  return updated_profile;
end;
$$;

grant execute on function public.admin_set_user_camp(uuid, text) to authenticated;

create or replace function public.admin_set_user_admin(
  p_user_id uuid,
  p_is_admin boolean
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
    raise exception 'Admin access required';
  end if;

  if coalesce(p_is_admin, false) = false then
    select count(*)
    into admin_count
    from public.profiles
    where is_admin = true;

    if admin_count <= 1 then
      perform 1
      from public.profiles
      where id = p_user_id
        and is_admin = true;

      if found then
        raise exception 'At least one admin account must remain';
      end if;
    end if;
  end if;

  update public.profiles
  set is_admin = coalesce(p_is_admin, false)
  where id = p_user_id
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profile not found';
  end if;

  return updated_profile;
end;
$$;

grant execute on function public.admin_set_user_admin(uuid, boolean) to authenticated;

drop policy if exists "predictions readable by signed in users" on public.predictions;
create policy "predictions readable by signed in users"
on public.predictions for select
to authenticated
using (true);

drop policy if exists "users insert own predictions" on public.predictions;
create policy "users insert own predictions"
on public.predictions for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "users update own predictions" on public.predictions;
create policy "users update own predictions"
on public.predictions for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "fun predictions readable by signed in users" on public.fun_predictions;
create policy "fun predictions readable by signed in users"
on public.fun_predictions for select
to authenticated
using (true);

drop policy if exists "users upsert own fun predictions" on public.fun_predictions;
create policy "users upsert own fun predictions"
on public.fun_predictions for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "users update own fun predictions" on public.fun_predictions;
create policy "users update own fun predictions"
on public.fun_predictions for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "match overrides readable by signed in users" on public.match_overrides;
create policy "match overrides readable by signed in users"
on public.match_overrides for select
to authenticated
using (true);

drop policy if exists "admins write match overrides" on public.match_overrides;
create policy "admins write match overrides"
on public.match_overrides for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "world cup results readable by signed in users" on public.world_cup_results;
create policy "world cup results readable by signed in users"
on public.world_cup_results for select
to authenticated
using (true);

drop policy if exists "admins write world cup results" on public.world_cup_results;
create policy "admins write world cup results"
on public.world_cup_results for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "fun results readable by signed in users" on public.fun_results;
create policy "fun results readable by signed in users"
on public.fun_results for select
to authenticated
using (true);

drop policy if exists "live match states readable by signed in users" on public.live_match_states;
create policy "live match states readable by signed in users"
on public.live_match_states for select
to authenticated
using (true);

drop policy if exists "admins write fun results" on public.fun_results;
create policy "admins write fun results"
on public.fun_results for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Bootstrap an initial admin after signup, then manage additional admins in-app.
update public.profiles
set is_admin = true
where lower(email) = 'oscarluo119@gmail.com';

create table if not exists public.achievement_definitions (
  id text primary key,
  name text not null,
  description text not null,
  rarity text not null check (rarity in ('普通', '稀有', '史诗', '传说', '神话')),
  category text not null,
  hidden boolean not null default false,
  target_value integer,
  metric text not null default 'generic',
  evaluation_mode text not null default 'derived',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null references public.achievement_definitions(id) on delete cascade,
  current_value integer not null default 0,
  target_value integer not null default 1,
  achieved boolean not null default false,
  achieved_at timestamptz,
  source text not null default 'system',
  match_id text,
  snapshot_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create table if not exists public.achievement_progress_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text references public.achievement_definitions(id) on delete cascade,
  match_id text,
  snapshot_key text not null,
  snapshot_value integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_achievements_user_id on public.user_achievements(user_id);
create index if not exists idx_user_achievements_achievement_id on public.user_achievements(achievement_id);
create index if not exists idx_achievement_progress_snapshots_user_id on public.achievement_progress_snapshots(user_id);
create index if not exists idx_achievement_progress_snapshots_match_id on public.achievement_progress_snapshots(match_id);

alter table public.achievement_definitions enable row level security;
alter table public.user_achievements enable row level security;
alter table public.achievement_progress_snapshots enable row level security;

drop policy if exists "achievement definitions readable by signed in users" on public.achievement_definitions;
create policy "achievement definitions readable by signed in users"
on public.achievement_definitions for select
to authenticated
using (true);

drop policy if exists "admins write achievement definitions" on public.achievement_definitions;
create policy "admins write achievement definitions"
on public.achievement_definitions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "user achievements readable by signed in users" on public.user_achievements;
create policy "user achievements readable by signed in users"
on public.user_achievements for select
to authenticated
using (true);

drop policy if exists "admins write user achievements" on public.user_achievements;
create policy "admins write user achievements"
on public.user_achievements for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "achievement snapshots readable by signed in users" on public.achievement_progress_snapshots;
create policy "achievement snapshots readable by signed in users"
on public.achievement_progress_snapshots for select
to authenticated
using (true);

drop policy if exists "admins write achievement snapshots" on public.achievement_progress_snapshots;
create policy "admins write achievement snapshots"
on public.achievement_progress_snapshots for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.admin_upsert_user_achievement(
  p_user_id uuid,
  p_achievement_id text,
  p_current_value integer,
  p_target_value integer,
  p_achieved boolean,
  p_achieved_at timestamptz,
  p_match_id text,
  p_snapshot_ref text,
  p_source text,
  p_metadata jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  insert into public.user_achievements (
    user_id,
    achievement_id,
    current_value,
    target_value,
    achieved,
    achieved_at,
    match_id,
    snapshot_ref,
    source,
    metadata,
    updated_at
  )
  values (
    p_user_id,
    p_achievement_id,
    greatest(coalesce(p_current_value, 0), 0),
    greatest(coalesce(p_target_value, 1), 1),
    coalesce(p_achieved, false),
    p_achieved_at,
    p_match_id,
    p_snapshot_ref,
    coalesce(p_source, 'system'),
    coalesce(p_metadata, '{}'::jsonb),
    now()
  )
  on conflict (user_id, achievement_id) do update
  set
    current_value = excluded.current_value,
    target_value = excluded.target_value,
    achieved = excluded.achieved,
    achieved_at = coalesce(public.user_achievements.achieved_at, excluded.achieved_at),
    match_id = excluded.match_id,
    snapshot_ref = excluded.snapshot_ref,
    source = excluded.source,
    metadata = excluded.metadata,
    updated_at = excluded.updated_at;
end;
$$;

grant execute on function public.admin_upsert_user_achievement(uuid, text, integer, integer, boolean, timestamptz, text, text, text, jsonb) to authenticated;

create or replace function public.admin_store_achievement_snapshot(
  p_user_id uuid,
  p_achievement_id text,
  p_match_id text,
  p_snapshot_key text,
  p_snapshot_value integer,
  p_metadata jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  insert into public.achievement_progress_snapshots (
    user_id,
    achievement_id,
    match_id,
    snapshot_key,
    snapshot_value,
    metadata
  )
  values (
    p_user_id,
    p_achievement_id,
    p_match_id,
    p_snapshot_key,
    p_snapshot_value,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

grant execute on function public.admin_store_achievement_snapshot(uuid, text, text, text, integer, jsonb) to authenticated;

create or replace function public.admin_reset_achievement_state()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  delete from public.achievement_progress_snapshots;
  delete from public.user_achievements;
end;
$$;

grant execute on function public.admin_reset_achievement_state() to authenticated;
