import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SeoOverride {
  id?: string;
  title?: string;
  description?: string;
  og_image?: string;
  canonical?: string;
  robots?: string;
  keywords?: string;
  jsonld?: any;
}

/** Récupère un override par route ou par target_id (article/video/page). */
export const useSeoOverride = (params: { route?: string; targetType?: string; targetId?: string | null }): SeoOverride | null => {
  const [data, setData] = useState<SeoOverride | null>(null);
  const key = `${params.route || ""}|${params.targetType || ""}|${params.targetId || ""}`;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      let q = supabase.from("seo_overrides").select("*").eq("active", true).limit(1);
      if (params.targetId && params.targetType) {
        q = q.eq("target_type", params.targetType).eq("target_id", params.targetId);
      } else if (params.route) {
        q = q.eq("route_pattern", params.route).is("target_id", null);
      } else {
        return;
      }
      const { data: rows } = await q;
      if (!cancelled) setData(rows && rows[0] ? rows[0] as any : null);
    };
    run();
    return () => { cancelled = true; };
  }, [key]);

  return data;
};