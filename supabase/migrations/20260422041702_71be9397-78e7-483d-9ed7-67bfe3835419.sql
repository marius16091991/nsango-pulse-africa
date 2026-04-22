CREATE OR REPLACE FUNCTION public.enqueue_notification_email(_user_id uuid, _notification_id uuid, _type text, _title text, _description text, _link text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _email text;
  _name text;
  _prefs record;
  _wants_email boolean := true;
  _wants_type boolean := true;
  _site_url text := 'https://nsangomagazine.com';
  _html text;
  _full_link text;
BEGIN
  SELECT au.email, COALESCE(p.display_name, au.email) INTO _email, _name
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.user_id = au.id
  WHERE au.id = _user_id;

  IF _email IS NULL THEN RETURN; END IF;

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
$function$;