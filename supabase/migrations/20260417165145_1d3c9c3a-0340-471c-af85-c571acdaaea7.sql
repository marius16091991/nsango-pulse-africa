-- Table for videos (YouTube embeds or uploaded files)
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  source TEXT NOT NULL DEFAULT 'upload', -- 'youtube' | 'upload'
  url TEXT NOT NULL, -- YouTube URL/ID or storage URL
  thumbnail_url TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Reportages',
  duration TEXT DEFAULT '',
  views INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published', -- 'draft' | 'published' | 'scheduled'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  program_slot TEXT, -- e.g. 'morning', 'prime', 'night' for TV channel grid
  featured BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published videos viewable by everyone"
  ON public.videos FOR SELECT
  USING (status = 'published' OR auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Editors and admins can insert videos"
  ON public.videos FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Editors and admins can update videos"
  ON public.videos FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Only admins can delete videos"
  ON public.videos FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_videos_status_created ON public.videos(status, created_at DESC);
CREATE INDEX idx_videos_program_slot ON public.videos(program_slot);