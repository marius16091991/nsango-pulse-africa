
-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('media-files', 'media-files', true);

-- Anyone can view media files
CREATE POLICY "Media files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-files');

-- Editors and admins can upload
CREATE POLICY "Editors and admins can upload media files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media-files' 
  AND (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'editor')
  )
);

-- Editors and admins can update
CREATE POLICY "Editors and admins can update media files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media-files' 
  AND (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'editor')
  )
);

-- Admins can delete media files
CREATE POLICY "Admins can delete media files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media-files' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Add UPDATE policy on media table for admins and editors
CREATE POLICY "Admins and editors can update media"
ON public.media FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')
);
