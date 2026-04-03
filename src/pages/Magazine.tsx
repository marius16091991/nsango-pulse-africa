import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import { Crown, Download, BookOpen, ChevronRight } from "lucide-react";

import magazineImg from "@/assets/magazine-cover.jpg";
import businessImg from "@/assets/business-leadership.jpg";
import cultureImg from "@/assets/culture-lifestyle.jpg";
import heroImg from "@/assets/hero-personality.jpg";

const currentIssue = {
  img: magazineImg,
  title: "Édition Avril 2026",
  subtitle: "Spécial : Les bâtisseurs de l'Afrique de demain",
  pages: 120,
  articles: 25,
  sommaire: [
    "Couverture : Amara Diallo, la visionnaire de la tech africaine",
    "Dossier : Les 50 leaders qui transforment le continent",
    "Interview exclusive : Aliko Dangote",
    "Mode : Fashion Week de Lagos",
    "Culture : Les artistes qui conquièrent le monde",
    "Portfolio : L'Afrique en images",
    "Business : L'essor des FinTech africaines",
    "Talents : 10 jeunes à suivre en 2026",
  ],
};

const archives = [
  { img: heroImg, title: "Édition Mars 2026", subtitle: "Les femmes qui dirigent l'Afrique" },
  { img: businessImg, title: "Édition Février 2026", subtitle: "Innovation & Entrepreneuriat" },
  { img: cultureImg, title: "Édition Janvier 2026", subtitle: "Rétrospective 2025 & Perspectives" },
  { img: magazineImg, title: "Édition Décembre 2025", subtitle: "Spécial Nsango Awards" },
  { img: heroImg, title: "Édition Novembre 2025", subtitle: "Le sport africain en pleine ascension" },
  { img: businessImg, title: "Édition Octobre 2025", subtitle: "Investir en Afrique" },
];

const Magazine = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      {/* Hero */}
      <section className="gradient-dark py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Cover */}
            <div className="flex justify-center">
              <div className="relative">
                <img src={currentIssue.img} alt={currentIssue.title} className="w-72 md:w-80 rounded-lg shadow-elegant" />
                <div className="absolute -top-3 -right-3 bg-gold text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded font-body">Nouveau</div>
              </div>
            </div>
            {/* Info */}
            <div>
              <span className="text-gold text-xs uppercase tracking-[0.2em] font-body font-semibold">Magazine du mois</span>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mt-3">{currentIssue.title}</h1>
              <p className="text-primary-foreground/70 font-body mt-2 text-lg">{currentIssue.subtitle}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-primary-foreground/50 font-body">
                <span>{currentIssue.pages} pages</span>
                <span>·</span>
                <span>{currentIssue.articles} articles</span>
              </div>
              <div className="flex gap-3 mt-6">
                <Button className="bg-gold hover:bg-gold-dark text-primary font-semibold text-xs uppercase tracking-wider font-body gap-2">
                  <BookOpen className="w-4 h-4" />
                  Lire maintenant
                </Button>
                <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-xs uppercase tracking-wider font-body gap-2">
                  <Download className="w-4 h-4" />
                  Télécharger PDF
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-primary-foreground/40 font-body">
                <Crown className="w-3.5 h-3.5 text-gold" />
                Réservé aux abonnés Premium
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sommaire */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="font-display text-2xl font-bold mb-6">Sommaire</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentIssue.sommaire.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:shadow-card transition-shadow cursor-pointer group">
              <span className="text-gold font-display font-bold text-lg w-8">{String(i + 1).padStart(2, "0")}</span>
              <p className="font-body text-sm group-hover:text-gold transition-colors flex-1">{item}</p>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
            </div>
          ))}
        </div>
      </section>

      <div className="container mx-auto px-4">
        <AdBanner variant="horizontal" />
      </div>

      {/* Flipbook Preview */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="font-display text-2xl font-bold mb-6">Aperçu du magazine</h2>
        <div className="bg-card rounded-xl border border-border p-6 md:p-10">
          <div className="flex justify-center gap-2 md:gap-4">
            <div className="w-[45%] max-w-[300px] aspect-[3/4] rounded-lg overflow-hidden shadow-elegant bg-muted">
              <img src={magazineImg} alt="Page gauche" className="w-full h-full object-cover" />
            </div>
            <div className="w-[45%] max-w-[300px] aspect-[3/4] rounded-lg overflow-hidden shadow-elegant bg-muted">
              <img src={heroImg} alt="Page droite" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <Button variant="outline" size="sm" className="text-xs font-body">← Page précédente</Button>
            <span className="text-xs text-muted-foreground font-body self-center">Pages 2–3 sur {currentIssue.pages}</span>
            <Button variant="outline" size="sm" className="text-xs font-body">Page suivante →</Button>
          </div>
        </div>
      </section>

      {/* Archives */}
      <section className="bg-secondary py-12">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold mb-6">Archives</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {archives.map((a, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-card">
                  <img src={a.img} alt={a.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h4 className="font-display font-bold text-xs mt-2 group-hover:text-gold transition-colors">{a.title}</h4>
                <p className="text-[10px] text-muted-foreground font-body">{a.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-card rounded-2xl p-8 md:p-12 shadow-elegant border border-gold/20 text-center max-w-2xl mx-auto">
          <Crown className="w-10 h-10 text-gold mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold">Abonnez-vous au Magazine</h2>
          <p className="text-muted-foreground font-body mt-3 text-sm max-w-md mx-auto">
            Recevez chaque mois le magazine complet en version numérique et accédez à tous les numéros précédents.
          </p>
          <Button className="bg-gold hover:bg-gold-dark text-primary font-semibold text-xs uppercase tracking-wider font-body mt-6 gap-2">
            <Crown className="w-3.5 h-3.5" />
            Devenir Premium — 9,99€/mois
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Magazine;
