import { useEffect } from "react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useAccountBadges } from "@/hooks/useAccountBadges";
import AccountHero from "@/components/compte/AccountHero";
import { Loader2, LayoutDashboard, User as UserIcon, Bell, Shield, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const tabs = [
  { to: "/compte", label: "Vue d'ensemble", short: "Aperçu", icon: LayoutDashboard, end: true, badge: null as null | "profile" | "notifications" | "security" | "subscription" },
  { to: "/compte/profil", label: "Profil", short: "Profil", icon: UserIcon, end: false, badge: "profile" as const },
  { to: "/compte/notifications", label: "Notifications", short: "Notifs", icon: Bell, end: false, badge: "notifications" as const },
  { to: "/compte/securite", label: "Sécurité", short: "Sécurité", icon: Shield, end: false, badge: "security" as const },
  { to: "/compte/abonnement", label: "Abonnement", short: "Premium", icon: Crown, end: false, badge: "subscription" as const },
];

const CompteLayout = () => {
  const { user, loading } = useAuth();
  const badges = useAccountBadges();
  const location = useLocation();
  const navigate = useNavigate();
  const isOverview = location.pathname === "/compte" || location.pathname === "/compte/";

  // Redirection souple : /compte est public (overview en mode découverte),
  // les sous-onglets exigent une session.
  useEffect(() => {
    if (loading) return;
    if (!user && !isOverview) {
      navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [user, loading, isOverview, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  const renderBadge = (key: typeof tabs[number]["badge"]) => {
    if (!key || !user) return null;
    if (key === "notifications" && badges.unreadNotifications > 0) {
      return (
        <Badge className="ml-auto h-5 min-w-5 px-1.5 text-[10px] bg-gold text-primary border-0 font-bold">
          {badges.unreadNotifications > 99 ? "99+" : badges.unreadNotifications}
        </Badge>
      );
    }
    if (key === "profile" && badges.profileIncomplete) {
      return <span className="ml-auto h-2 w-2 rounded-full bg-gold animate-pulse" aria-label="Profil incomplet" />;
    }
    if (key === "security" && badges.securityAlerts > 0) {
      return <span className="ml-auto h-2 w-2 rounded-full bg-destructive animate-pulse" aria-label="Alerte sécurité" />;
    }
    if (key === "subscription") {
      if (badges.subscriptionStatus === "premium") {
        return (
          <Badge className="ml-auto h-5 px-1.5 text-[9px] bg-gold/20 text-gold border border-gold/40 uppercase tracking-wider">
            Actif
          </Badge>
        );
      }
      if (badges.subscriptionStatus === "pending") {
        return (
          <Badge className="ml-auto h-5 px-1.5 text-[9px] bg-bordeaux/20 text-bordeaux border border-bordeaux/40 uppercase tracking-wider">
            En attente
          </Badge>
        );
      }
      return (
        <Badge className="ml-auto h-5 px-1.5 text-[9px] bg-muted text-muted-foreground border uppercase tracking-wider">
          Upgrade
        </Badge>
      );
    }
    return null;
  };

  // Mobile bottom tabs : badges compacts
  const renderMobileBadge = (key: typeof tabs[number]["badge"]) => {
    if (!key || !user) return null;
    if (key === "notifications" && badges.unreadNotifications > 0) {
      return (
        <span className="absolute top-1 right-1/4 h-4 min-w-4 px-1 rounded-full bg-gold text-primary text-[9px] font-bold flex items-center justify-center">
          {badges.unreadNotifications > 9 ? "9+" : badges.unreadNotifications}
        </span>
      );
    }
    if ((key === "profile" && badges.profileIncomplete) || (key === "security" && badges.securityAlerts > 0)) {
      return (
        <span
          className={cn(
            "absolute top-1.5 right-1/4 h-2 w-2 rounded-full animate-pulse",
            key === "security" ? "bg-destructive" : "bg-gold",
          )}
        />
      );
    }
    if (key === "subscription" && badges.subscriptionStatus === "premium") {
      return <span className="absolute top-1.5 right-1/4 h-2 w-2 rounded-full bg-gold" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-10 pb-24 md:pb-10 max-w-5xl space-y-6 animate-fade-in">
        {user && (
          <AccountHero
            subscriptionStatus={badges.subscriptionStatus}
            subscriptionPlan={badges.subscriptionPlan}
          />
        )}

        {/* Desktop / tablet tabs */}
        <nav
          className="hidden md:flex items-center gap-1 p-1.5 rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-card overflow-x-auto"
          aria-label="Navigation du compte"
        >
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-body font-medium tracking-wide transition-all whitespace-nowrap flex-1 justify-center",
                  isActive
                    ? "bg-gradient-to-br from-gold/20 to-gold/5 text-gold shadow-sm border border-gold/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                )
              }
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {renderBadge(tab.badge)}
            </NavLink>
          ))}
        </nav>

        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border shadow-elegant"
        aria-label="Navigation du compte"
      >
        <div className="grid grid-cols-5">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium font-body tracking-wide transition-colors",
                  isActive ? "text-gold" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-b-full bg-gold" />
                  )}
                  <tab.icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                  <span className="uppercase tracking-wider">{tab.short}</span>
                  {renderMobileBadge(tab.badge)}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default CompteLayout;