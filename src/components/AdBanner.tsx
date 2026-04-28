import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getVisitorId } from "@/lib/visitor";

interface AdBannerProps {
  variant?: "horizontal" | "sidebar" | "inline";
  className?: string;
  category?: string;
}

const AdBanner = ({ variant = "horizontal", className = "", category }: AdBannerProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const [creative, setCreative] = useState<any>(null);
  const tracked = useRef(false);

  useEffect(() => {
    (async () => {
      // Charge campagnes actives correspondant au format/page/catégorie
      const formatMap: Record<string, string> = {
        horizontal: "Bannière horizontale",
        sidebar: "Bannière latérale",
        inline: "Bloc inline",
      };
      const { data: camps } = await supabase
        .from("ad_campaigns")
        .select("id, name, click_url, format, target_pages, target_categories")
        .eq("status", "active");
      const path = location.pathname;
      const eligible = (camps || []).filter((c: any) => {
        if (c.format && c.format !== formatMap[variant]) return false;
        const pages: string[] = c.target_pages || [];
        if (pages.length && !pages.some(p => path.startsWith(p))) return false;
        const cats: string[] = c.target_categories || [];
        if (cats.length && category && !cats.includes(category)) return false;
        return true;
      });
      if (!eligible.length) return;
      const { data: cre } = await supabase
        .from("ad_creatives")
        .select("*")
        .in("campaign_id", eligible.map(c => c.id))
        .eq("active", true);
      if (!cre?.length) return;
      // Sélection pondérée
      const pool: any[] = [];
      cre.forEach((c: any) => { for (let i = 0; i < (c.weight || 1); i++) pool.push(c); });
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      const camp = eligible.find(e => e.id === chosen.campaign_id);
      setCreative({ ...chosen, _campaign: camp });
    })();
  }, [variant, location.pathname, category]);

  // Tracking impression à l'apparition
  useEffect(() => {
    if (!creative || tracked.current || !ref.current) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !tracked.current) {
        tracked.current = true;
        const visitor = getVisitorId();
        supabase.from("ad_events").insert({
          campaign_id: creative.campaign_id, creative_id: creative.id,
          event_type: "impression", page_path: location.pathname,
          user_id: user?.id || null, visitor_ip: user ? null : visitor,
        });
      }
    }, { threshold: 0.5 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [creative, location.pathname, user?.id]);

  const handleClick = async () => {
    if (!creative) return;
    const visitor = getVisitorId();
    await supabase.from("ad_events").insert({
      campaign_id: creative.campaign_id, creative_id: creative.id,
      event_type: "click", page_path: location.pathname,
      user_id: user?.id || null, visitor_ip: user ? null : visitor,
    });
    const url = creative.click_url || creative._campaign?.click_url;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const styles: Record<string, string> = {
    horizontal: "w-full h-20 md:h-24",
    sidebar: "w-full h-64",
    inline: "w-full h-32 md:h-40",
  };

  if (creative) {
    return (
      <div ref={ref} onClick={handleClick} className={`${styles[variant]} relative cursor-pointer overflow-hidden rounded-lg border border-border group ${className}`}>
        <img src={creative.image_url} alt={creative.alt || "Publicité"} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
        <span className="absolute top-1 right-1 text-[9px] uppercase tracking-widest bg-background/80 text-muted-foreground px-1.5 py-0.5 rounded">Sponsorisé</span>
      </div>
    );
  }

  return (
    <div ref={ref} className={`${styles[variant]} bg-secondary border border-border rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body">Espace publicitaire</p>
        <p className="text-[10px] text-muted-foreground/50 font-body mt-1">Annoncez ici — {variant === "sidebar" ? "300x250" : variant === "horizontal" ? "728x90" : "468x60"}</p>
      </div>
    </div>
  );
};

export default AdBanner;
