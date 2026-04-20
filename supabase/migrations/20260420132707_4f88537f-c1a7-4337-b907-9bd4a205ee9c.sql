
-- ============================================
-- 1. SONDAGES : multi-questions, vote public
-- ============================================

ALTER TABLE public.surveys
  ADD COLUMN IF NOT EXISTS start_date timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS cover_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'Général',
  ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS description text DEFAULT '';

CREATE TABLE IF NOT EXISTS public.survey_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_votes integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Survey questions viewable by everyone" ON public.survey_questions FOR SELECT USING (true);
CREATE POLICY "Admins manage survey questions" ON public.survey_questions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.survey_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  option_index integer NOT NULL,
  user_id uuid,
  voter_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_survey_vote_user ON public.survey_votes (COALESCE(question_id, survey_id), user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_survey_vote_ip ON public.survey_votes (COALESCE(question_id, survey_id), voter_ip) WHERE user_id IS NULL AND voter_ip IS NOT NULL;

ALTER TABLE public.survey_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes viewable by everyone" ON public.survey_votes FOR SELECT USING (true);
CREATE POLICY "Anyone can vote" ON public.survey_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins delete votes" ON public.survey_votes FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger qui incrémente les compteurs JSON
CREATE OR REPLACE FUNCTION public.increment_survey_vote()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _opts jsonb; _idx int := NEW.option_index;
BEGIN
  IF NEW.question_id IS NOT NULL THEN
    SELECT options INTO _opts FROM public.survey_questions WHERE id = NEW.question_id;
    IF _opts IS NOT NULL AND jsonb_array_length(_opts) > _idx THEN
      _opts := jsonb_set(_opts, ARRAY[_idx::text, 'votes'], to_jsonb(COALESCE((_opts->_idx->>'votes')::int, 0) + 1));
      UPDATE public.survey_questions SET options = _opts, total_votes = total_votes + 1 WHERE id = NEW.question_id;
    END IF;
  ELSE
    SELECT options INTO _opts FROM public.surveys WHERE id = NEW.survey_id;
    IF _opts IS NOT NULL AND jsonb_array_length(_opts) > _idx THEN
      _opts := jsonb_set(_opts, ARRAY[_idx::text, 'votes'], to_jsonb(COALESCE((_opts->_idx->>'votes')::int, 0) + 1));
      UPDATE public.surveys SET options = _opts, total_votes = total_votes + 1 WHERE id = NEW.survey_id;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_increment_vote ON public.survey_votes;
CREATE TRIGGER trg_increment_vote AFTER INSERT ON public.survey_votes FOR EACH ROW EXECUTE FUNCTION public.increment_survey_vote();

-- ============================================
-- 2. COMMENTAIRES : threads, likes, reports, ban, mentions
-- ============================================

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS is_official boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reports_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mentions text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS author_ip text;

CREATE TABLE IF NOT EXISTS public.comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id uuid,
  voter_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_clike_user ON public.comment_likes (comment_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_clike_ip ON public.comment_likes (comment_id, voter_ip) WHERE user_id IS NULL;

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes viewable by everyone" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Anyone can like" ON public.comment_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unlike own" ON public.comment_likes FOR DELETE USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.bump_comment_likes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN UPDATE public.comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN UPDATE public.comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS trg_bump_clikes ON public.comment_likes;
CREATE TRIGGER trg_bump_clikes AFTER INSERT OR DELETE ON public.comment_likes FOR EACH ROW EXECUTE FUNCTION public.bump_comment_likes();

CREATE TABLE IF NOT EXISTS public.comment_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reporter_user_id uuid,
  reporter_ip text,
  reason text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can report" ON public.comment_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read reports" ON public.comment_reports FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete reports" ON public.comment_reports FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.bump_comment_reports()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.comments SET reports_count = reports_count + 1, status = CASE WHEN reports_count + 1 >= 3 THEN 'flagged' ELSE status END WHERE id = NEW.comment_id;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_bump_creports ON public.comment_reports;
CREATE TRIGGER trg_bump_creports AFTER INSERT ON public.comment_reports FOR EACH ROW EXECUTE FUNCTION public.bump_comment_reports();

CREATE TABLE IF NOT EXISTS public.banned_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  ip text,
  reason text DEFAULT '',
  banned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ban_email ON public.banned_authors (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_ban_ip ON public.banned_authors (ip) WHERE ip IS NOT NULL;

ALTER TABLE public.banned_authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage bans" ON public.banned_authors FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.forbidden_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.forbidden_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Words viewable by all" ON public.forbidden_words FOR SELECT USING (true);
CREATE POLICY "Admins manage words" ON public.forbidden_words FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger anti-spam : auto-flag si banni / mot interdit / lien suspect
CREATE OR REPLACE FUNCTION public.comment_antispam()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _bad_count int := 0; _link_count int := 0;
BEGIN
  -- Bannissement
  IF EXISTS (SELECT 1 FROM public.banned_authors WHERE (email IS NOT NULL AND email = NEW.author_email) OR (ip IS NOT NULL AND ip = NEW.author_ip)) THEN
    NEW.status := 'rejected'; RETURN NEW;
  END IF;
  -- Mots interdits
  SELECT COUNT(*) INTO _bad_count FROM public.forbidden_words WHERE lower(NEW.content) LIKE '%' || lower(word) || '%';
  -- Liens suspects (>2 liens = spam)
  _link_count := (length(NEW.content) - length(replace(lower(NEW.content), 'http', ''))) / 4;
  IF _bad_count > 0 OR _link_count > 2 THEN NEW.status := 'flagged'; END IF;
  -- Extraction des mentions @
  NEW.mentions := ARRAY(SELECT DISTINCT substring(m[1] from 2) FROM regexp_matches(NEW.content, '(@\w+)', 'g') AS m);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_comment_antispam ON public.comments;
CREATE TRIGGER trg_comment_antispam BEFORE INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.comment_antispam();

-- ============================================
-- 3. PUB : ciblage, créatives, tracking
-- ============================================

ALTER TABLE public.ad_campaigns
  ADD COLUMN IF NOT EXISTS target_pages text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_categories text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS auto_pause boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS click_url text DEFAULT '';

CREATE TABLE IF NOT EXISTS public.ad_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  click_url text DEFAULT '',
  alt text DEFAULT '',
  weight integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active creatives viewable by all" ON public.ad_creatives FOR SELECT USING (active = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage creatives" ON public.ad_creatives FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.ad_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  creative_id uuid REFERENCES public.ad_creatives(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('impression', 'click')),
  page_path text DEFAULT '',
  user_id uuid,
  visitor_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ad_events_campaign ON public.ad_events(campaign_id, created_at DESC);
ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log events" ON public.ad_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read events" ON public.ad_events FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.bump_ad_counters()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.event_type = 'impression' THEN UPDATE public.ad_campaigns SET impressions = impressions + 1 WHERE id = NEW.campaign_id;
  ELSIF NEW.event_type = 'click' THEN UPDATE public.ad_campaigns SET clicks = clicks + 1 WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_bump_ads ON public.ad_events;
CREATE TRIGGER trg_bump_ads AFTER INSERT ON public.ad_events FOR EACH ROW EXECUTE FUNCTION public.bump_ad_counters();

-- Bucket pour les visuels publicitaires
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-creatives', 'ad-creatives', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Ad creatives public read" ON storage.objects FOR SELECT USING (bucket_id = 'ad-creatives');
CREATE POLICY "Admins upload ad creatives" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ad-creatives' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update ad creatives" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'ad-creatives' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete ad creatives" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'ad-creatives' AND has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- 4. RÉACTIONS ❤️ 🔥 👏
-- ============================================

CREATE TABLE IF NOT EXISTS public.reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('article', 'video', 'podcast', 'comment')),
  target_id uuid NOT NULL,
  emoji text NOT NULL CHECK (emoji IN ('heart', 'fire', 'clap')),
  user_id uuid,
  voter_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_reaction_user ON public.reactions (target_type, target_id, emoji, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_reaction_ip ON public.reactions (target_type, target_id, emoji, voter_ip) WHERE user_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_reactions_target ON public.reactions (target_type, target_id);

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reactions viewable by everyone" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Anyone can react" ON public.reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users remove own reaction" ON public.reactions FOR DELETE USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
