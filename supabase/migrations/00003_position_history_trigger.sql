-- Trigger to auto-update position and batting history when lineup is finalized
create or replace function public.update_position_history()
returns trigger as $$
declare
  v_is_final boolean;
  v_team_id uuid;
begin
  select is_final, team_id into v_is_final, v_team_id
  from public.lineups where id = NEW.lineup_id;

  if not v_is_final then
    return NEW;
  end if;

  insert into public.player_position_history (player_id, team_id, field_position, times_played)
  values (NEW.player_id, v_team_id, NEW.field_position, 1)
  on conflict (player_id, field_position)
  do update set times_played = player_position_history.times_played + 1;

  insert into public.player_batting_history (player_id, team_id, batting_order, times_batted)
  values (NEW.player_id, v_team_id, NEW.batting_order, 1)
  on conflict (player_id, batting_order)
  do update set times_batted = player_batting_history.times_batted + 1;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_lineup_entry_finalized
  after insert on public.lineup_entries
  for each row
  execute function public.update_position_history();
