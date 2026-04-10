import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, Send, Megaphone, BarChart3, Users,
  Settings, Crown, LogOut, Bell, Eye, PieChart, Newspaper,
  MessageSquare, Image, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuSections = [
  {
    label: "Général",
    items: [
      { label: "Tableau de bord", icon: LayoutDashboard, path: "/admin" },
      { label: "Notifications", icon: Bell, path: "/admin/notifications" },
    ],
  },
  {
    label: "Contenus",
    items: [
      { label: "Articles", icon: FileText, path: "/admin/articles" },
      { label: "Médias", icon: Image, path: "/admin/medias" },
      { label: "Publications", icon: Send, path: "/admin/publications" },
      { label: "Magazine mensuel", icon: Newspaper, path: "/admin/magazine" },
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

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const currentPage = menuSections.flatMap(s => s.items).find(i => isActive(i.path));

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top bar */}
      <header className="h-14 bg-primary text-primary-foreground flex items-center px-4 shrink-0 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/10 mr-3"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <Link to="/admin" className="flex items-center gap-2 mr-4">
          <span className="text-gold font-display text-xl font-bold">N</span>
          <span className="font-display text-sm font-semibold hidden sm:inline">Admin</span>
        </Link>
        {currentPage && (
          <span className="text-sm font-body text-primary-foreground/70 hidden sm:inline">
            / {currentPage.label}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Link to="/" className="text-xs text-primary-foreground/60 hover:text-primary-foreground font-body flex items-center gap-1">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Retour au site</span>
          </Link>
        </div>
      </header>

      {/* Overlay menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100]" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-primary text-primary-foreground shadow-2xl animate-fade-in overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-primary-foreground/10">
              <Link to="/admin" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <span className="text-gold font-display text-xl font-bold">N</span>
                <span className="font-display text-sm font-semibold">Nsango Admin</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Menu items */}
            <nav className="py-3 space-y-4">
              {menuSections.map((section) => (
                <div key={section.label}>
                  <p className="px-4 mb-1 text-[10px] uppercase tracking-widest text-primary-foreground/40 font-body">
                    {section.label}
                  </p>
                  <ul className="space-y-0.5 px-2">
                    {section.items.map((item) => (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-body transition-colors",
                            isActive(item.path)
                              ? "bg-gold/20 text-gold"
                              : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5"
                          )}
                        >
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-primary-foreground/10 p-3">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-primary-foreground/60 hover:text-primary-foreground font-body transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Retour au site</span>
              </Link>
            </div>
          </div>
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
