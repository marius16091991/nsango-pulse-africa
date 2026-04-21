import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Sparkles, Calendar, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useAccountBadges } from "@/hooks/useAccountBadges";
import { usePremiumConfig } from "@/hooks/usePremiumConfig";
import PremiumDialog from "@/components/PremiumDialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Abonnement = () => {
  const { user } = useAuth();
  const badges = useAccountBadges();
  const { plans } = usePremiumConfig();
  const [open, setOpen] = useState(false);
  const [activeSub, setActiveSub] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setActiveSub(data));
    supabase
      .from("subscription_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setRequests(data || []));
  }, [user]);

  const isPremium = badges.subscriptionStatus === "premium";

  return (
    <div className="space-y-6">
      {/* Statut actuel */}
      <Card className="relative overflow-hidden border-gold/30 bg-gradient-to-br from-card via-card to-gold/5 shadow-elegant">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.6), transparent 70%)" }} aria-hidden />
        <CardContent className="relative p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-gold" />
                <h2 className="font-display text-xl font-bold">Mon abonnement</h2>
              </div>
              {isPremium ? (
                <>
                  <Badge className="bg-gold/15 text-gold border border-gold/40 uppercase text-[10px] tracking-widest">
                    Premium · {activeSub?.plan || badges.subscriptionPlan}
                  </Badge>
                  {activeSub?.started_at && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                      <Calendar className="w-3 h-3" />
                      Actif depuis le {format(new Date(activeSub.started_at), "d MMMM yyyy", { locale: fr })}
                    </p>
                  )}
                </>
              ) : badges.subscriptionStatus === "pending" ? (
                <>
                  <Badge className="bg-bordeaux/15 text-bordeaux border border-bordeaux/40 uppercase text-[10px] tracking-widest">
                    En attente de validation
                  </Badge>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                    <Clock className="w-3 h-3" />
                    Votre demande est en cours de traitement (sous 48h).
                  </p>
                </>
              ) : (
                <>
                  <Badge className="bg-muted text-muted-foreground border uppercase text-[10px] tracking-widest">
                    Lecteur · gratuit
                  </Badge>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Découvrez le club premium pour accéder aux articles exclusifs, au magazine et aux contenus réservés.
                  </p>
                </>
              )}
            </div>
            {!isPremium && (
              <Button onClick={() => setOpen(true)} className="bg-gold hover:bg-gold-dark text-primary font-semibold gap-2">
                <Sparkles className="w-4 h-4" /> Découvrir Premium
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plans (si non premium) */}
      {!isPremium && plans.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-base font-bold text-muted-foreground uppercase tracking-wider">Nos formules</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((p) => (
              <Card
                key={p.id}
                className={`relative ${p.highlighted ? "border-gold/50 shadow-elegant bg-gradient-to-br from-gold/5 to-transparent" : "border-border"}`}
              >
                {p.highlighted && (
                  <Badge className="absolute -top-2 right-3 bg-gold text-primary border-0 uppercase text-[9px] tracking-widest">
                    Recommandé
                  </Badge>
                )}
                <CardContent className="p-5 space-y-3">
                  <h4 className="font-display font-bold text-lg">{p.name}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold text-gold">{p.price}</span>
                    <span className="text-xs text-muted-foreground">{p.currency}</span>
                    <span className="text-xs text-muted-foreground">/ {p.duration}</span>
                  </div>
                  <ul className="space-y-1.5 pt-2">
                    {(Array.isArray(p.features) ? p.features : []).slice(0, 4).map((f: any, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                        <span>{typeof f === "string" ? f : f.label || ""}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => setOpen(true)}
                    className="w-full mt-3 bg-gold hover:bg-gold-dark text-primary font-semibold"
                    size="sm"
                  >
                    Choisir
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Historique des demandes */}
      {requests.length > 0 && (
        <Card className="border-border bg-card/80 backdrop-blur-sm shadow-card">
          <CardContent className="p-6 space-y-3">
            <h3 className="font-display font-bold text-base">Historique des demandes</h3>
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-background/50">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{r.plan_name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {format(new Date(r.created_at), "d MMM yyyy", { locale: fr })} · {r.amount} XAF · {r.payment_method}
                    </p>
                  </div>
                  <Badge
                    className={
                      r.status === "paid"
                        ? "bg-gold/15 text-gold border border-gold/30"
                        : r.status === "rejected"
                        ? "bg-destructive/15 text-destructive border border-destructive/30"
                        : "bg-muted text-muted-foreground border"
                    }
                  >
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <PremiumDialog open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default Abonnement;