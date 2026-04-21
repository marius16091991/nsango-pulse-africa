import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

export type SubscriptionStatus = "premium" | "pending" | "none";

export interface AccountBadges {
  loading: boolean;
  unreadNotifications: number;
  profileIncomplete: boolean;
  securityAlerts: number;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: string | null;
  refresh: () => void;
}

/**
 * Pré-charge tous les indicateurs visuels (badges) de l'espace /compte
 * en parallèle pour limiter la latence d'affichage.
 */
export const useAccountBadges = (): AccountBadges => {
  const { user, profile, loading: authLoading } = useAuth();
  const { isPremium, loading: roleLoading } = useUserRole();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>("none");
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const profileIncomplete = !profile?.display_name || !profile?.avatar_url;
  // Une "alerte sécurité" légère = profil incomplet (avatar/nom). On peut l'enrichir plus tard.
  const securityAlerts = profileIncomplete ? 1 : 0;

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) {
      setUnreadNotifications(0);
      setSubscriptionStatus("none");
      setSubscriptionPlan(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [notifRes, subRes, reqRes] = await Promise.all([
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false),
        supabase
          .from("subscriptions")
          .select("plan, status")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("subscription_requests")
          .select("id, plan_name, status")
          .eq("user_id", user.id)
          .in("status", ["pending", "verifying"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      setUnreadNotifications(notifRes.count ?? 0);
      if (subRes.data || isPremium) {
        setSubscriptionStatus("premium");
        setSubscriptionPlan(subRes.data?.plan ?? "Premium");
      } else if (reqRes.data) {
        setSubscriptionStatus("pending");
        setSubscriptionPlan(reqRes.data.plan_name);
      } else {
        setSubscriptionStatus("none");
        setSubscriptionPlan(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, roleLoading, isPremium, tick]);

  // Realtime sur notifications uniquement (le reste change rarement)
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`account-badges-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => setTick((t) => t + 1),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    loading: loading || authLoading || roleLoading,
    unreadNotifications,
    profileIncomplete,
    securityAlerts,
    subscriptionStatus,
    subscriptionPlan,
    refresh: () => setTick((t) => t + 1),
  };
};