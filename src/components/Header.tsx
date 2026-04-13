import { useState } from "react";
import { Search, Menu, X, Crown, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Portraits", href: "/portraits" },
  { label: "Business", href: "/business" },
  { label: "Culture", href: "/culture" },
  { label: "Interviews", href: "/interviews" },
  { label: "Vidéos", href: "/videos" },
  { label: "Magazine", href: "/magazine" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="gradient-dark px-4 py-1.5 text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-gold font-body">
          Les visages qui inspirent l'Afrique
        </p>
      </div>

      <div className="container mx-auto px-4 flex items-center justify-between h-16 lg:h-20">
        <button className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <Link to="/" className="flex items-center gap-2">
          <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">
            <span className="text-gold">N</span>sango
          </h1>
          <span className="hidden sm:inline text-xs uppercase tracking-[0.15em] text-muted-foreground font-body border-l border-border pl-2">
            Magazine
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.label} to={item.href} className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-gold transition-colors tracking-wide uppercase font-body">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
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
          <Button size="sm" className="bg-gold hover:bg-gold-dark text-primary font-semibold text-xs uppercase tracking-wider font-body gap-1">
            <Crown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Premium</span>
          </Button>
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
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.label} to={item.href} className="px-3 py-3 text-sm font-medium text-foreground/80 hover:text-gold hover:bg-secondary rounded-lg transition-colors uppercase tracking-wider font-body" onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
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
