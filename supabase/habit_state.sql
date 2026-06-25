-- ============================================================================
-- Vivartam Founder OS — shared Habit / Rule-of-3 state
-- ----------------------------------------------------------------------------
-- Run this ONCE in the Supabase dashboard → SQL Editor (project
-- gqjyuvxuyhedaauxibii). It creates the key→value table the app syncs to, with
-- row-level security for signed-in users and realtime enabled so changes show
-- up live on every device / for both founders.
--
-- Key format used by the app (see "Vivartam Milestones.dc.html"):
--   status:<founder>:<habitId>   -> "wip" | "done"   (absent = "todo")
--   img:<founder>:<habitId>      -> data-URL of a custom photo
--   name:<founder>:<habitId>     -> custom habit title
--   name:shared:<habitId>        -> custom title for Rule-of-1·1·1 habits
--                                    (shared by Vivek & Mirat)
--   r3:<founder>:<index>         -> custom Rule-of-3 text
--   r3done:<founder>:<index>     -> true (Rule-of-3 item completed)
-- ============================================================================

create table if not exists public.habit_state (
  k          text primary key,
  v          jsonb,
  updated_at timestamptz not null default now()
);

alter table public.habit_state enable row level security;

-- Internal two-founder tool: any signed-in user may read/write the shared state.
drop policy if exists "habit_state read"   on public.habit_state;
drop policy if exists "habit_state insert" on public.habit_state;
drop policy if exists "habit_state update" on public.habit_state;
drop policy if exists "habit_state delete" on public.habit_state;

create policy "habit_state read"   on public.habit_state for select to authenticated using (true);
create policy "habit_state insert" on public.habit_state for insert to authenticated with check (true);
create policy "habit_state update" on public.habit_state for update to authenticated using (true) with check (true);
create policy "habit_state delete" on public.habit_state for delete to authenticated using (true);

-- Keep updated_at fresh on writes.
create or replace function public.habit_state_touch() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
drop trigger if exists habit_state_touch on public.habit_state;
create trigger habit_state_touch before update on public.habit_state
  for each row execute function public.habit_state_touch();

-- Enable realtime (safe to re-run).
do $$ begin
  alter publication supabase_realtime add table public.habit_state;
exception when duplicate_object then null; end $$;
