alter table public.match_overrides
add column if not exists advancing_side text check (advancing_side in ('home', 'away'));

alter table public.world_cup_results
add column if not exists advancing_side text check (advancing_side in ('home', 'away'));

drop function if exists public.admin_set_match_result(text, integer, integer, integer);

create or replace function public.admin_set_match_result(
  p_match_id text,
  p_match_no integer,
  p_home_score integer,
  p_away_score integer,
  p_advancing_side text default null
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

  insert into public.match_overrides (match_id, status, home_score, away_score, advancing_side, updated_at)
  values (
    p_match_id,
    'settled',
    greatest(p_home_score, 0),
    greatest(p_away_score, 0),
    case when p_advancing_side in ('home', 'away') then p_advancing_side else null end,
    now()
  )
  on conflict (match_id) do update
  set
    status = excluded.status,
    home_score = excluded.home_score,
    away_score = excluded.away_score,
    advancing_side = excluded.advancing_side,
    updated_at = excluded.updated_at;

  insert into public.world_cup_results (match_no, home_score, away_score, advancing_side, updated_at)
  values (
    p_match_no,
    greatest(p_home_score, 0),
    greatest(p_away_score, 0),
    case when p_advancing_side in ('home', 'away') then p_advancing_side else null end,
    now()
  )
  on conflict (match_no) do update
  set
    home_score = excluded.home_score,
    away_score = excluded.away_score,
    advancing_side = excluded.advancing_side,
    updated_at = excluded.updated_at;
end;
$$;

grant execute on function public.admin_set_match_result(text, integer, integer, integer, text) to authenticated;

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

  insert into public.match_overrides (match_id, status, home_score, away_score, advancing_side, updated_at)
  values (p_match_id, p_status, p_home_score, p_away_score, null, now())
  on conflict (match_id) do update
  set
    status = excluded.status,
    home_score = excluded.home_score,
    away_score = excluded.away_score,
    advancing_side = excluded.advancing_side,
    updated_at = excluded.updated_at;
end;
$$;
