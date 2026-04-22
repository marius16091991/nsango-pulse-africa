import { Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import PremiumDialog from "@/components/PremiumDialog";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { NETWORKS, type SocialNetwork } from "@/lib/socialShare";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const rubriques = [
  { label: "Portraits", to: "/portraits" },
  { label: "Business & Leadership", to: "/business" },
  { label: "Culture & Lifestyle", to: "/culture" },
  { label: "Interviews", to: "/interviews" },
  { label: "Talents émergents", to: "/portraits" },
  { label: "Actualités", to: "/actualites" },
];

const aboutLinks = [
  { label: "Qui sommes-nous", to: "/a-propos" },
  { label: "Contact", to: "/a-propos#contact" },
  { label: "Événements", to: "/evenements" },
  { label: "Podcasts", to: "/podcasts" },
  { label: "Connexion", to: "/auth" },
];

const Footer = () => {
  const [premiumOpen, setPremiumOpen] = useState(false);
  const { accounts } = useSocialAccounts(true);
  const site = useSiteSettings();
  const firstLetter = site.site_name.charAt(0) || "N";
  const restName = site.site_name.slice(1) || "sango";
  return (
  <footer className="gradient-dark text-primary-foreground">
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <h3 className="font-display text-2xl font-bold mb-2">
            <span className="text-gold">{firstLetter}</span>{restName}
          </h3>
          <p className="text-sm text-primary-foreground/60 font-body leading-relaxed">
            {site.site_slogan}. Le magazine digital premium dédié aux personnalités influentes du continent.
          </p>
          <a href={`mailto:${site.site_contact_email}`} className="block text-xs text-primary-foreground/50 mt-4 hover:text-gold font-body">
            {site.site_contact_email}
          </a>
          <div className="flex gap-3 mt-6">
            {accounts.map((a) => {
              const cfg = NETWORKS[a.network as SocialNetwork];
              if (!cfg) return null;
              const Icon = cfg.icon;
              return (
                <a
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={cfg.label}
                  className="w-9 h-9 rounded-full bg-primary-foreground/5 hover:bg-gold hover:text-primary text-primary-foreground/60 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-gold text-xs uppercase tracking-[0.2em] font-body font-semibold mb-4">Rubriques</h4>
          {rubriques.map((r) => (
            <Link key={r.label} to={r.to} className="block text-sm text-primary-foreground/60 hover:text-gold transition-colors mb-2 font-body">
              {r.label}
            </Link>
          ))}
        </div>

        <div>
          <h4 className="text-gold text-xs uppercase tracking-[0.2em] font-body font-semibold mb-4">À propos</h4>
          {aboutLinks.map((r) => (
            <Link key={r.label} to={r.to} className="block text-sm text-primary-foreground/60 hover:text-gold transition-colors mb-2 font-body">
              {r.label}
            </Link>
          ))}
        </div>

        <div>
          <h4 className="text-gold text-xs uppercase tracking-[0.2em] font-body font-semibold mb-4">Premium</h4>
          <p className="text-sm text-primary-foreground/60 font-body mb-4">
            Accédez à tous nos contenus exclusifs et au magazine mensuel.
          </p>
          <button
            onClick={() => setPremiumOpen(true)}
            className="gradient-gold px-6 py-2.5 rounded-lg text-sm font-semibold font-body uppercase tracking-wider inline-flex items-center gap-2 text-primary hover:opacity-90 transition-opacity"
          >
            <Crown className="w-4 h-4" />
            S'abonner
          </button>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between gap-3 text-center sm:text-left">
        <p className="text-xs text-primary-foreground/40 font-body">
          &copy; {new Date().getFullYear()} {site.site_name}. Tous droits réservés.
        </p>
        <div className="flex gap-4 justify-center text-xs text-primary-foreground/40 font-body">
          <Link to="/a-propos" className="hover:text-gold">Mentions légales</Link>
          <Link to="/a-propos" className="hover:text-gold">Confidentialité</Link>
        </div>
      </div>
    </div>
    <PremiumDialog open={premiumOpen} onOpenChange={setPremiumOpen} />
  </footer>
  );
};

export default Footer;
