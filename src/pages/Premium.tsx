import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Crown, Check, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const plans = [
  {
    name: "Mensuel",
    price: "9,99€",
    period: "/mois",
    features: ["Accès à tous les articles premium", "Magazine mensuel PDF", "Newsletter exclusive", "Sans publicité"],
    popular: false,
    plan: "Bronze",
    amount: 9.99,
  },
  {
    name: "Annuel",
    price: "79,99€",
    period: "/an",
    badge: "2 mois offerts",
    features: ["Tout l'offre mensuelle", "Interviews vidéo inédites", "Événements VIP", "Archives complètes"],
    popular: true,
    plan: "Or",
    amount: 79.99,
  },
];

const Premium = () => {
  const { user } = useAuth();
  useEffect(() => { document.title = "Premium — Nsango Magazine"; }, []);

  const handleSubscribe = (planName: string) => {
    if (!user) {
      toast.info("Connectez-vous pour souscrire");
      return;
    }
    toast.success(`Abonnement ${planName} — paiement bientôt disponible`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      <section className="container mx-auto px-4 py-16 text-center max-w-3xl">
        <Crown className="w-12 h-12 text-gold mx-auto mb-4" />
        <h1 className="font-display text-3xl md:text-5xl font-bold">Devenez membre Premium</h1>
        <p className="text-muted-foreground font-body mt-4">
          Accédez à tous nos contenus exclusifs, au magazine mensuel et à des interviews inédites des personnalités qui inspirent l'Afrique.
        </p>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative bg-card rounded-2xl p-8 border ${p.popular ? "border-gold shadow-elegant" : "border-border"}`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full font-body flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Populaire
                </span>
              )}
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-body">{p.name}</p>
              <p className="font-display text-4xl font-bold mt-2">{p.price}<span className="text-base text-muted-foreground font-body">{p.period}</span></p>
              {p.badge && <p className="text-xs text-gold font-body mt-1">{p.badge}</p>}
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm font-body">
                    <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe(p.name)}
                className="w-full mt-8 bg-gold hover:bg-gold-dark text-primary text-xs uppercase tracking-wider font-body"
              >
                Choisir {p.name}
              </Button>
            </div>
          ))}
        </div>

        {!user && (
          <p className="text-center mt-8 text-sm text-muted-foreground font-body">
            Déjà abonné ? <Link to="/auth" className="text-gold hover:underline">Connectez-vous</Link>
          </p>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Premium;
