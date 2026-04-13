
DROP POLICY "Anyone can post comments" ON public.comments;
CREATE POLICY "Anyone can post comments" ON public.comments FOR INSERT WITH CHECK (length(trim(author_name)) > 0 AND length(trim(content)) > 0);
