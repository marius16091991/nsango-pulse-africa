
-- COMMENTS
DROP POLICY IF EXISTS "Public can read non-sensitive comment fields" ON public.comments;
DROP POLICY IF EXISTS "Anyone can post comments" ON public.comments;
CREATE POLICY "Anyone can post comments"
  ON public.comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(both from author_name)) BETWEEN 1 AND 100
    AND length(trim(both from content)) BETWEEN 1 AND 5000
    AND (author_email IS NULL OR length(author_email) <= 255)
    AND article_id IS NOT NULL
  );

-- COMMENT_LIKES
DROP POLICY IF EXISTS "Anyone can like" ON public.comment_likes;
CREATE POLICY "Anyone can like"
  ON public.comment_likes FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    comment_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.comments WHERE id = comment_id)
  );

-- REACTIONS
DROP POLICY IF EXISTS "Anyone can react" ON public.reactions;
CREATE POLICY "Anyone can react"
  ON public.reactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    target_id IS NOT NULL
    AND target_type IN ('article', 'comment', 'video')
    AND length(emoji) BETWEEN 1 AND 16
  );

-- SURVEY_VOTES
DROP POLICY IF EXISTS "Anyone can vote" ON public.survey_votes;
CREATE POLICY "Anyone can vote"
  ON public.survey_votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    survey_id IS NOT NULL
    AND option_index >= 0 AND option_index < 100
    AND EXISTS (SELECT 1 FROM public.surveys WHERE id = survey_id AND status = 'active')
  );

-- AD_EVENTS
DROP POLICY IF EXISTS "Anyone can log events" ON public.ad_events;
DROP POLICY IF EXISTS "Anyone can log ad events" ON public.ad_events;
CREATE POLICY "Anyone can log ad events"
  ON public.ad_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    campaign_id IS NOT NULL
    AND event_type IN ('impression', 'click')
    AND (page_path IS NULL OR length(page_path) <= 500)
  );

-- SOCIAL_CLICKS
DROP POLICY IF EXISTS "Anyone can log clicks" ON public.social_clicks;
DROP POLICY IF EXISTS "Anyone can log social clicks" ON public.social_clicks;
CREATE POLICY "Anyone can log social clicks"
  ON public.social_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    network IN ('facebook', 'twitter', 'x', 'linkedin', 'whatsapp', 'telegram', 'email', 'instagram', 'tiktok', 'youtube', 'copy')
    AND (referer IS NULL OR length(referer) <= 1000)
    AND (user_agent IS NULL OR length(user_agent) <= 500)
  );

-- COMMENT_REPORTS
DROP POLICY IF EXISTS "Anyone can report" ON public.comment_reports;
DROP POLICY IF EXISTS "Anyone can report comments" ON public.comment_reports;
CREATE POLICY "Anyone can report comments"
  ON public.comment_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    comment_id IS NOT NULL
    AND (reason IS NULL OR length(reason) <= 500)
  );

-- SUBSCRIPTION_REQUESTS
DROP POLICY IF EXISTS "Anyone can create subscription requests" ON public.subscription_requests;
CREATE POLICY "Anyone can create subscription requests"
  ON public.subscription_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(both from full_name)) BETWEEN 2 AND 150
    AND length(trim(both from email)) BETWEEN 5 AND 255
    AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    AND payment_method IN ('paypal', 'orange_money', 'mtn_money', 'bank_transfer')
    AND amount > 0 AND amount < 1000000
    AND length(plan_name) BETWEEN 1 AND 100
  );

-- STORAGE — restreindre listing
DROP POLICY IF EXISTS "Public can list media-files" ON storage.objects;
DROP POLICY IF EXISTS "Public can list ad-creatives" ON storage.objects;
DROP POLICY IF EXISTS "Public read media-files" ON storage.objects;
DROP POLICY IF EXISTS "Public read ad-creatives" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read media-files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read ad-creatives" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Read individual media files only" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete media files" ON storage.objects;

CREATE POLICY "Read individual media files only"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id IN ('media-files', 'ad-creatives')
    AND name IS NOT NULL
  );

CREATE POLICY "Auth users can upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('media-files', 'ad-creatives')
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
  );

CREATE POLICY "Admins can delete media files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('media-files', 'ad-creatives')
    AND has_role(auth.uid(), 'admin'::app_role)
  );
