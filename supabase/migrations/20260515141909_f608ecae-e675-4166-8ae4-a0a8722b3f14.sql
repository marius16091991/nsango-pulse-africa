
ALTER TABLE public.site_popups
  ADD COLUMN IF NOT EXISTS auto_close_seconds integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS animation_duration integer NOT NULL DEFAULT 300;

ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
ALTER TABLE public.reactions REPLICA IDENTITY FULL;
