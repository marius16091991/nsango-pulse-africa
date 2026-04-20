import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PageSection {
  id: string;
  page_slug: string;
  section_key: string;
  section_type: string;
  title: string;
  subtitle: string;
  body: string;
  media_url: string;
  cta_label: string;
  cta_url: string;
  content_ids: string[];
  style: Record<string, any>;
  sort_order: number;
  visible: boolean;
}

export const usePageSections = (pageSlug: string, includeHidden = false) => {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = async () => {
    setLoading(true);
    let q = supabase.from("page_sections").select("*").eq("page_slug", pageSlug).order("sort_order");
    if (!includeHidden) q = q.eq("visible", true);
    const { data } = await q;
    setSections((data || []) as any);
    setLoading(false);
  };

  useEffect(() => { fetchSections(); }, [pageSlug, includeHidden]);

  return { sections, loading, refresh: fetchSections, setSections };
};

export const getSection = (sections: PageSection[], key: string): PageSection | undefined =>
  sections.find(s => s.section_key === key);
