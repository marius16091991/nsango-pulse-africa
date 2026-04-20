
-- Unique constraint pour upsert onConflict='endpoint'
ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_endpoint_key;
ALTER TABLE public.push_subscriptions ADD CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint);

-- Trigger : sur chaque notification user_id IS NULL (= broadcast admins),
-- appeler send-web-push via pg_net (asynchrone, non bloquant)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.fire_admin_web_push()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url text := 'https://ukwxyzcdjyiovxasbpxq.supabase.co/functions/v1/send-web-push';
  _anon text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd3h5emNkanlpb3Z4YXNicHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjMzMzcsImV4cCI6MjA5MTQzOTMzN30.7FAx3nUT-Cj_OZTiq0Bm5T0vySjeVF7_5qOu_RKMSkM';
BEGIN
  -- Push uniquement pour les notifications adressées aux admins (broadcast user_id NULL)
  IF NEW.user_id IS NULL THEN
    PERFORM extensions.http_post(
      url := _url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || _anon
      ),
      body := jsonb_build_object(
        'title', NEW.title,
        'body', COALESCE(NEW.description, ''),
        'url', COALESCE(NEW.link, '/admin'),
        'target', 'admins'
      )
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- ne jamais bloquer l'insert
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fire_admin_web_push ON public.notifications;
CREATE TRIGGER trg_fire_admin_web_push
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.fire_admin_web_push();
