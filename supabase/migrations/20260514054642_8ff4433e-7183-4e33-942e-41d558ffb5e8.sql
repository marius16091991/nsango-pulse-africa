-- Table principale des pop-ups / tooltips / bannières
CREATE TABLE public.site_popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  display_type text NOT NULL DEFAULT 'modal', -- modal | banner | tooltip | toast | corner
  position text NOT NULL DEFAULT 'center', -- center | top | bottom | top-left | top-right | bottom-left | bottom-right | left | right
  
  -- Design
  background_color text NOT NULL DEFAULT '#1a1a1a',
  text_color text NOT NULL DEFAULT '#ffffff',
  accent_color text NOT NULL DEFAULT '#D4A017',
  width text NOT NULL DEFAULT 'md', -- sm | md | lg | xl | full
  border_radius text NOT NULL DEFAULT 'lg', -- none | sm | md | lg | xl | full
  image_url text DEFAULT '',
  show_close_button boolean NOT NULL DEFAULT true,
  overlay boolean NOT NULL DEFAULT true,
  animation text NOT NULL DEFAULT 'fade', -- fade | slide | zoom | none
  
  -- CTA
  cta_label text DEFAULT '',
  cta_url text DEFAULT '',
  cta_style text NOT NULL DEFAULT 'primary', -- primary | outline | ghost
  
  -- Ciblage et déclencheur
  target_pages text[] NOT NULL DEFAULT '{}', -- ex: ['/'] [vide = toutes]
  exclude_pages text[] NOT NULL DEFAULT '{}',
  trigger text NOT NULL DEFAULT 'load', -- load | delay | scroll | exit_intent | click
  trigger_value integer NOT NULL DEFAULT 0, -- secondes ou %
  frequency text NOT NULL DEFAULT 'once_per_session', -- always | once_per_session | once_per_day | once_per_user
  audience text NOT NULL DEFAULT 'all', -- all | guests | authenticated | premium
  
  -- Programmation
  start_at timestamptz,
  end_at timestamptz,
  status text NOT NULL DEFAULT 'draft', -- draft | active | paused | archived
  priority integer NOT NULL DEFAULT 0,
  
  -- Stats agrégées
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  dismissals integer NOT NULL DEFAULT 0,
  
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_site_popups_status ON public.site_popups(status);
CREATE INDEX idx_site_popups_priority ON public.site_popups(priority DESC);

ALTER TABLE public.site_popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active popups viewable by everyone"
  ON public.site_popups FOR SELECT
  USING (
    status = 'active'
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'editor'::app_role)
  );

CREATE POLICY "Admins manage popups"
  ON public.site_popups FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_site_popups_updated
  BEFORE UPDATE ON public.site_popups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Événements (impressions / clics / fermetures)
CREATE TABLE public.popup_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_id uuid NOT NULL REFERENCES public.site_popups(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- impression | click | dismiss
  page_path text DEFAULT '',
  user_id uuid,
  visitor_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_popup_events_popup ON public.popup_events(popup_id, created_at DESC);

ALTER TABLE public.popup_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log popup events"
  ON public.popup_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    popup_id IS NOT NULL
    AND event_type = ANY (ARRAY['impression','click','dismiss'])
    AND (page_path IS NULL OR length(page_path) <= 500)
  );

CREATE POLICY "Admins read popup events"
  ON public.popup_events FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger pour incrémenter les compteurs
CREATE OR REPLACE FUNCTION public.bump_popup_counters()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.event_type = 'impression' THEN
    UPDATE public.site_popups SET impressions = impressions + 1 WHERE id = NEW.popup_id;
  ELSIF NEW.event_type = 'click' THEN
    UPDATE public.site_popups SET clicks = clicks + 1 WHERE id = NEW.popup_id;
  ELSIF NEW.event_type = 'dismiss' THEN
    UPDATE public.site_popups SET dismissals = dismissals + 1 WHERE id = NEW.popup_id;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_bump_popup_counters
  AFTER INSERT ON public.popup_events
  FOR EACH ROW EXECUTE FUNCTION public.bump_popup_counters();