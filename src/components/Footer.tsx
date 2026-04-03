import { Crown } from "lucide-react";

const Footer = () => (
  <footer className="gradient-dark text-primary-foreground">
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h3 className="font-display text-2xl font-bold mb-2">
            <span className="text-gold">N</span>sango
          </h3>
          <p className="text-sm text-primary-foreground/60 font-body leading-relaxed">
            Les visages qui inspirent l'Afrique. Le magazine digital premium dédié aux personnalités influentes du continent.
          </p>
          <div className="flex gap-4 mt-6">
            {["Facebook", "X", "Instagram", "LinkedIn", "YouTube"].map((s) => (
              <a key={s} href="#" className="text-xs text-primary-foreground/40 hover:text-gold transition-colors font-body uppercase tracking-wider">
                {s.slice(0, 2)}
              </a>
            ))}
          </div>
        </div>

        {/* Rubriques */}
        <div>
          <h4 className="text-gold text-xs uppercase tracking-[0.2em] font-body font-semibold mb-4">Rubriques</h4>
          {["Portraits", "Business & Leadership", "Culture & Lifestyle", "Politique & Société", "Talents émergents", "Interviews"].map((r) => (
            <a key={r} href="#" className="block text-sm text-primary-foreground/60 hover:text-gold transition-colors mb-2 font-body">{r}</a>
          ))}
        </div>

        {/* À propos */}
        <div>
          <h4 className="text-gold text-xs uppercase tracking-[0.2em] font-body font-semibold mb-4">À propos</h4>
          {["Qui sommes-nous", "Équipe éditoriale", "Annonceurs", "Mentions légales", "Contact"].map((r) => (
            <a key={r} href="#" className="block text-sm text-primary-foreground/60 hover:text-gold transition-colors mb-2 font-body">{r}</a>
          ))}
        </div>

        {/* Premium */}
        <div>
          <h4 className="text-gold text-xs uppercase tracking-[0.2em] font-body font-semibold mb-4">Premium</h4>
          <p className="text-sm text-primary-foreground/60 font-body mb-4">
            Accédez à tous nos contenus exclusifs et au magazine mensuel.
          </p>
          <button className="gradient-gold px-6 py-2.5 rounded-lg text-sm font-semibold font-body uppercase tracking-wider flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
            <Crown className="w-4 h-4" />
            S'abonner
          </button>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
        <p className="text-xs text-primary-foreground/40 font-body">
          &copy; 2026 Nsango Magazine. Tous droits réservés.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
