
-- ============================================
-- PHASE 2 : Email outbox alimentée par triggers
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  to_name text,
  subject text NOT NULL,
  html_body text NOT NULL,
  text_body text,
  category text NOT NULL DEFAULT 'notification',
  metadata jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending', -- pending | sent | failed
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  notification_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_status ON public.email_outbox(status, created_at);

ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read outbox" ON public.email_outbox
  FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "Admins can manage outbox" ON public.email_outbox
  FOR ALL TO authenticated 
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- ============================================
-- Fonction qui enqueue un email pour 1 user en respectant ses préférences
-- ============================================
CREATE OR REPLACE FUNCTION public.enqueue_notification_email(
  _user_id uuid,
  _notification_id uuid,
  _type text,
  _title text,
  _description text,
  _link text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _name text;
  _prefs record;
  _wants_email boolean := true;
  _wants_type boolean := true;
  _site_url text := 'https://nsango-mag.lovable.app';
  _html text;
  _full_link text;
BEGIN
  -- Récupère email + display_name
  SELECT au.email, COALESCE(p.display_name, au.email) INTO _email, _name
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.user_id = au.id
  WHERE au.id = _user_id;

  IF _email IS NULL THEN RETURN; END IF;

  -- Vérifie les préférences
  SELECT email, types INTO _prefs FROM public.notification_preferences WHERE user_id = _user_id;
  IF FOUND THEN
    _wants_email := COALESCE(_prefs.email, true);
    _wants_type := COALESCE((_prefs.types->>_type)::boolean, true);
  END IF;

  IF NOT _wants_email OR NOT _wants_type THEN RETURN; END IF;

  _full_link := CASE WHEN _link IS NULL THEN _site_url
                     WHEN _link LIKE 'http%' THEN _link
                     ELSE _site_url || _link END;

  _html := '<!doctype html><html><body style="margin:0;padding:0;background:#f5f5f0;font-family:Tahoma,Arial,sans-serif">'
    || '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:24px 0">'
    || '<tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e7e2d4">'
    || '<tr><td style="background:#1a1a1a;padding:20px 28px"><div style="color:#D4A017;font-weight:700;font-size:20px;letter-spacing:.5px">NSANGO MAGAZINE</div></td></tr>'
    || '<tr><td style="padding:28px"><h1 style="margin:0 0 12px;font-size:20px;color:#1a1a1a">' || _title || '</h1>'
    || CASE WHEN _description IS NOT NULL THEN '<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#444">' || _description || '</p>' ELSE '' END
    || '<a href="' || _full_link || '" style="display:inline-block;background:#D4A017;color:#1a1a1a;text-decoration:none;padding:11px 22px;border-radius:6px;font-weight:700;font-size:14px">Voir sur Nsango</a>'
    || '<p style="margin:28px 0 0;font-size:11px;color:#999">Bonjour ' || _name || ', vous recevez ce message car vous êtes abonné aux notifications de Nsango Magazine. <a href="' || _site_url || '/compte/notifications" style="color:#999">Gérer mes préférences</a></p>'
    || '</td></tr></table></td></tr></table></body></html>';

  INSERT INTO public.email_outbox (to_email, to_name, subject, html_body, category, notification_id, metadata)
  VALUES (
    _email, _name,
    '[Nsango] ' || _title,
    _html,
    'notification',
    _notification_id,
    jsonb_build_object('type', _type, 'user_id', _user_id, 'link', _full_link)
  );
END;
$$;

-- ============================================
-- Trigger après insert sur notifications → enqueue email si user_id non null
-- ============================================
CREATE OR REPLACE FUNCTION public.on_notification_inserted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    PERFORM public.enqueue_notification_email(
      NEW.user_id, NEW.id, NEW.type, NEW.title, NEW.description, NEW.link
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notification_email ON public.notifications;
CREATE TRIGGER trg_notification_email
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.on_notification_inserted();

-- ============================================
-- Branche notify_admins → notifications (déjà fait) + maintenant les triggers existants
-- déclenchent automatiquement enqueue_notification_email via trg_notification_email
-- ============================================

-- Notification de bienvenue user (in-app + email)
CREATE OR REPLACE FUNCTION public.welcome_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, description, link, icon)
  VALUES (
    NEW.user_id, 'system', 
    'Bienvenue sur Nsango Magazine ✨',
    'Votre compte a été créé avec succès. Découvrez nos derniers articles et explorez le monde Nsango.',
    '/', 'Sparkles'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_welcome_new_user ON public.profiles;
CREATE TRIGGER trg_welcome_new_user
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.welcome_new_user();

-- Helper RPC : marquer un email comme envoyé (appelé par edge function relay)
CREATE OR REPLACE FUNCTION public.mark_email_sent(_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.email_outbox SET status='sent', sent_at=now() WHERE id=_id;
$$;

CREATE OR REPLACE FUNCTION public.mark_email_failed(_id uuid, _error text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.email_outbox 
  SET status=CASE WHEN attempts >= 4 THEN 'failed' ELSE 'pending' END,
      attempts = attempts + 1,
      last_error = _error
  WHERE id=_id;
$$;
