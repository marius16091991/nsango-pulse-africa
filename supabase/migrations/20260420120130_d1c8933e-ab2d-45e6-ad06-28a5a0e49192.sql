-- Add 'premium' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'premium';

-- Create subscription_requests table
CREATE TABLE public.subscription_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  plan_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ NULL
);

ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create subscription requests"
ON public.subscription_requests FOR INSERT TO public
WITH CHECK (
  length(trim(full_name)) > 0
  AND length(trim(email)) > 0
  AND payment_method IN ('paypal','orange_money','mtn_money','bank_transfer')
);

CREATE POLICY "Users can view their own requests"
ON public.subscription_requests FOR SELECT TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update requests"
ON public.subscription_requests FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete requests"
ON public.subscription_requests FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_subscription_requests_updated_at
BEFORE UPDATE ON public.subscription_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-grant premium role when status flips to 'paid' and user_id is set
CREATE OR REPLACE FUNCTION public.grant_premium_on_paid()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS DISTINCT FROM 'paid') AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'premium'::app_role)
    ON CONFLICT DO NOTHING;
    NEW.paid_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_grant_premium
BEFORE UPDATE ON public.subscription_requests
FOR EACH ROW EXECUTE FUNCTION public.grant_premium_on_paid();