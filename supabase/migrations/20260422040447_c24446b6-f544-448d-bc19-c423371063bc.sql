
-- ============ TABLE 1 : seo_settings (clé/valeur global) ============
CREATE TABLE public.seo_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SEO settings viewable by everyone"
  ON public.seo_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins manage seo_settings"
  ON public.seo_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ TABLE 2 : seo_overrides (par route / par contenu) ============
CREATE TABLE public.seo_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_pattern text NOT NULL,            -- ex: '/', '/business', '/article/:id'
  target_type text DEFAULT NULL,          -- 'article' | 'video' | 'page' | null
  target_id uuid DEFAULT NULL,            -- id de l'élément (si applicable)
  title text DEFAULT '',
  description text DEFAULT '',
  og_image text DEFAULT '',
  canonical text DEFAULT '',
  robots text DEFAULT '',                 -- 'index,follow' | 'noindex' | ...
  keywords text DEFAULT '',
  jsonld jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_seo_overrides_route ON public.seo_overrides(route_pattern) WHERE active = true;
CREATE INDEX idx_seo_overrides_target ON public.seo_overrides(target_type, target_id) WHERE active = true;

ALTER TABLE public.seo_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SEO overrides viewable by everyone"
  ON public.seo_overrides FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage seo_overrides"
  ON public.seo_overrides FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_seo_overrides_updated_at
  BEFORE UPDATE ON public.seo_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TABLE 3 : seo_redirects (301/302) ============
CREATE TABLE public.seo_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path text NOT NULL UNIQUE,
  to_path text NOT NULL,
  status_code integer NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302, 307, 308)),
  active boolean NOT NULL DEFAULT true,
  hits integer NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_seo_redirects_from ON public.seo_redirects(from_path) WHERE active = true;

ALTER TABLE public.seo_redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active redirects viewable by everyone"
  ON public.seo_redirects FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage seo_redirects"
  ON public.seo_redirects FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_seo_redirects_updated_at
  BEFORE UPDATE ON public.seo_redirects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Compteur de hits (RPC publique pour incrémenter)
CREATE OR REPLACE FUNCTION public.increment_redirect_hit(_from text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.seo_redirects SET hits = hits + 1 WHERE from_path = _from AND active = true;
$$;

-- ============ Seed defaults ============
INSERT INTO public.seo_settings (key, value, label, category) VALUES
  -- Général
  ('default_title', 'Nsango Magazine — Les visages qui inspirent l''Afrique', 'Titre par défaut', 'general'),
  ('title_template', '%s — Nsango Magazine', 'Gabarit de titre (%s = titre de page)', 'general'),
  ('default_description', 'Nsango Magazine est le premier magazine numérique premium dédié aux personnalités influentes du continent africain : business, culture, leadership, portraits.', 'Description par défaut (meta)', 'general'),
  ('default_keywords', 'magazine afrique, personnalités africaines, business afrique, leadership, culture, interviews', 'Mots-clés par défaut', 'general'),
  ('default_og_image', '', 'Image Open Graph par défaut (URL absolue)', 'general'),
  ('canonical_base_url', 'https://nsango-mag.lovable.app', 'URL canonique de base', 'general'),
  ('default_robots', 'index,follow', 'Directives robots par défaut', 'general'),
  ('default_language', 'fr-FR', 'Langue par défaut (lang attribute)', 'general'),
  -- Twitter / Meta
  ('twitter_handle', '@nsangomagazine', 'Compte Twitter/X (@handle)', 'social'),
  ('twitter_card_type', 'summary_large_image', 'Type de carte Twitter', 'social'),
  ('facebook_app_id', '', 'Facebook App ID (optionnel)', 'social'),
  -- Tracking
  ('gsc_verification', '', 'Code de vérification Google Search Console', 'tracking'),
  ('ga4_measurement_id', '', 'ID de mesure Google Analytics 4 (G-XXXXXXX)', 'tracking'),
  ('meta_pixel_id', '', 'ID Meta Pixel (Facebook)', 'tracking'),
  ('bing_verification', '', 'Code Bing Webmaster (optionnel)', 'tracking'),
  -- Organisation (JSON-LD)
  ('organization_name', 'Nsango Magazine', 'Nom de l''organisation', 'organization'),
  ('organization_logo', '', 'URL du logo (1200x1200 recommandé)', 'organization'),
  ('organization_url', 'https://nsango-mag.lovable.app', 'URL officielle', 'organization'),
  ('organization_sameas', '[]', 'Profils sociaux (JSON array d''URLs)', 'organization'),
  -- Robots.txt
  ('robots_txt', E'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /compte\nDisallow: /auth\n\nSitemap: https://nsango-mag.lovable.app/sitemap.xml', 'Contenu du robots.txt', 'robots')
ON CONFLICT (key) DO NOTHING;
