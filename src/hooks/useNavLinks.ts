import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toAppPath } from "@/lib/links";

export interface NavLink {
  id: string;
  location: "header" | "footer";
  column_key: string;
  group_label: string;
  group_icon: string | null;
  label: string;
  href: string;
  description: string | null;
  icon: string | null;
  highlight: boolean;
  visible: boolean;
  sort_order: number;
}

export const useNavLinks = (location: "header" | "footer", onlyVisible = true) => {
  const [links, setLinks] = useState<NavLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    let q = supabase.from("nav_links").select("*").eq("location", location).order("sort_order");
    if (onlyVisible) q = q.eq("visible", true);
    const { data } = await q;
    setLinks((((data as any) || []) as NavLink[]).map((link) => ({ ...link, href: toAppPath(link.href) })));
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
    const ch = supabase
      .channel(`nav-${location}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "nav_links", filter: `location=eq.${location}` },
        () => fetchLinks())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, onlyVisible]);

  return { links, loading, refresh: fetchLinks };
};

/** Group header links by column_key preserving first-seen order */
export const groupNavLinks = (links: NavLink[]) => {
  const map = new Map<string, { key: string; label: string; icon: string | null; items: NavLink[] }>();
  for (const l of links) {
    const k = l.column_key || "main";
    if (!map.has(k)) map.set(k, { key: k, label: l.group_label, icon: l.group_icon, items: [] });
    map.get(k)!.items.push(l);
  }
  return Array.from(map.values());
};
