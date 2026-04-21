
-- ============================================================
-- COMMENTS : remettre SELECT public mais révoquer email + IP
-- ============================================================
DROP POLICY IF EXISTS "Comments full read for admins" ON public.comments;
DROP POLICY IF EXISTS "Users see own comments full" ON public.comments;
DROP POLICY IF EXISTS "Comments viewable by everyone" ON public.comments;

CREATE POLICY "Comments viewable by everyone"
  ON public.comments FOR SELECT
  TO anon, authenticated
  USING (true);

-- Révoquer les colonnes sensibles pour anon/authenticated
REVOKE SELECT ON public.comments FROM anon, authenticated;
GRANT SELECT (
  id, article_id, parent_id, user_id, author_name, content,
  status, is_official, likes_count, mentions, reports_count, created_at
) ON public.comments TO anon, authenticated;

-- ============================================================
-- COMMENT_LIKES : SELECT public sans voter_ip
-- ============================================================
DROP POLICY IF EXISTS "Comment likes admin read" ON public.comment_likes;
DROP POLICY IF EXISTS "Comment likes own read" ON public.comment_likes;
DROP POLICY IF EXISTS "Public can read comment likes (no IP)" ON public.comment_likes;
DROP POLICY IF EXISTS "Likes viewable by everyone" ON public.comment_likes;

CREATE POLICY "Likes viewable by everyone"
  ON public.comment_likes FOR SELECT
  TO anon, authenticated
  USING (true);

REVOKE SELECT ON public.comment_likes FROM anon, authenticated;
GRANT SELECT (id, comment_id, user_id, created_at) ON public.comment_likes TO anon, authenticated;

-- ============================================================
-- REACTIONS : SELECT public sans voter_ip
-- ============================================================
DROP POLICY IF EXISTS "Reactions admin read" ON public.reactions;
DROP POLICY IF EXISTS "Public can read reactions (no IP)" ON public.reactions;
DROP POLICY IF EXISTS "Reactions viewable by everyone" ON public.reactions;

CREATE POLICY "Reactions viewable by everyone"
  ON public.reactions FOR SELECT
  TO anon, authenticated
  USING (true);

REVOKE SELECT ON public.reactions FROM anon, authenticated;
GRANT SELECT (id, target_id, target_type, emoji, user_id, created_at) ON public.reactions TO anon, authenticated;

-- ============================================================
-- SURVEY_VOTES : SELECT public sans voter_ip
-- ============================================================
DROP POLICY IF EXISTS "Survey votes admin read" ON public.survey_votes;
DROP POLICY IF EXISTS "Public can read survey votes (no IP)" ON public.survey_votes;
DROP POLICY IF EXISTS "Votes viewable by everyone" ON public.survey_votes;

CREATE POLICY "Votes viewable by everyone"
  ON public.survey_votes FOR SELECT
  TO anon, authenticated
  USING (true);

REVOKE SELECT ON public.survey_votes FROM anon, authenticated;
GRANT SELECT (id, survey_id, question_id, option_index, user_id, created_at) ON public.survey_votes TO anon, authenticated;

-- ============================================================
-- Les admins gardent SELECT complet via service_role + leur policy admin
-- (les policies admin existantes utilisent has_role + sélectionnent toutes les colonnes ;
--  mais elles passent par le rôle authenticated qui n'a plus que les colonnes restreintes).
-- Solution : garantir aux admins l'accès complet via une fonction security definer ou
-- en redonnant le SELECT complet aux authenticated qui sont admins via un GRANT séparé.
-- Le plus simple : redonner SELECT complet à authenticated mais protéger anon uniquement.
-- Mais alors n'importe quel user connecté lit les emails. Solution : garder le grant restreint
-- pour authenticated aussi, et exposer les colonnes sensibles aux admins via une vue admin.
-- ============================================================

-- Vue admin pour relire les colonnes sensibles
CREATE OR REPLACE VIEW public.comments_admin
WITH (security_invoker = true)
AS SELECT * FROM public.comments;

CREATE OR REPLACE VIEW public.comment_likes_admin
WITH (security_invoker = true)
AS SELECT * FROM public.comment_likes;

CREATE OR REPLACE VIEW public.reactions_admin
WITH (security_invoker = true)
AS SELECT * FROM public.reactions;

CREATE OR REPLACE VIEW public.survey_votes_admin
WITH (security_invoker = true)
AS SELECT * FROM public.survey_votes;

-- Donner accès complet aux vues admin uniquement aux admins via une grant ciblée :
-- les vues security_invoker héritent des grants de la table sous-jacente, donc on doit
-- créer une fonction RPC sécurisée pour les admins.

-- Plus simple : créer un rôle DB pour admin n'est pas possible côté client.
-- On utilise une fonction security definer qui retourne les emails à un admin.

CREATE OR REPLACE FUNCTION public.admin_get_comment_details(_comment_id uuid)
RETURNS TABLE (
  id uuid, article_id uuid, author_name text, author_email text,
  author_ip text, content text, status text, created_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.article_id, c.author_name, c.author_email, c.author_ip,
         c.content, c.status, c.created_at
  FROM public.comments c
  WHERE c.id = _comment_id
    AND has_role(auth.uid(), 'admin'::app_role);
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_comment_details(uuid) TO authenticated;
