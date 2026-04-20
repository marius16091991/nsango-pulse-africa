import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Send, Megaphone, BarChart3, Users,
  Settings, Crown, LogOut, Bell, Eye, PieChart, Newspaper,
  MessageSquare, Image, Menu, X, ChevronRight, User, Tv, Sparkles, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import { useNotifications } from "@/hooks/useNotifications";

const buildMenuSections = (unread: number) => [
  {
    label: "Vue d'ensemble",
    items: [
      { label: "Tableau de bord", icon: LayoutDashboard, path: "/admin" },
      { label: "Notifications", icon: Bell, path: "/admin/notifications", badge: unread || undefined },
    ],
  },
  {
    label: "Contenus",
    items: [
      { label: "Articles", icon: FileText, path: "/admin/articles" },
      { label: "Vidéos / TV", icon: Tv, path: "/admin/videos" },
      { label: "Médias", icon: Image, path: "/admin/medias" },
      { label: "Publications", icon: Send, path: "/admin/publications" },
      { label: "Magazine", icon: Newspaper, path: "/admin/magazine" },
      { label: "Pages & Sections", icon: Layers, path: "/admin/content" },
    ],
  },
  {
    label: "Engagement",
    items: [
      { label: "Sondages", icon: PieChart, path: "/admin/surveys" },
      { label: "Commentaires", icon: MessageSquare, path: "/admin/comments" },
      { label: "Campagnes pub", icon: Megaphone, path: "/admin/advertising" },
    ],
  },
  {
    label: "Communauté",
    items: [
      { label: "Abonnements", icon: Crown, path: "/admin/subscriptions" },
      { label: "Utilisateurs", icon: Users, path: "/admin/users" },
    ],
  },
  {
    label: "Pilotage",
    items: [
      { label: "Analytiques", icon: BarChart3, path: "/admin/analytics" },
      { label: "Diffusion", icon: Eye, path: "/admin/distribution" },
      { label: "Paramètres", icon: Settings, path: "/admin/settings" },
    ],
  },
];

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const { unreadCount } = useNotifications();
  const menuSections = buildMenuSections(unreadCount);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  const currentPage = menuSections.flatMap(s => s.items).find(i => isActive(i.path));

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const Sidebar = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      {/* Brand */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border/60 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-display text-sm font-bold leading-tight">Nsango Studio</p>
          <p className="text-[10px] text-muted-foreground font-body uppercase tracking-widest">Console admin</p>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto py-4">
        {menuSections.map((section) => (
          <div key={section.label} className="px-3 mb-3">
            <p className="px-3 mb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/80 font-bold">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onItemClick}
                      className={cn(
                        "group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                        active
                          ? "bg-gradient-to-r from-gold/15 to-gold/5 text-gold font-semibold shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      )}
                    >
                      {active && <span className="absolute left-0 top-2 bottom-2 w-1 bg-gold rounded-r" />}
                      <item.icon className={cn("w-4 h-4 shrink-0 transition-transform", active && "scale-110")} />
                      <span className="flex-1 font-body">{item.label}</span>
                      {'badge' in item && item.badge && (
                        <span className="min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* User card + actions */}
      <div className="border-t border-border/60 p-3 space-y-2 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-secondary/50">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center">
            <User className="w-4 h-4 text-gold" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate">{profile?.display_name || user.email}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Link to="/" className="flex-1">
            <Button variant="ghost" size="sm" className="w-full text-xs gap-1.5 h-8">
              <Eye className="w-3.5 h-3.5" /> Site
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="flex-1 text-xs gap-1.5 h-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
            <LogOut className="w-3.5 h-3.5" /> Sortir
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[100]" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-card border-r border-border shadow-2xl animate-fade-in flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onItemClick={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-card/80 backdrop-blur-sm border-b border-border flex items-center px-4 lg:px-6 shrink-0 gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-muted"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/admin" className="text-xs text-muted-foreground hover:text-foreground font-body shrink-0">
              Admin
            </Link>
            {currentPage && currentPage.path !== "/admin" && (
              <>
                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-sm font-semibold font-body truncate">{currentPage.label}</span>
              </>
            )}
            {currentPage?.path === "/admin" && (
              <span className="text-sm font-semibold font-body">Tableau de bord</span>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell adminLink />
            <Link to="/" className="hidden sm:block">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                <Eye className="w-3.5 h-3.5" /> Voir le site
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
