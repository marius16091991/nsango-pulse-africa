
-- HEADER: éparpiller dans les colonnes existantes
UPDATE public.nav_links SET column_key='discover', group_label='Découvrir', sort_order=3
  WHERE location='header' AND label='Politique';
UPDATE public.nav_links SET column_key='inspire', group_label='Inspirer', sort_order=6
  WHERE location='header' AND label='Tech & Innovation';
UPDATE public.nav_links SET column_key='live', group_label='Vivre', sort_order=8
  WHERE location='header' AND label='Sport';
UPDATE public.nav_links SET column_key='live', group_label='Vivre', sort_order=9
  WHERE location='header' AND label='Lifestyle';

-- FOOTER: réordonner dans Rubriques
UPDATE public.nav_links SET sort_order=7  WHERE location='footer' AND label='Politique';
UPDATE public.nav_links SET sort_order=8  WHERE location='footer' AND label='Sport';
UPDATE public.nav_links SET sort_order=9  WHERE location='footer' AND label='Lifestyle';
UPDATE public.nav_links SET sort_order=10 WHERE location='footer' AND label='Tech & Innovation';
