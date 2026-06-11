create table if not exists public.sponsor_predictions (
  event_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  predicted_total_seconds integer not null check (predicted_total_seconds >= 0),
  submitted_at timestamptz not null default timezone('utc', now()),
  primary key (event_id, user_id)
);

create table if not exists public.sponsor_prediction_results (
  event_id text primary key,
  resolved_match_id text not null,
  actual_total_seconds integer not null check (actual_total_seconds >= 0),
  sponsor_name text not null default '',
  resolved_at timestamptz not null default timezone('utc', now())
);

alter table public.sponsor_predictions enable row level security;
alter table public.sponsor_prediction_results enable row level security;

grant select, insert, update on table public.sponsor_predictions to authenticated;
grant select on table public.sponsor_prediction_results to authenticated;

drop policy if exists "sponsor predictions are visible to authenticated users" on public.sponsor_predictions;
create policy "sponsor predictions are visible to authenticated users"
on public.sponsor_predictions
for select
to authenticated
using (true);

drop policy if exists "users can insert their own sponsor predictions" on public.sponsor_predictions;
create policy "users can insert their own sponsor predictions"
on public.sponsor_predictions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update their own sponsor predictions" on public.sponsor_predictions;
create policy "users can update their own sponsor predictions"
on public.sponsor_predictions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "sponsor prediction results are visible to authenticated users" on public.sponsor_prediction_results;
create policy "sponsor prediction results are visible to authenticated users"
on public.sponsor_prediction_results
for select
to authenticated
using (true);

create or replace function public.admin_save_sponsor_prediction_result(
  p_event_id text,
  p_resolved_match_id text,
  p_actual_total_seconds integer,
  p_sponsor_name text default ''
)
returns public.sponsor_prediction_results
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.sponsor_prediction_results;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  ) then
    raise exception 'Admin access required';
  end if;

  insert into public.sponsor_prediction_results (
    event_id,
    resolved_match_id,
    actual_total_seconds,
    sponsor_name,
    resolved_at
  )
  values (
    p_event_id,
    p_resolved_match_id,
    p_actual_total_seconds,
    coalesce(p_sponsor_name, ''),
    timezone('utc', now())
  )
  on conflict (event_id) do update
  set
    resolved_match_id = excluded.resolved_match_id,
    actual_total_seconds = excluded.actual_total_seconds,
    sponsor_name = excluded.sponsor_name,
    resolved_at = excluded.resolved_at
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function public.admin_save_sponsor_prediction_result(text, text, integer, text) to authenticated;
