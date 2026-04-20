-- Table pages: meta-info per page
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT DEFAULT '',
  visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pages viewable by everyone" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Admins can insert pages" ON public.pages FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update pages" ON public.pages FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete pages" ON public.pages FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table page_sections: each section of a page
CREATE TABLE public.page_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  section_type TEXT NOT NULL DEFAULT 'generic',
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  body TEXT DEFAULT '',
  media_url TEXT DEFAULT '',
  cta_label TEXT DEFAULT '',
  cta_url TEXT DEFAULT '',
  content_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  style JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_slug, section_key)
);

ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sections viewable by everyone" ON public.page_sections FOR SELECT USING (true);
CREATE POLICY "Admins can insert sections" ON public.page_sections FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update sections" ON public.page_sections FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete sections" ON public.page_sections FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_page_sections_updated_at BEFORE UPDATE ON public.page_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_page_sections_page_slug ON public.page_sections(page_slug, sort_order);

-- Seed pages
INSERT INTO public.pages (slug, title, meta_description, sort_order) VALUES
  ('home', 'Accueil', 'Nsango Magazine — les visages qui inspirent l''Afrique', 1),
  ('actualites', 'Actualités', 'Toute l''actualité du continent africain', 2),
  ('business', 'Business', 'Économie et entrepreneuriat africain', 3),
  ('culture', 'Culture', 'Culture et arts africains', 4),
  ('interviews', 'Interviews', 'Rencontres avec les personnalités africaines', 5),
  ('portraits', 'Portraits', 'Portraits inspirants', 6),
  ('podcasts', 'Podcasts', 'Nos podcasts exclusifs', 7),
  ('videos', 'Vidéos', 'Reportages et vidéos', 8),
  ('magazine', 'Magazine', 'Le magazine numérique premium', 9),
  ('evenements', 'Événements', 'Événements et rencontres', 10),
  ('apropos', 'À propos', 'Découvrez Nsango Magazine', 11),
  ('premium', 'Premium', 'Abonnements premium', 12);

-- Seed home sections
INSERT INTO public.page_sections (page_slug, section_key, section_type, title, subtitle, body, sort_order, style) VALUES
  ('home', 'hero', 'hero', 'Les visages qui inspirent l''Afrique', 'Le premier magazine numérique premium dédié aux personnalités influentes du continent', '', 1, '{"layout":"centered","accent":"gold"}'::jsonb),
  ('home', 'featured_articles', 'articles_grid', 'À la une', 'Les articles incontournables du moment', '', 2, '{"layout":"grid","columns":3,"limit":6}'::jsonb),
  ('home', 'business', 'articles_grid', 'Business', 'Économie et entrepreneuriat', '', 3, '{"layout":"grid","columns":3,"limit":3}'::jsonb),
  ('home', 'interviews', 'articles_grid', 'Interviews', 'Rencontres exclusives', '', 4, '{"layout":"grid","columns":2,"limit":4}'::jsonb),
  ('home', 'videos', 'videos_grid', 'Vidéos', 'Nos derniers reportages', '', 5, '{"layout":"grid","columns":3,"limit":3}'::jsonb),
  ('home', 'newsletter', 'newsletter', 'Restez informé', 'Recevez chaque semaine notre sélection', '', 6, '{"accent":"gold"}'::jsonb);