import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/** Charge toutes les redirections actives une fois et applique côté client. */
let cache: Array<{ from_path: string; to_path: string }> | null = null;

const fetchRedirects = async () => {
  if (cache) return cache;
  const { data } = await supabase
    .from("seo_redirects")
    .select("from_path, to_path")
    .eq("active", true);
  cache = data || [];
  return cache;
};

export const useSeoRedirects = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    fetchRedirects().then((rules) => {
      if (cancelled) return;
      const match = rules.find((r) => r.from_path === location.pathname);
      if (match && match.to_path && match.to_path !== location.pathname) {
        // Incrément asynchrone du compteur
        supabase.rpc("increment_redirect_hit", { _from: match.from_path });
        navigate(match.to_path, { replace: true });
      }
    });
    return () => { cancelled = true; };
  }, [location.pathname, navigate]);
};