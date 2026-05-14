import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { getVisitorId } from "@/lib/visitor";
import { X } from "lucide-react";

type Popup = any;

const STORAGE_KEY = "nsango_popups_seen";

const readSeen = (): Record<string, number> => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
};
const writeSeen = (data: Record<string, number>) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
};
const sessionSeen = (): Set<string> => {
  try { return new Set(JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]")); } catch { return new Set(); }
};
const markSession = (id: string) => {
  const s = sessionSeen(); s.add(id);
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...s])); } catch {}
};

const widthMap: Record<string, string> = {
  sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl", full: "max-w-full",
};
const radiusMap: Record<string, string> = {
  none: "rounded-none", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", xl: "rounded-2xl", full: "rounded-3xl",
};

const positionClasses = (type: string, position: string): string => {
  if (type === "banner") {
    return position === "bottom"
      ? "fixed bottom-0 left-0 right-0 z-[120]"
      : "fixed top-0 left-0 right-0 z-[120]";
  }
  if (type === "corner" || type === "toast") {
    const map: Record<string, string> = {
      "top-left": "fixed top-4 left-4",
      "top-right": "fixed top-4 right-4",
      "bottom-left": "fixed bottom-4 left-4",
      "bottom-right": "fixed bottom-4 right-4",
    };
    return `${map[position] || "fixed bottom-4 right-4"} z-[120]`;
  }
  // modal
  return "fixed inset-0 z-[120] flex items-center justify-center p-4";
};

const matchesPath = (patterns: string[], path: string): boolean => {
  if (!patterns.length) return true;
  return patterns.some(p => p === path || (p.endsWith("/*") ? path.startsWith(p.slice(0, -2)) : path.startsWith(p)));
};

