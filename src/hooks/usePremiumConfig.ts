import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PremiumPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  currency: string;
  features: string[];
  sort_order: number;
  highlighted: boolean;
  active: boolean;
}

export type PremiumSettings = Record<string, string>;

export const usePremiumConfig = () => {
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [settings, setSettings] = useState<PremiumSettings>({});
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const [plansRes, settingsRes] = await Promise.all([
      supabase.from("premium_plans").select("*").eq("active", true).order("sort_order"),
      supabase.from("premium_settings").select("key,value"),
    ]);
    if (plansRes.data) {
      setPlans(plansRes.data.map((p: any) => ({ ...p, features: Array.isArray(p.features) ? p.features : [] })));
    }
    if (settingsRes.data) {
      const map: PremiumSettings = {};
      settingsRes.data.forEach((s: any) => { map[s.key] = s.value; });
      setSettings(map);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  return { plans, settings, loading, refresh: fetchAll };
};
