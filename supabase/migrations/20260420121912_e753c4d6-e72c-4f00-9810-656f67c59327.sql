-- Premium plans table
CREATE TABLE public.premium_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  duration text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'XAF',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  highlighted boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.premium_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active plans viewable by everyone"
  ON public.premium_plans FOR SELECT
  USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert plans"
  ON public.premium_plans FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update plans"
  ON public.premium_plans FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete plans"
  ON public.premium_plans FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_premium_plans_updated
  BEFORE UPDATE ON public.premium_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Premium settings (key/value)
CREATE TABLE public.premium_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.premium_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings viewable by everyone"
  ON public.premium_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert settings"
  ON public.premium_settings FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings"
  ON public.premium_settings FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete settings"
  ON public.premium_settings FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_premium_settings_updated
  BEFORE UPDATE ON public.premium_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default plans
INSERT INTO public.premium_plans (name, duration, price, currency, features, sort_order, highlighted) VALUES
  ('Mensuel', '1 mois', 5000, 'XAF', '["Articles premium illimités","Magazine mensuel","Vidéos exclusives","Sans publicité","Newsletter premium"]'::jsonb, 1, false),
  ('Annuel', '12 mois', 50000, 'XAF', '["Tout le plan Mensuel","2 mois offerts","Accès anticipé aux contenus","Événements VIP","Support prioritaire"]'::jsonb, 2, true);

-- Seed default settings
INSERT INTO public.premium_settings (key, value, label, category) VALUES
  ('orange_money_number', '+237 6XX XX XX XX', 'Numéro Orange Money', 'payment'),
  ('orange_money_name', 'NSANGO MAGAZINE', 'Nom du compte Orange Money', 'payment'),
  ('mtn_money_number', '+237 6XX XX XX XX', 'Numéro MTN Mobile Money', 'payment'),
  ('mtn_money_name', 'NSANGO MAGAZINE', 'Nom du compte MTN MoMo', 'payment'),
  ('paypal_email', 'paiement@nsango-magazine.com', 'Email PayPal', 'payment'),
  ('bank_name', 'Afriland First Bank', 'Nom de la banque', 'payment'),
  ('bank_iban', 'CM21 10005 00012 00012345678 90', 'RIB / IBAN', 'payment'),
  ('bank_swift', 'CCEICMCX', 'Code SWIFT/BIC', 'payment'),
  ('bank_account_name', 'NSANGO MAGAZINE SARL', 'Titulaire du compte', 'payment'),
  ('modal_title', 'Devenez abonné Premium', 'Titre du modal', 'text'),
  ('modal_subtitle', 'Accédez à tous nos contenus exclusifs et soutenez le journalisme indépendant africain.', 'Sous-titre du modal', 'text'),
  ('confirmation_message', 'Votre demande a été enregistrée. Effectuez le paiement avec la référence ci-dessous puis nous activerons votre accès Premium sous 24h.', 'Message de confirmation', 'text'),
  ('support_email', 'premium@nsango-magazine.com', 'Email de support Premium', 'text');