
-- Table magazine_issues
CREATE TABLE IF NOT EXISTS public.magazine_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  cover_url text DEFAULT '',
  summary text DEFAULT '',
  issue_date date,
  status text NOT NULL DEFAULT 'draft', -- draft | current | archived
  premium boolean NOT NULL DEFAULT true,
  downloads integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  pdf_url text DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.magazine_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published issues viewable by everyone"
  ON public.magazine_issues FOR SELECT
  USING (status IN ('current','archived') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Editors and admins can insert issues"
  ON public.magazine_issues FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Editors and admins can update issues"
  ON public.magazine_issues FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins can delete issues"
  ON public.magazine_issues FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_magazine_issues_updated_at
  BEFORE UPDATE ON public.magazine_issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Paramètres "site" pour SettingsPage
INSERT INTO public.premium_settings (key, value, label, category) VALUES
  ('site_name', 'Nsango Magazine', 'Nom du site', 'site'),
  ('site_slogan', 'Les visages qui inspirent l''Afrique', 'Slogan', 'site'),
  ('site_seo_description', 'Nsango Magazine — le premier magazine numérique premium dédié aux personnalités influentes du continent africain.', 'Description SEO (meta)', 'site'),
  ('site_contact_email', 'contact@kibafood.cm', 'Email de contact', 'site')
ON CONFLICT (key) DO NOTHING;

-- Paramètres "distribution"
INSERT INTO public.premium_settings (key, value, label, category) VALUES
  ('distribution_embargo_premium', 'true', 'Embargo premium 48h', 'distribution'),
  ('distribution_auto_newsletter', 'true', 'Auto-envoi newsletter sur publication', 'distribution'),
  ('distribution_auto_social', 'false', 'Partage social automatique', 'distribution'),
  ('distribution_newsletter_frequency', 'daily', 'Fréquence newsletter (instant/daily/weekly)', 'distribution')
ON CONFLICT (key) DO NOTHING;
