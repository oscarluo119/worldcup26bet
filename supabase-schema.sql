create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null,
  avatar_emoji text not null default '⚽',
  is_admin boolean not null default false,
  joined_at timestamptz not null default now()
);

alter table public.profiles
add column if not exists avatar_emoji text not null default '⚽';

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

insert into public.fun_results (id)
values ('main')
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.predictions enable row level security;
alter table public.fun_predictions enable row level security;
alter table public.match_overrides enable row level security;
alter table public.world_cup_results enable row level security;
alter table public.fun_results enable row level security;

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

drop policy if exists "admins write fun results" on public.fun_results;
create policy "admins write fun results"
on public.fun_results for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Run this after oscarluo119@gmail.com has registered.
update public.profiles
set is_admin = true
where lower(email) = 'oscarluo119@gmail.com';
