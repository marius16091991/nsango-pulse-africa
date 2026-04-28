-- Comptes sociaux configurés (affichés dans le footer)
CREATE TABLE public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network TEXT NOT NULL, -- facebook, x, linkedin, whatsapp, telegram, instagram, tiktok, youtube
  handle TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  icon TEXT DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active accounts viewable by all" ON public.social_accounts
  FOR SELECT USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage social accounts" ON public.social_accounts
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- File de publications
CREATE TABLE public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  networks TEXT[] NOT NULL DEFAULT '{}',
  message TEXT NOT NULL DEFAULT '',
  image_url TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, scheduled, published, failed
  utm_campaign TEXT DEFAULT '',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage social posts" ON public.social_posts
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tracking des clics par réseau (UTM)
CREATE TABLE public.social_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network TEXT NOT NULL,
  article_id UUID,
  post_id UUID REFERENCES public.social_posts(id) ON DELETE SET NULL,
  visitor_ip TEXT,
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log clicks" ON public.social_clicks
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins read clicks" ON public.social_clicks
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_social_clicks_network ON public.social_clicks(network);
CREATE INDEX idx_social_clicks_article ON public.social_clicks(article_id);
CREATE INDEX idx_social_posts_status ON public.social_posts(status);

-- Seed: réseaux par défaut désactivés (l'admin remplit les URLs)
INSERT INTO public.social_accounts (network, handle, url, sort_order, active) VALUES
  ('facebook', 'NsangoMag', 'https://facebook.com/NsangoMag', 1, false),
  ('x', '@NsangoMag', 'https://x.com/NsangoMag', 2, false),
  ('linkedin', 'Nsango Magazine', 'https://linkedin.com/company/nsango-magazine', 3, false),
  ('whatsapp', '+237 6XX XXX XXX', 'https://wa.me/2376XXXXXXXX', 4, false),
  ('telegram', '@NsangoMag', 'https://t.me/NsangoMag', 5, false),
  ('instagram', '@nsangomag', 'https://instagram.com/nsangomag', 6, false),
  ('tiktok', '@nsangomag', 'https://tiktok.com/@nsangomag', 7, false),
  ('youtube', 'Nsango Magazine', 'https://youtube.com/@nsangomag', 8, false);