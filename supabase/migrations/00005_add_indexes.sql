-- Performance indexes for scale
-- These prevent sequential scans on frequently queried columns

-- Players: always filtered by team, often by active status
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_team_active ON players(team_id, active);

-- Games: always filtered by team, sorted by date
CREATE INDEX IF NOT EXISTS idx_games_team_id ON games(team_id);
CREATE INDEX IF NOT EXISTS idx_games_team_date ON games(team_id, game_date);

-- Lineups: looked up by game_id (1:1 per label)
CREATE INDEX IF NOT EXISTS idx_lineups_game_id ON lineups(game_id);
CREATE INDEX IF NOT EXISTS idx_lineups_team_id ON lineups(team_id);

-- Lineup entries: always filtered by lineup_id
CREATE INDEX IF NOT EXISTS idx_lineup_entries_lineup_id ON lineup_entries(lineup_id);

-- Position history: filtered by team for season views
CREATE INDEX IF NOT EXISTS idx_position_history_team ON player_position_history(team_id);
CREATE INDEX IF NOT EXISTS idx_position_history_player ON player_position_history(player_id);

-- Batting history: filtered by team
CREATE INDEX IF NOT EXISTS idx_batting_history_team ON player_batting_history(team_id);
CREATE INDEX IF NOT EXISTS idx_batting_history_player ON player_batting_history(player_id);

-- Teams: RLS checks user_id on every query
CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id);
