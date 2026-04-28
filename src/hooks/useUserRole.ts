import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type DbRole = "admin" | "editor" | "premium" | "reader";

/** Libellés UI en français — l'enum DB reste inchangé. */
export const ROLE_LABELS: Record<DbRole, string> = {
  admin: "Administrateur",
  editor: "Agent",
  premium: "Lecteur premium",
  reader: "Lecteur",
};

export const ROLE_BADGE_STYLES: Record<DbRole, string> = {
  admin: "bg-destructive/15 text-destructive border-destructive/30",
  editor: "bg-primary/15 text-primary border-primary/30",
  premium: "bg-gold/15 text-gold border-gold/30",
  reader: "bg-muted text-muted-foreground border-border",
};

/** Hiérarchie : admin > editor (agent) > premium (lecteur premium) > reader. */
const ROLE_LEVEL: Record<DbRole, number> = {
  admin: 100,
  editor: 60,
  premium: 30,
  reader: 10,
};

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<DbRole[]>([]);
  const [priority, setPriority] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (authLoading) {
        if (!cancelled) setLoading(true);
        return;
      }
      if (!user) {
        if (!cancelled) {
          setRoles([]);
          setPriority(0);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role, priority")
        .eq("user_id", user.id);
      if (cancelled) return;
      if (error) {
        console.warn("Impossible de charger les rôles utilisateur", error.message);
        setRoles([]);
        setPriority(0);
        setLoading(false);
        return;
      }
      const list = (data || []) as { role: DbRole; priority: number }[];
      setRoles(list.map((r) => r.role));
      setPriority(list.reduce((m, r) => Math.max(m, r.priority || 0), 0));
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const isAdmin = roles.includes("admin");
  const isAgent = roles.includes("editor");
  const isPremium = roles.includes("premium");
  const isReader = roles.includes("reader") || roles.length === 0;

  const level = roles.reduce((m, r) => Math.max(m, ROLE_LEVEL[r] ?? 0), 0);
  const primaryRole: DbRole = isAdmin
    ? "admin"
    : isAgent
    ? "editor"
    : isPremium
    ? "premium"
    : "reader";

  const hasAdminConsoleAccess = isAdmin || isAgent;

  return {
    loading: loading || authLoading,
    roles,
    primaryRole,
    primaryRoleLabel: ROLE_LABELS[primaryRole],
    isAdmin,
    isAgent,
    isPremium,
    isReader,
    level,
    priority,
    hasAdminConsoleAccess,
  };
};