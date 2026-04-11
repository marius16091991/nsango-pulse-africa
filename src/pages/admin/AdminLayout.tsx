import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Send, Megaphone, BarChart3, Users,
  Settings, Crown, LogOut, Bell, Eye, PieChart, Newspaper,
  MessageSquare, Image, Menu, X, ChevronRight, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const menuSections = [
  {
    label: "Général",
    items: [
      { label: "Tableau de bord", icon: LayoutDashboard, path: "/admin" },
      { label: "Notifications", icon: Bell, path: "/admin/notifications", badge: 3 },
    ],
  },
  {
    label: "Contenus",
    items: [
      { label: "Articles", icon: FileText, path: "/admin/articles" },
      { label: "Médias", icon: Image, path: "/admin/medias" },
      { label: "Publications", icon: Send, path: "/admin/publications" },
      { label: "Magazine", icon: Newspaper, path: "/admin/magazine" },
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
    label: "Utilisateurs",
    items: [
      { label: "Abonnements", icon: Crown, path: "/admin/subscriptions" },
      { label: "Utilisateurs", icon: Users, path: "/admin/users" },
    ],
  },
  {
    label: "Système",
    items: [
      { label: "Analytiques", icon: BarChart3, path: "/admin/analytics" },
      { label: "Diffusion", icon: Eye, path: "/admin/distribution" },
      { label: "Paramètres", icon: Settings, path: "/admin/settings" },
    ],
  },
];

const AdminLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

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

  return (
    <div className="flex flex-col h-screen bg-muted/30 overflow-hidden">
      {/* Top bar */}
      <header className="h-14 bg-card border-b border-border flex items-center px-4 shrink-0 z-50 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="mr-3 hover:bg-muted"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <Link to="/admin" className="flex items-center gap-2 mr-3">
          <span className="text-gold font-display text-xl font-bold">N</span>
          <span className="font-display text-sm font-semibold hidden sm:inline">Admin</span>
        </Link>
        {currentPage && (
          <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
            <ChevronRight className="w-3 h-3" />
            <span>{currentPage.label}</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-3">
          <Link to="/admin/notifications">
            <Button variant="ghost" size="icon" className="relative hover:bg-muted">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[9px] flex items-center justify-center font-bold">3</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-gold" />
            </div>
            <span className="text-xs font-medium hidden md:inline max-w-[120px] truncate">
              {profile?.display_name || user.email}
            </span>
          </div>
        </div>
      </header>

      {/* Overlay menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100]" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <nav
            className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-card border-r border-border shadow-2xl animate-fade-in overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-border">
              <Link to="/admin" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <span className="text-gold font-display text-xl font-bold">N</span>
                <span className="font-display text-sm font-semibold">Nsango Admin</span>
              </Link>
              <Button variant="ghost" size="icon" className="hover:bg-muted" onClick={() => setMenuOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Menu items */}
            <div className="py-3 space-y-1">
              {menuSections.map((section) => (
                <div key={section.label} className="px-3 mb-2">
                  <p className="px-3 mb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    {section.label}
                  </p>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                            isActive(item.path)
                              ? "bg-gold/10 text-gold font-medium shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {'badge' in item && item.badge && (
                            <span className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-3 space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span>Voir le site</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Déconnexion</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
