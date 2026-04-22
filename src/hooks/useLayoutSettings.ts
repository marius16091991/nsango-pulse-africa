import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LayoutSettings {
  header_ribbon_text: string;
  header_tagline_label: string;
  header_premium_button_label: string;
  header_search_placeholder: string;
  footer_tagline: string;
  footer_premium_title: string;
  footer_premium_text: string;
  footer_premium_button: string;
  footer_copyright_suffix: string;
}

const DEFAULTS: LayoutSettings = {
  header_ribbon_text: "Les visages qui inspirent l'Afrique",
  header_tagline_label: "Magazine",
  header_premium_button_label: "Premium",
  header_search_placeholder: "Rechercher des articles, personnalités...",
  footer_tagline: "Le magazine digital premium dédié aux personnalités influentes du continent.",
  footer_premium_title: "Premium",
  footer_premium_text: "Accédez à tous nos contenus exclusifs et au magazine mensuel.",
  footer_premium_button: "S'abonner",
  footer_copyright_suffix: "Tous droits réservés.",
};

let cache: LayoutSettings | null = null;
let inflight: Promise<LayoutSettings> | null = null;
const listeners = new Set<(s: LayoutSettings) => void>();

const fetchAll = async (): Promise<LayoutSettings> => {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const { data } = await supabase
      .from("premium_settings")
      .select("key,value")
      .eq("category", "layout");
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

export const useLayoutSettings = (): LayoutSettings => {
  const [s, setS] = useState<LayoutSettings>(cache || DEFAULTS);
  useEffect(() => {
    let mounted = true;
    const upd = (v: LayoutSettings) => mounted && setS(v);
    listeners.add(upd);
    fetchAll().then(upd);
    const ch = supabase
      .channel(`layout-settings-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "premium_settings", filter: "category=eq.layout" },
        () => { cache = null; fetchAll(); })
      .subscribe();
    return () => { mounted = false; listeners.delete(upd); supabase.removeChannel(ch); };
  }, []);
  return s;
};
