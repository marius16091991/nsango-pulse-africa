
-- 1. Table nav_links
CREATE TABLE IF NOT EXISTS public.nav_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL CHECK (location IN ('header','footer')),
  column_key text NOT NULL DEFAULT 'main',
  group_label text NOT NULL DEFAULT '',
  group_icon text DEFAULT '',
  label text NOT NULL,
  href text NOT NULL DEFAULT '/',
  description text DEFAULT '',
  icon text DEFAULT '',
  highlight boolean NOT NULL DEFAULT false,
  visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nav_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nav links viewable by everyone"
  ON public.nav_links FOR SELECT
  USING (true);

CREATE POLICY "Admins manage nav links"
  ON public.nav_links FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_nav_links_updated_at
  BEFORE UPDATE ON public.nav_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_nav_links_location_sort ON public.nav_links(location, sort_order);

-- 2. Seed Header (groupes)
INSERT INTO public.nav_links (location, column_key, group_label, group_icon, label, href, description, sort_order) VALUES
('header','discover','Découvrir','Compass','Accueil','/','Le meilleur de Nsango',1),
('header','discover','Découvrir','Compass','À propos','/a-propos','Notre histoire & contact',2),
('header','inspire','Inspirer','Sparkles','Business','/business','Leaders & innovation',3),
('header','inspire','Inspirer','Sparkles','Portraits','/portraits','Visages qui inspirent',4),
('header','inspire','Inspirer','Sparkles','Interviews','/interviews','Voix d''exception',5),
('header','live','Vivre','Newspaper','Culture','/culture','Art, mode, lifestyle',6),
('header','live','Vivre','Newspaper','Événements','/evenements','Agenda & rendez-vous',7),
('header','listen','Écouter & Lire','Headphones','Podcasts','/podcasts','L''audio Nsango',8),
('header','listen','Écouter & Lire','Headphones','Magazine','/magazine','L''édition imprimée',9),
('header','listen','Écouter & Lire','Headphones','Actualités','/actualites','Toutes les dernières nouvelles',10);

INSERT INTO public.nav_links (location, column_key, group_label, label, href, icon, highlight, sort_order) VALUES
('header','flat','','Nsango TV','/videos','Tv',true,11);

-- 3. Seed Footer (3 colonnes : rubriques, about, legal)
INSERT INTO public.nav_links (location, column_key, group_label, label, href, sort_order) VALUES
('footer','rubriques','Rubriques','Portraits','/portraits',1),
('footer','rubriques','Rubriques','Business & Leadership','/business',2),
('footer','rubriques','Rubriques','Culture & Lifestyle','/culture',3),
('footer','rubriques','Rubriques','Interviews','/interviews',4),
('footer','rubriques','Rubriques','Talents émergents','/portraits',5),
('footer','rubriques','Rubriques','Actualités','/actualites',6),
('footer','about','À propos','Qui sommes-nous','/a-propos',1),
('footer','about','À propos','Contact','/a-propos#contact',2),
('footer','about','À propos','Événements','/evenements',3),
('footer','about','À propos','Podcasts','/podcasts',4),
('footer','about','À propos','Connexion','/auth',5),
('footer','legal','Légal','Mentions légales','/a-propos',1),
('footer','legal','Légal','Confidentialité','/a-propos',2);

-- 4. Paramètres layout
INSERT INTO public.premium_settings (category, key, label, value) VALUES
('layout','header_ribbon_text','Bandeau supérieur (au-dessus du logo)','Les visages qui inspirent l''Afrique'),
('layout','header_tagline_label','Petit libellé à côté du logo','Magazine'),
('layout','header_premium_button_label','Texte du bouton Premium','Premium'),
('layout','header_search_placeholder','Placeholder de la recherche','Rechercher des articles, personnalités...'),
('layout','footer_tagline','Tagline footer (sous le logo)','Le magazine digital premium dédié aux personnalités influentes du continent.'),
('layout','footer_premium_title','Titre colonne Premium','Premium'),
('layout','footer_premium_text','Texte colonne Premium','Accédez à tous nos contenus exclusifs et au magazine mensuel.'),
('layout','footer_premium_button','Bouton colonne Premium','S''abonner'),
('layout','footer_copyright_suffix','Suffixe copyright','Tous droits réservés.')
ON CONFLICT (key) DO NOTHING;
