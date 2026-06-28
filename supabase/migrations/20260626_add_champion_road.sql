create table if not exists public.champion_road_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  submitted_at timestamptz not null default timezone('utc', now()),
  locked_at timestamptz,
  unique (user_id)
);

create table if not exists public.champion_road_prediction_items (
  prediction_id uuid not null references public.champion_road_predictions (id) on delete cascade,
  round text not null,
  match_no integer not null check (match_no between 73 and 104),
  pick_slot text not null check (pick_slot in ('home', 'away')),
  pick_target text not null,
  primary key (prediction_id, match_no)
);

alter table public.champion_road_predictions enable row level security;
alter table public.champion_road_prediction_items enable row level security;

grant select, insert, update on table public.champion_road_predictions to authenticated;
grant select, insert, update, delete on table public.champion_road_prediction_items to authenticated;

drop policy if exists "champion road predictions are visible to authenticated users" on public.champion_road_predictions;
create policy "champion road predictions are visible to authenticated users"
on public.champion_road_predictions
for select
to authenticated
using (true);

drop policy if exists "users can insert their own champion road predictions" on public.champion_road_predictions;
create policy "users can insert their own champion road predictions"
on public.champion_road_predictions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update their own champion road predictions" on public.champion_road_predictions;
create policy "users can update their own champion road predictions"
on public.champion_road_predictions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "champion road items are visible to authenticated users" on public.champion_road_prediction_items;
create policy "champion road items are visible to authenticated users"
on public.champion_road_prediction_items
for select
to authenticated
using (true);

drop policy if exists "users can insert their own champion road items" on public.champion_road_prediction_items;
create policy "users can insert their own champion road items"
on public.champion_road_prediction_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.champion_road_predictions
    where id = prediction_id
      and user_id = auth.uid()
  )
);

drop policy if exists "users can update their own champion road items" on public.champion_road_prediction_items;
create policy "users can update their own champion road items"
on public.champion_road_prediction_items
for update
to authenticated
using (
  exists (
    select 1
    from public.champion_road_predictions
    where id = prediction_id
      and user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.champion_road_predictions
    where id = prediction_id
      and user_id = auth.uid()
  )
);

drop policy if exists "users can delete their own champion road items" on public.champion_road_prediction_items;
create policy "users can delete their own champion road items"
on public.champion_road_prediction_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.champion_road_predictions
    where id = prediction_id
      and user_id = auth.uid()
  )
);
