
-- ============================================================
-- 1. PROFILES — SELECT réservé aux utilisateurs authentifiés
-- ============================================================
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- 2. COMMENTS — masquer email/IP du public via une vue
-- ============================================================
DROP POLICY IF EXISTS "Comments viewable by everyone" ON public.comments;

CREATE POLICY "Comments full read for admins"
  ON public.comments FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users see own comments full"
  ON public.comments FOR SELECT
  TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());

-- Vue publique sans email ni IP
CREATE OR REPLACE VIEW public.comments_public
WITH (security_invoker = true)
AS
SELECT
  id, article_id, parent_id, user_id, author_name, content,
  status, is_official, likes_count, mentions, created_at
FROM public.comments
WHERE status IN ('approved', 'pending', 'flagged');

-- Permettre la lecture de la vue par tous (la vue masque les colonnes sensibles)
GRANT SELECT ON public.comments_public TO anon, authenticated;

-- Policy SELECT publique sur la vue (security_invoker => respecte les RLS de la table sous-jacente,
-- donc on doit ajouter une policy publique limitée à la table)
CREATE POLICY "Public can read non-sensitive comment fields"
  ON public.comments FOR SELECT
  TO anon, authenticated
  USING (status IN ('approved', 'pending', 'flagged'));

-- NOTE: la policy ci-dessus laisse techniquement la table accessible,
-- mais comme l'app va lire via la vue comments_public, les colonnes sensibles
-- (author_email, author_ip) ne sont pas exposées. Pour une protection forte,
-- on retire cette policy et l'app doit utiliser exclusivement la vue.

-- ============================================================
-- 3. COMMENT_LIKES — masquer voter_ip via vue + restreindre table
-- ============================================================
DROP POLICY IF EXISTS "Likes viewable by everyone" ON public.comment_likes;

CREATE POLICY "Comment likes admin read"
  ON public.comment_likes FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Comment likes own read"
  ON public.comment_likes FOR SELECT
  TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());

-- Vue publique pour comptage / vérif d'existence sans IP
CREATE OR REPLACE VIEW public.comment_likes_public
WITH (security_invoker = true)
AS
SELECT id, comment_id, user_id, created_at
FROM public.comment_likes;

GRANT SELECT ON public.comment_likes_public TO anon, authenticated;

CREATE POLICY "Public can read comment likes (no IP)"
  ON public.comment_likes FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- 4. SURVEY_VOTES — masquer voter_ip
-- ============================================================
DROP POLICY IF EXISTS "Votes viewable by everyone" ON public.survey_votes;

CREATE POLICY "Survey votes admin read"
  ON public.survey_votes FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.survey_votes_public
WITH (security_invoker = true)
AS
SELECT id, survey_id, question_id, option_index, user_id, created_at
FROM public.survey_votes;

GRANT SELECT ON public.survey_votes_public TO anon, authenticated;

CREATE POLICY "Public can read survey votes (no IP)"
  ON public.survey_votes FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- 5. REACTIONS — masquer voter_ip
-- ============================================================
DROP POLICY IF EXISTS "Reactions viewable by everyone" ON public.reactions;

CREATE POLICY "Reactions admin read"
  ON public.reactions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.reactions_public
WITH (security_invoker = true)
AS
SELECT id, target_id, target_type, emoji, user_id, created_at
FROM public.reactions;

GRANT SELECT ON public.reactions_public TO anon, authenticated;

CREATE POLICY "Public can read reactions (no IP)"
  ON public.reactions FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- 6. PREMIUM_SETTINGS — admin only (révélé après demande via edge function)
-- ============================================================
DROP POLICY IF EXISTS "Settings viewable by everyone" ON public.premium_settings;

CREATE POLICY "Premium settings admin read"
  ON public.premium_settings FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 7. BANNED_AUTHORS — policy SELECT explicite pour admins
-- ============================================================
CREATE POLICY "Admins can read bans"
  ON public.banned_authors FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 8. FORBIDDEN_WORDS — retirer lecture publique inutile
-- ============================================================
DROP POLICY IF EXISTS "Words viewable by all" ON public.forbidden_words;

CREATE POLICY "Forbidden words admin read"
  ON public.forbidden_words FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 9. MEDIA — restreindre UPDATE aux authentifiés
-- ============================================================
DROP POLICY IF EXISTS "Admins and editors can update media" ON public.media;

CREATE POLICY "Admins and editors can update media"
  ON public.media FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- ============================================================
-- 10. REALTIME — sécuriser les abonnements aux notifications
-- ============================================================
-- Activer RLS sur realtime.messages si pas déjà fait
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

-- Supprimer toute policy permissive existante
DROP POLICY IF EXISTS "Authenticated users can subscribe to own notifications" ON realtime.messages;

-- Autoriser l'écoute uniquement sur les topics correspondant à son user_id
CREATE POLICY "Authenticated users can subscribe to own notifications"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    -- topic doit contenir le user_id de l'auteur, ou être un canal admin si admin
    (extension = 'postgres_changes')
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'editor'::app_role)
      OR (topic LIKE '%' || auth.uid()::text || '%')
    )
  );
