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
    // ⚠️ Sécurité : premium_settings (PayPal/IBAN/Mobile Money) n'est plus lisible
    // publiquement. Les coordonnées sont récupérées via l'edge function
    // `get-payment-details` après soumission d'une demande.
    // Ici on charge uniquement les plans + les libellés non sensibles via une RPC publique
    // (ou on laisse les settings vides : le composant gère les valeurs absentes).
    const plansRes = await supabase.from("premium_plans").select("*").eq("active", true).order("sort_order");
    if (plansRes.data) {
      setPlans(plansRes.data.map((p: any) => ({ ...p, features: Array.isArray(p.features) ? p.features : [] })));
    }
    // settings reste vide pour le public ; admin peut le charger via SettingsManager.
    setSettings({});
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  return { plans, settings, loading, refresh: fetchAll };
};
