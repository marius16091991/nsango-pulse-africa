import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, Send, Megaphone, BarChart3, Users,
  Settings, ChevronLeft, ChevronRight, Crown, LogOut, Bell,
  Eye, PieChart, Newspaper, MessageSquare, Image
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
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "h-full bg-primary text-primary-foreground flex flex-col transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-primary-foreground/10">
          {!collapsed && (
            <Link to="/admin" className="flex items-center gap-2">
              <span className="text-gold font-display text-xl font-bold">N</span>
              <span className="font-display text-sm font-semibold">Admin</span>
            </Link>
          )}
          {collapsed && (
            <Link to="/admin" className="mx-auto">
              <span className="text-gold font-display text-xl font-bold">N</span>
            </Link>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-4">
          {menuSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="px-4 mb-1 text-[10px] uppercase tracking-widest text-primary-foreground/40 font-body">
                  {section.label}
                </p>
              )}
              <ul className="space-y-0.5 px-2">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-body transition-colors",
                        isActive(item.path)
                          ? "bg-gold/20 text-gold"
                          : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-primary-foreground/10 p-2 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-primary-foreground/60 hover:text-primary-foreground font-body transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Retour au site</span>}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-primary-foreground/40 hover:text-primary-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="font-body">Réduire</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
