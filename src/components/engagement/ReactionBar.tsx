import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getVisitorId } from "@/lib/visitor";
import { cn } from "@/lib/utils";

const EMOJIS: { key: "heart" | "fire" | "clap"; icon: string; label: string }[] = [
  { key: "heart", icon: "❤️", label: "J'aime" },
  { key: "fire", icon: "🔥", label: "Top" },
  { key: "clap", icon: "👏", label: "Bravo" },
];

interface Props {
  targetType: "article" | "video" | "podcast" | "comment";
  targetId: string;
  size?: "sm" | "md";
}

const ReactionBar = ({ targetType, targetId, size = "md" }: Props) => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({ heart: 0, fire: 0, clap: 0 });
  const [mine, setMine] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("reactions")
      .select("emoji, user_id, voter_ip")
      .eq("target_type", targetType)
      .eq("target_id", targetId);
    const c: Record<string, number> = { heart: 0, fire: 0, clap: 0 };
    const m: Record<string, boolean> = {};
    const visitor = getVisitorId();
    (data || []).forEach((r: any) => {
      c[r.emoji] = (c[r.emoji] || 0) + 1;
      if ((user && r.user_id === user.id) || (!user && r.voter_ip === visitor)) m[r.emoji] = true;
    });
    setCounts(c); setMine(m);
  };

  useEffect(() => { load(); }, [targetType, targetId, user?.id]);

  const toggle = async (emoji: "heart" | "fire" | "clap") => {
    if (busy) return;
    setBusy(emoji);
    const visitor = getVisitorId();
    if (mine[emoji]) {
      const q = supabase.from("reactions").delete().eq("target_type", targetType).eq("target_id", targetId).eq("emoji", emoji);
      await (user ? q.eq("user_id", user.id) : q.eq("voter_ip", visitor));
    } else {
      await supabase.from("reactions").insert({
        target_type: targetType, target_id: targetId, emoji,
        user_id: user?.id || null, voter_ip: user ? null : visitor,
      });
    }
    await load();
    setBusy(null);
  };

  const px = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <div className="flex items-center gap-2">
      {EMOJIS.map(e => (
        <button
          key={e.key}
          onClick={() => toggle(e.key)}
          disabled={busy === e.key}
          aria-label={e.label}
          className={cn(
            "flex items-center gap-1.5 rounded-full border transition-all",
            px,
            mine[e.key]
              ? "bg-gold/15 border-gold/40 text-foreground"
              : "bg-secondary border-border hover:border-gold/40 hover:bg-secondary/80"
          )}
        >
          <span>{e.icon}</span>
          <span className="font-medium tabular-nums">{counts[e.key] || 0}</span>
        </button>
      ))}
    </div>
  );
};

export default ReactionBar;