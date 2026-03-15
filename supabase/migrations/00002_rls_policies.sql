-- Enable RLS on all tables
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.games enable row level security;
alter table public.lineups enable row level security;
alter table public.lineup_entries enable row level security;
alter table public.player_position_history enable row level security;
alter table public.player_batting_history enable row level security;

-- Teams
create policy "Users manage own teams"
  on public.teams for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Players
create policy "Users manage own players"
  on public.players for all
  using (team_id in (select id from public.teams where user_id = auth.uid()))
  with check (team_id in (select id from public.teams where user_id = auth.uid()));

-- Games
create policy "Users manage own games"
  on public.games for all
  using (team_id in (select id from public.teams where user_id = auth.uid()))
  with check (team_id in (select id from public.teams where user_id = auth.uid()));

-- Lineups
create policy "Users manage own lineups"
  on public.lineups for all
  using (team_id in (select id from public.teams where user_id = auth.uid()))
  with check (team_id in (select id from public.teams where user_id = auth.uid()));

-- Lineup Entries
create policy "Users manage own lineup entries"
  on public.lineup_entries for all
  using (lineup_id in (
    select l.id from public.lineups l
    join public.teams t on l.team_id = t.id
    where t.user_id = auth.uid()
  ))
  with check (lineup_id in (
    select l.id from public.lineups l
    join public.teams t on l.team_id = t.id
    where t.user_id = auth.uid()
  ));

-- Position History
create policy "Users manage own position history"
  on public.player_position_history for all
  using (team_id in (select id from public.teams where user_id = auth.uid()))
  with check (team_id in (select id from public.teams where user_id = auth.uid()));

-- Batting History
create policy "Users manage own batting history"
  on public.player_batting_history for all
  using (team_id in (select id from public.teams where user_id = auth.uid()))
  with check (team_id in (select id from public.teams where user_id = auth.uid()));
