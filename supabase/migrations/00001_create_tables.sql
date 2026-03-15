-- Teams
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  season text,
  age_group text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Players
create table public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  jersey_number integer,
  bats text check (bats in ('L','R','S')),
  throws text check (throws in ('L','R')),
  preferred_positions text[] default '{}',
  active boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Games
create table public.games (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  game_date date not null,
  opponent text,
  is_home boolean default true,
  location text,
  game_type text default 'game' check (game_type in ('game','practice','scrimmage','tournament')),
  notes text,
  gamechanger_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Lineups
create table public.lineups (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  label text default 'Starting',
  is_final boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(game_id, label)
);

-- Lineup Entries
create table public.lineup_entries (
  id uuid primary key default gen_random_uuid(),
  lineup_id uuid not null references public.lineups(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  batting_order integer not null check (batting_order between 1 and 15),
  field_position text not null check (field_position in (
    'P','C','1B','2B','3B','SS','LF','CF','RF','DH','BN'
  )),
  inning_start integer default 1,
  inning_end integer,
  created_at timestamptz default now(),
  unique(lineup_id, batting_order),
  unique(lineup_id, player_id)
);

-- Partial unique index: one player per field position (excluding bench)
create unique index idx_unique_field_position
  on public.lineup_entries(lineup_id, field_position)
  where field_position != 'BN';

-- Player Position History (denormalized)
create table public.player_position_history (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  field_position text not null,
  times_played integer default 0,
  unique(player_id, field_position)
);

-- Player Batting History (denormalized)
create table public.player_batting_history (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  batting_order integer not null check (batting_order between 1 and 15),
  times_batted integer default 0,
  hits integer default 0,
  at_bats integer default 0,
  created_at timestamptz default now(),
  unique(player_id, batting_order)
);
