import { useState } from "react";
import { Search, Menu, X, Crown, User, LogOut, Tv, Sparkles, Newspaper, Compass, ChevronDown, Headphones, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Graduated UX: Discover → Inspire → Live → Watch → Read → About
const navGroups = [
  {
    label: "Découvrir",
    icon: Compass,
    items: [
      { label: "Accueil", href: "/", desc: "Le meilleur de Nsango" },
      { label: "Actualités", href: "/actualites", desc: "Toutes les dernières nouvelles" },
      { label: "Portraits", href: "/portraits", desc: "Visages qui inspirent" },
    ],
  },
  {
    label: "Inspirer",
    icon: Sparkles,
    items: [
      { label: "Business", href: "/business", desc: "Leaders & innovation" },
      { label: "Interviews", href: "/interviews", desc: "Voix d'exception" },
    ],
  },
  {
    label: "Vivre",
    icon: Newspaper,
    items: [
      { label: "Culture", href: "/culture", desc: "Art, mode, lifestyle" },
      { label: "Événements", href: "/evenements", desc: "Agenda & rendez-vous" },
    ],
  },
  {
    label: "Écouter & Lire",
    icon: Headphones,
    items: [
      { label: "Podcasts", href: "/podcasts", desc: "L'audio Nsango" },
      { label: "Magazine", href: "/magazine", desc: "L'édition imprimée" },
      { label: "À propos", href: "/a-propos", desc: "Notre histoire & contact" },
    ],
  },
];

const flatItems = [
  { label: "Nsango TV", href: "/videos", icon: Tv, highlight: true },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="gradient-dark px-4 py-1.5 text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-gold font-body">
          Les visages qui inspirent l'Afrique
        </p>
      </div>

      <div className="container mx-auto px-4 flex items-center justify-between h-16 lg:h-20 gap-4">
        <button className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Nsango Magazine — Accueil">
          <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">
            <span className="text-gold">K</span>ibafood
          </h1>
          <span className="hidden sm:inline text-xs uppercase tracking-[0.15em] text-muted-foreground font-body border-l border-border pl-2">
            Magazine
          </span>
        </Link>

        {/* Desktop nav with grouped dropdowns */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center" onMouseLeave={() => setOpenGroup(null)}>
          {navGroups.map((group) => (
            <div key={group.label} className="relative" onMouseEnter={() => setOpenGroup(group.label)}>
              <button className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium tracking-wide uppercase font-body transition-colors",
                openGroup === group.label ? "text-gold" : "text-foreground/80 hover:text-gold"
              )}>
                <group.icon className="w-3.5 h-3.5" />
                {group.label}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
              {openGroup === group.label && (
                <div className="absolute top-full left-0 pt-1 animate-fade-in">
                  <div className="bg-background border border-border rounded-lg shadow-elegant min-w-[220px] p-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setOpenGroup(null)}
                        className={cn(
                          "block px-3 py-2 rounded-md text-sm transition-colors",
                          isActive(item.href) ? "bg-gold/10 text-gold" : "hover:bg-secondary"
                        )}
                      >
                        <p className="font-medium font-body uppercase tracking-wider text-xs">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground font-body mt-0.5 normal-case tracking-normal">{item.desc}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {flatItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium tracking-wide uppercase font-body transition-colors",
                item.highlight && "text-gold",
                isActive(item.href) ? "text-gold" : !item.highlight && "text-foreground/80 hover:text-gold"
              )}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-foreground/70 hover:text-gold transition-colors" aria-label="Rechercher">
            <Search className="w-5 h-5" />
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-xs uppercase tracking-wider font-body gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{profile?.display_name || "Admin"}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => signOut()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-xs uppercase tracking-wider font-body">
                Connexion
              </Button>
            </Link>
          )}
          <Link to="/magazine">
            <Button size="sm" className="bg-gold hover:bg-gold-dark text-primary font-semibold text-xs uppercase tracking-wider font-body gap-1">
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Premium</span>
            </Button>
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border px-4 py-3 animate-fade-in">
          <div className="container mx-auto">
            <input type="text" placeholder="Rechercher des articles, personnalités..." className="w-full bg-secondary px-4 py-2.5 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-gold/50" autoFocus />
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in max-h-[80vh] overflow-y-auto">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-2">
                <p className="flex items-center gap-1.5 px-3 mb-1 text-[10px] uppercase tracking-widest text-gold font-semibold">
                  <group.icon className="w-3 h-3" /> {group.label}
                </p>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block px-3 py-2 text-sm text-foreground/80 hover:text-gold hover:bg-secondary rounded-lg font-body"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-1">
              {flatItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 text-sm font-medium font-body rounded-lg",
                    item.highlight ? "text-gold" : "text-foreground/80 hover:text-gold hover:bg-secondary"
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" /> {item.label}
                </Link>
              ))}
            </div>
            {user ? (
              <>
                <Link to="/admin" className="px-3 py-3 text-sm font-medium text-gold uppercase tracking-wider font-body" onClick={() => setMenuOpen(false)}>
                  Espace Admin
                </Link>
                <button onClick={() => { signOut(); setMenuOpen(false); }} className="px-3 py-3 text-sm font-medium text-destructive uppercase tracking-wider font-body text-left">
                  Déconnexion
                </button>
              </>
            ) : (
              <Link to="/auth" className="px-3 py-3 text-sm font-medium text-gold uppercase tracking-wider font-body" onClick={() => setMenuOpen(false)}>
                Connexion
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
