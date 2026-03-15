-- Add game result columns
ALTER TABLE public.games ADD COLUMN score_us integer;
ALTER TABLE public.games ADD COLUMN score_them integer;
