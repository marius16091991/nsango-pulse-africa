
-- ============ TABLES ============

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid, -- NULL = broadcast pour tous les admins
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  description text,
  link text,
  icon text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, read, created_at DESC);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY,
  in_app boolean NOT NULL DEFAULT true,
  email boolean NOT NULL DEFAULT true,
  push boolean NOT NULL DEFAULT false,
  types jsonb NOT NULL DEFAULT '{"article":true,"comment":true,"subscription":true,"premium":true,"user":true,"system":true}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id);

-- ============ RLS ============

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- notifications
CREATE POLICY "Users see their own notifications, admins see all"
ON public.notifications FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role)))
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users update their own, admins all"
ON public.notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users delete their own, admins all"
ON public.notifications FOR DELETE TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- notification_preferences
CREATE POLICY "Users manage their own preferences"
ON public.notification_preferences FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- push_subscriptions
CREATE POLICY "Users manage their own push subscriptions"
ON public.push_subscriptions FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins read push subscriptions"
ON public.push_subscriptions FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ TRIGGER FUNCTIONS ============

-- Helper: insère une notif pour chaque admin
CREATE OR REPLACE FUNCTION public.notify_admins(_type text, _title text, _description text, _link text, _icon text, _metadata jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, description, link, icon, metadata)
  SELECT ur.user_id, _type, _title, _description, _link, _icon, _metadata
  FROM public.user_roles ur
  WHERE ur.role IN ('admin'::app_role, 'editor'::app_role);
END;
$$;

-- Article publié
CREATE OR REPLACE FUNCTION public.notify_on_article_publish()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published') THEN
    PERFORM public.notify_admins(
      'article',
      'Article publié',
      COALESCE(NEW.author_name, 'Anonyme') || ' — « ' || NEW.title || ' »',
      '/article/' || NEW.id::text,
      'FileText',
      jsonb_build_object('article_id', NEW.id, 'category', NEW.category)
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_notify_on_article_publish
AFTER INSERT OR UPDATE OF status ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.notify_on_article_publish();

-- Nouveau commentaire
CREATE OR REPLACE FUNCTION public.notify_on_new_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _article_title text;
BEGIN
  SELECT title INTO _article_title FROM public.articles WHERE id = NEW.article_id;
  PERFORM public.notify_admins(
    'comment',
    'Nouveau commentaire',
    NEW.author_name || ' sur « ' || COALESCE(_article_title, 'article supprimé') || ' »',
    '/admin/comments',
    'MessageSquare',
    jsonb_build_object('comment_id', NEW.id, 'article_id', NEW.article_id, 'status', NEW.status)
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_notify_on_new_comment
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_comment();

-- Demande d'abonnement
CREATE OR REPLACE FUNCTION public.notify_on_subscription_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.notify_admins(
      'subscription',
      'Nouvelle demande premium',
      NEW.full_name || ' — ' || NEW.plan_name || ' (' || NEW.amount || ' XAF)',
      '/admin/subscriptions',
      'Crown',
      jsonb_build_object('request_id', NEW.id, 'payment_method', NEW.payment_method)
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid' AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, description, link, icon, metadata)
    VALUES (
      NEW.user_id,
      'premium',
      'Abonnement activé ✨',
      'Bienvenue dans le club premium Nsango — ' || NEW.plan_name,
      '/premium',
      'Crown',
      jsonb_build_object('plan', NEW.plan_name)
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_notify_on_subscription_request
AFTER INSERT OR UPDATE ON public.subscription_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_on_subscription_request();

-- Nouveau profil utilisateur
CREATE OR REPLACE FUNCTION public.notify_on_new_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.notify_admins(
    'user',
    'Nouvel utilisateur',
    COALESCE(NEW.display_name, 'Inconnu') || ' a rejoint Nsango',
    '/admin/users',
    'Users',
    jsonb_build_object('user_id', NEW.user_id)
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_notify_on_new_profile
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_profile();

-- ============ REALTIME ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
