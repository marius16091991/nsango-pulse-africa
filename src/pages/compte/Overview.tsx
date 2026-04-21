import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Shield, Crown, User as UserIcon, ArrowRight, Sparkles, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAccountBadges } from "@/hooks/useAccountBadges";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";

const ShortcutCard = ({
  to,
  icon: Icon,
  title,
  description,
  hint,
  hintVariant = "default",
}: {
  to: string;
  icon: any;
  title: string;
  description: string;
  hint?: string;
  hintVariant?: "default" | "gold" | "alert";
}) => (
  <Link to={to} className="group block">
    <Card className="h-full border-border hover:border-gold/40 hover:shadow-elegant transition-all duration-300 hover:-translate-y-0.5 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-display font-bold text-base">{title}</h3>
            {hint && (
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-semibold",
                  hintVariant === "gold" && "bg-gold/15 text-gold border-gold/30",
                  hintVariant === "alert" && "bg-destructive/15 text-destructive border-destructive/30",
                  hintVariant === "default" && "bg-muted text-muted-foreground border-border",
                )}
              >
                {hint}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          <div className="flex items-center gap-1 text-xs text-gold mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            Ouvrir <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
);

const Overview = () => {
  const { user } = useAuth();
  const badges = useAccountBadges();
  const { primaryRoleLabel } = useUserRole();

  if (!user) {
    return (
      <div className="space-y-6">
        <Card className="border-gold/30 bg-gradient-to-br from-gold/10 via-card to-card">
          <CardContent className="p-8 md:p-12 text-center space-y-4">
            <div className="inline-flex w-14 h-14 rounded-full bg-gold/15 border border-gold/30 items-center justify-center">
              <Lock className="w-6 h-6 text-gold" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Votre espace personnel Nsango</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Connectez-vous pour gérer votre profil, vos notifications, votre sécurité et votre abonnement premium.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Link to="/auth">
                <Button className="bg-gold hover:bg-gold-dark text-primary font-semibold gap-2">
                  Se connecter <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button variant="outline" className="border-gold/40 text-gold hover:bg-gold/10 hover:text-gold">
                  Créer un compte
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4 opacity-60 pointer-events-none">
          <Card><CardContent className="p-5"><h3 className="font-display font-bold mb-1">Profil</h3><p className="text-xs text-muted-foreground">Gérez vos informations.</p></CardContent></Card>
          <Card><CardContent className="p-5"><h3 className="font-display font-bold mb-1">Notifications</h3><p className="text-xs text-muted-foreground">Personnalisez vos alertes.</p></CardContent></Card>
          <Card><CardContent className="p-5"><h3 className="font-display font-bold mb-1">Sécurité</h3><p className="text-xs text-muted-foreground">Mot de passe et sessions.</p></CardContent></Card>
          <Card><CardContent className="p-5"><h3 className="font-display font-bold mb-1">Abonnement</h3><p className="text-xs text-muted-foreground">Découvrez Premium.</p></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border bg-gradient-to-br from-card to-secondary/30">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Rôle</p>
            <p className="font-display font-bold text-base mt-1 truncate">{primaryRoleLabel}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-gradient-to-br from-card to-secondary/30">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Notifications</p>
            <p className="font-display font-bold text-2xl text-gold mt-1">{badges.unreadNotifications}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-gradient-to-br from-card to-secondary/30">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Statut Premium</p>
            <p className="font-display font-bold text-base mt-1 capitalize">
              {badges.subscriptionStatus === "premium" ? "Actif" : badges.subscriptionStatus === "pending" ? "En attente" : "Gratuit"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-gradient-to-br from-card to-secondary/30">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Profil</p>
            <p className="font-display font-bold text-base mt-1">
              {badges.profileIncomplete ? "À compléter" : "Complet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Raccourcis */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold" /> Accès rapide
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <ShortcutCard
            to="/compte/profil"
            icon={UserIcon}
            title="Mon profil"
            description="Avatar, nom affiché, biographie."
            hint={badges.profileIncomplete ? "À compléter" : undefined}
            hintVariant="gold"
          />
          <ShortcutCard
            to="/compte/notifications"
            icon={Bell}
            title="Notifications"
            description="Préférences et historique des alertes."
            hint={badges.unreadNotifications > 0 ? `${badges.unreadNotifications} non lue${badges.unreadNotifications > 1 ? "s" : ""}` : undefined}
            hintVariant="gold"
          />
          <ShortcutCard
            to="/compte/securite"
            icon={Shield}
            title="Sécurité"
            description="Mot de passe protégé contre les fuites HIBP."
            hint={badges.securityAlerts > 0 ? "Alerte" : "Sécurisé"}
            hintVariant={badges.securityAlerts > 0 ? "alert" : "default"}
          />
          <ShortcutCard
            to="/compte/abonnement"
            icon={Crown}
            title="Abonnement"
            description={
              badges.subscriptionStatus === "premium"
                ? `Vous êtes ${badges.subscriptionPlan ?? "Premium"}.`
                : "Découvrez les avantages du club premium."
            }
            hint={
              badges.subscriptionStatus === "premium"
                ? "Premium"
                : badges.subscriptionStatus === "pending"
                ? "En attente"
                : "Upgrade"
            }
            hintVariant={badges.subscriptionStatus === "premium" ? "gold" : "default"}
          />
        </div>
      </div>
    </div>
  );
};

export default Overview;