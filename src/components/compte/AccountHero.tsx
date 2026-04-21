import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, ShieldCheck, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole, ROLE_LABELS, ROLE_BADGE_STYLES } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";

interface Props {
  subscriptionStatus?: "premium" | "pending" | "none";
  subscriptionPlan?: string | null;
}

const AccountHero = ({ subscriptionStatus = "none", subscriptionPlan }: Props) => {
  const { user, profile } = useAuth();
  const { primaryRole, primaryRoleLabel } = useUserRole();

  const initials = (() => {
    const name = profile?.display_name || user?.email || "?";
    const parts = name.trim().split(/[\s@._-]+/).filter(Boolean);
    return (parts.slice(0, 2).map((p) => p[0]).join("") || name[0] || "?").toUpperCase();
  })();

  const badgeStyle = ROLE_BADGE_STYLES[primaryRole];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-gold/20 bg-card shadow-elegant">
      {/* Decorative gradient layers */}
      <div className="absolute inset-0 gradient-dark opacity-95" aria-hidden />
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.55), transparent 70%)" }}
        aria-hidden
      />
      <div
        className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--bordeaux) / 0.6), transparent 70%)" }}
        aria-hidden
      />

      <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full gradient-gold opacity-60 blur-md" aria-hidden />
          <Avatar className="relative h-20 w-20 md:h-24 md:w-24 border-2 border-gold/60 shadow-elegant">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile?.display_name || "Avatar"} />}
            <AvatarFallback className="bg-gold/20 text-gold text-2xl font-display font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-background tracking-tight truncate">
              {profile?.display_name || user?.email?.split("@")[0] || "Membre Nsango"}
            </h1>
            <Badge className={cn("border", badgeStyle, "uppercase text-[10px] tracking-widest")}>
              <UserIcon className="w-3 h-3 mr-1" />
              {primaryRoleLabel}
            </Badge>
          </div>

          <p className="text-sm text-background/70 truncate">{user?.email}</p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {subscriptionStatus === "premium" ? (
              <Badge className="border border-gold/40 bg-gold/15 text-gold uppercase text-[10px] tracking-widest gap-1">
                <Crown className="w-3 h-3" /> Premium {subscriptionPlan ? `· ${subscriptionPlan}` : ""}
              </Badge>
            ) : subscriptionStatus === "pending" ? (
              <Badge className="border border-bordeaux/40 bg-bordeaux/15 text-background uppercase text-[10px] tracking-widest gap-1">
                <Sparkles className="w-3 h-3" /> En attente · {subscriptionPlan}
              </Badge>
            ) : (
              <Badge className="border border-background/20 bg-background/10 text-background/80 uppercase text-[10px] tracking-widest gap-1">
                <Sparkles className="w-3 h-3" /> Lecteur · gratuit
              </Badge>
            )}
            <Badge className="border border-background/20 bg-background/10 text-background/80 uppercase text-[10px] tracking-widest gap-1">
              <ShieldCheck className="w-3 h-3" /> Compte sécurisé
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountHero;