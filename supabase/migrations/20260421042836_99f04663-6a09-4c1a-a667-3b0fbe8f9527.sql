-- Add is_active flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Add priority to user_roles (higher = more important)
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_user_roles_priority ON public.user_roles(priority DESC);