
-- Fonction admin : liste complète des commentaires avec colonnes sensibles
CREATE OR REPLACE FUNCTION public.admin_list_comments()
RETURNS SETOF public.comments
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;
  RETURN QUERY SELECT * FROM public.comments ORDER BY created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_comments() TO authenticated;

-- Fonction admin : bannir par email + rejeter tous les commentaires de cet email
CREATE OR REPLACE FUNCTION public.admin_ban_email(_email text, _reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;
  INSERT INTO public.banned_authors (email, reason, banned_by)
  VALUES (_email, _reason, auth.uid());
  UPDATE public.comments SET status = 'rejected' WHERE author_email = _email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_ban_email(text, text) TO authenticated;