const PopupView = ({ popup, onClose, onClick }: { popup: Popup; onClose: () => void; onClick: () => void }) => {
  const isModal = popup.display_type === "modal";
  const isBanner = popup.display_type === "banner";
  const wrapperCls = positionClasses(popup.display_type, popup.position);
  const animation =
    popup.animation === "slide" ? "animate-in slide-in-from-bottom-4 duration-300"
    : popup.animation === "zoom" ? "animate-in zoom-in-95 duration-200"
    : popup.animation === "none" ? ""
    : "animate-in fade-in duration-200";

  const content = (
    <div
      className={`relative shadow-2xl border ${radiusMap[popup.border_radius] || "rounded-lg"} ${isBanner ? "w-full" : widthMap[popup.width] || "max-w-md"} ${animation}`}
      style={{ background: popup.background_color, color: popup.text_color, borderColor: `${popup.accent_color}55` }}
      onClick={(e) => e.stopPropagation()}
    >
      {popup.show_close_button && (
        <button
          aria-label="Fermer"
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 rounded-full hover:bg-black/20 flex items-center justify-center transition-colors"
          style={{ color: popup.text_color }}
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {popup.image_url && (
        <img src={popup.image_url} alt="" className={`w-full ${isBanner ? "h-20 object-cover" : "h-40 object-cover " + (radiusMap[popup.border_radius] || "rounded-lg")}`} loading="lazy" />
      )}
      <div className={isBanner ? "px-6 py-3 flex flex-wrap items-center gap-4" : "p-6"}>
        {popup.title && (
          <h3 className={isBanner ? "font-bold text-base flex-shrink-0" : "font-display font-bold text-xl mb-2"} style={{ color: popup.accent_color }}>
            {popup.title}
          </h3>
        )}
        {popup.content && (
          <div
            className={isBanner ? "text-sm flex-1 min-w-[200px]" : "text-sm leading-relaxed mb-4"}
            dangerouslySetInnerHTML={{ __html: popup.content }}
          />
        )}
        {popup.cta_label && popup.cta_url && (
          <a
            href={popup.cta_url}
            target={popup.cta_url.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            onClick={onClick}
            className={`inline-block px-5 py-2 text-sm font-bold transition-all ${radiusMap[popup.border_radius] || "rounded-lg"} ${isBanner ? "" : "mt-2"}`}
            style={
              popup.cta_style === "outline"
                ? { border: `2px solid ${popup.accent_color}`, color: popup.accent_color, background: "transparent" }
                : popup.cta_style === "ghost"
                ? { color: popup.accent_color, background: "transparent" }
                : { background: popup.accent_color, color: popup.background_color }
            }
          >
            {popup.cta_label}
          </a>
        )}
      </div>
    </div>
  );

  if (isModal && popup.overlay) {
    return (
      <div className={wrapperCls} onClick={popup.show_close_button ? onClose : undefined}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" />
        <div className="relative w-full flex justify-center">{content}</div>
      </div>
    );
  }
  return <div className={wrapperCls}>{content}</div>;
};

const SitePopups = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [popups, setPopups] = useState<Popup[]>([]);
  const [active, setActive] = useState<Popup | null>(null);

  // Charge les popups actifs
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("site_popups")
        .select("*")
        .eq("status", "active")
        .order("priority", { ascending: false });
      if (cancelled) return;
      const now = new Date();
      const valid = (data || []).filter((p: any) => {
        if (p.start_at && new Date(p.start_at) > now) return false;
        if (p.end_at && new Date(p.end_at) < now) return false;
        return true;
      });
      setPopups(valid);
    })();
    return () => { cancelled = true; };
  }, [location.pathname]);

  // Évalue éligibilité + déclencheur
  useEffect(() => {
    if (!popups.length) return;
    if (location.pathname.startsWith("/admin")) return;

    const path = location.pathname;
    const seen = readSeen();
    const sess = sessionSeen();

    const eligible = popups.find((p: any) => {
      if (!matchesPath(p.target_pages || [], path)) return false;
      if ((p.exclude_pages || []).some((ex: string) => path.startsWith(ex))) return false;
      if (p.audience === "guests" && user) return false;
      if (p.audience === "authenticated" && !user) return false;
      // Fréquence
      if (p.frequency === "once_per_session" && sess.has(p.id)) return false;
      if (p.frequency === "once_per_day") {
        const last = seen[p.id] || 0;
        if (Date.now() - last < 86400000) return false;
      }
      if (p.frequency === "once_per_user" && seen[p.id]) return false;
      return true;
    });

    if (!eligible) return;

    const show = () => setActive(eligible);
    let cleanup: (() => void) | undefined;

    if (eligible.trigger === "delay") {
      const t = setTimeout(show, Math.max(0, (eligible.trigger_value || 3) * 1000));
      cleanup = () => clearTimeout(t);
    } else if (eligible.trigger === "scroll") {
      const onScroll = () => {
        const pct = (window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)) * 100;
        if (pct >= (eligible.trigger_value || 50)) { show(); window.removeEventListener("scroll", onScroll); }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanup = () => window.removeEventListener("scroll", onScroll);
    } else if (eligible.trigger === "exit_intent") {
      const onLeave = (e: MouseEvent) => { if (e.clientY <= 0) { show(); document.removeEventListener("mouseleave", onLeave); } };
      document.addEventListener("mouseleave", onLeave);
      cleanup = () => document.removeEventListener("mouseleave", onLeave);
    } else {
      show();
    }
    return cleanup;
  }, [popups, location.pathname, user]);

  // Tracking impression à l'apparition
  useEffect(() => {
    if (!active) return;
    const visitor = getVisitorId();
    supabase.from("popup_events").insert({
      popup_id: active.id, event_type: "impression",
      page_path: location.pathname, user_id: user?.id || null,
      visitor_ip: user ? null : visitor,
    });
    // Marque comme vu
    markSession(active.id);
    const seen = readSeen();
    seen[active.id] = Date.now();
    writeSeen(seen);
  }, [active?.id]);

  const close = useCallback(() => {
    if (!active) return;
    const visitor = getVisitorId();
    supabase.from("popup_events").insert({
      popup_id: active.id, event_type: "dismiss",
      page_path: location.pathname, user_id: user?.id || null,
      visitor_ip: user ? null : visitor,
    });
    setActive(null);
  }, [active, location.pathname, user]);

  const click = useCallback(() => {
    if (!active) return;
    const visitor = getVisitorId();
    supabase.from("popup_events").insert({
      popup_id: active.id, event_type: "click",
      page_path: location.pathname, user_id: user?.id || null,
      visitor_ip: user ? null : visitor,
    });
  }, [active, location.pathname, user]);

  if (!active || isAdmin === undefined) return null;
  return <PopupView popup={active} onClose={close} onClick={click} />;
};

export default SitePopups;