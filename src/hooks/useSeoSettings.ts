import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SeoSettings = Record<string, string>;

const DEFAULTS: SeoSettings = {
  default_title: "Nsango Magazine — Les visages qui inspirent l'Afrique",
  title_template: "%s — Nsango Magazine",
  default_description: "Nsango Magazine — magazine numérique premium dédié aux personnalités influentes du continent africain.",
  default_keywords: "",
  default_og_image: "",
  canonical_base_url: "https://nsangomagazine.com",
  default_robots: "index,follow",
  default_language: "fr-FR",
  twitter_handle: "@nsangomagazine",
  twitter_card_type: "summary_large_image",
  facebook_app_id: "",
  gsc_verification: "",
  ga4_measurement_id: "",
  meta_pixel_id: "",
  bing_verification: "",
  organization_name: "Nsango Magazine",
  organization_logo: "",
  organization_url: "https://nsangomagazine.com",
  organization_sameas: "[]",
  robots_txt: "",
};

let cache: SeoSettings | null = null;
let inflight: Promise<SeoSettings> | null = null;
const listeners = new Set<(s: SeoSettings) => void>();

const fetchAll = async (): Promise<SeoSettings> => {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const { data } = await supabase.from("seo_settings").select("key, value");
    const merged: SeoSettings = { ...DEFAULTS };
    (data || []).forEach((r: any) => {
      if (r.value !== null && r.value !== undefined) merged[r.key] = r.value;
    });
    cache = merged;
    listeners.forEach((l) => l(merged));
    inflight = null;
    return merged;
  })();
  return inflight;
};

export const invalidateSeoCache = () => { cache = null; fetchAll(); };

export const useSeoSettings = (): SeoSettings => {
  const [s, setS] = useState<SeoSettings>(cache || DEFAULTS);
  useEffect(() => {
    let mounted = true;
    const update = (v: SeoSettings) => mounted && setS(v);
    listeners.add(update);
    fetchAll().then(update);
    return () => { mounted = false; listeners.delete(update); };
  }, []);
  return s;
};