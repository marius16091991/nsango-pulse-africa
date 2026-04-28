
INSERT INTO public.pages (slug, title, meta_description, visible, sort_order) VALUES
  ('politique', 'Politique', 'Actualité politique et géopolitique africaine', true, 13),
  ('sport',     'Sport',     'Sport et performances africaines', true, 14),
  ('lifestyle', 'Lifestyle', 'Mode, art de vivre et tendances africaines', true, 15),
  ('tech',      'Tech & Innovation', 'Technologie, innovation et startups africaines', true, 16)
ON CONFLICT (slug) DO UPDATE SET visible = true, title = EXCLUDED.title, meta_description = EXCLUDED.meta_description;

-- Header links
INSERT INTO public.nav_links (location, column_key, group_label, label, href, visible, sort_order) VALUES
  ('header', 'main', 'Navigation', 'Politique',         '/politique', true, 100),
  ('header', 'main', 'Navigation', 'Sport',             '/sport',     true, 101),
  ('header', 'main', 'Navigation', 'Lifestyle',         '/lifestyle', true, 102),
  ('header', 'main', 'Navigation', 'Tech & Innovation', '/tech',      true, 103);

-- Footer links
INSERT INTO public.nav_links (location, column_key, group_label, label, href, visible, sort_order) VALUES
  ('footer', 'rubriques', 'Rubriques', 'Politique',         '/politique', true, 100),
  ('footer', 'rubriques', 'Rubriques', 'Sport',             '/sport',     true, 101),
  ('footer', 'rubriques', 'Rubriques', 'Lifestyle',         '/lifestyle', true, 102),
  ('footer', 'rubriques', 'Rubriques', 'Tech & Innovation', '/tech',      true, 103);
