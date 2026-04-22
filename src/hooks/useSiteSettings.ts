import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  site_name: string;
  site_slogan: string;
  site_contact_email: string;
  site_seo_description: string;
}

const DEFAULTS: SiteSettings = {
  site_name: "Nsango Magazine",
  site_slogan: "Les visages qui inspirent l'Afrique",
  site_contact_email: "contact@kibafood.cm",
  site_seo_description: "",
};

let cache: SiteSettings | null = null;
let inflight: Promise<SiteSettings> | null = null;
const listeners = new Set<(s: SiteSettings) => void>();

const fetchSettings = async (): Promise<SiteSettings> => {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const { data } = await supabase
      .from("premium_settings")
      .select("key, value")
      .eq("category", "site");
    const merged = { ...DEFAULTS };
    (data || []).forEach((r: any) => {
      if (r.key in merged && r.value) (merged as any)[r.key] = r.value;
    });
    cache = merged;
    listeners.forEach((l) => l(merged));
    inflight = null;
    return merged;
  })();
  return inflight;
};

export const useSiteSettings = (): SiteSettings => {
  const [settings, setSettings] = useState<SiteSettings>(cache || DEFAULTS);
  useEffect(() => {
    let mounted = true;
    const update = (s: SiteSettings) => mounted && setSettings(s);
    listeners.add(update);
    fetchSettings().then(update);
    const channel = supabase
      .channel("site-settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "premium_settings", filter: "category=eq.site" },
        () => { cache = null; fetchSettings(); }
      )
      .subscribe();
    return () => {
      mounted = false;
      listeners.delete(update);
      supabase.removeChannel(channel);
    };
  }, []);
  return settings;
};