
DROP POLICY IF EXISTS "Public site settings viewable by everyone" ON public.premium_settings;
CREATE POLICY "Public layout/site settings viewable by everyone"
  ON public.premium_settings FOR SELECT
  TO anon, authenticated
  USING (category IN ('site','layout'));
