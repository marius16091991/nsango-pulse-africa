import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import ArticleCard from "@/components/ArticleCard";
import SectionTitle from "@/components/SectionTitle";
import { Crown, Play, Headphones, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import heroImg from "@/assets/hero-personality.jpg";
import featuredImg from "@/assets/personality-featured.jpg";
import cultureImg from "@/assets/culture-lifestyle.jpg";
import businessImg from "@/assets/business-leadership.jpg";
import talentImg from "@/assets/talent-emergent.jpg";
import magazineImg from "@/assets/magazine-cover.jpg";

const fallbackImages = [heroImg, featuredImg, cultureImg, businessImg, talentImg];

const Index = () => {
  const [dbArticles, setDbArticles] = useState<any[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  useEffect(() => {
    supabase.from("articles").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setDbArticles(data || []));
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.includes("@")) {
      toast.error("Adresse email invalide");
      return;
    }
    toast.success("Merci ! Vous êtes inscrit à la newsletter Kibafood.");
    setNewsletterEmail("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Spacer for fixed header */}
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[500px] max-h-[800px] overflow-hidden">
        <img src={heroImg} alt="Personnalité de la semaine" width={1920} height={1080} className="w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12 md:pb-16">
            <span className="inline-block bg-gold text-primary text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded mb-4 font-body">
              Personnalité de la semaine
            </span>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground max-w-3xl leading-tight">
              Amara Diallo, la vision d'une Afrique qui innove
            </h2>
            <p className="text-primary-foreground/80 font-body mt-4 max-w-xl text-sm md:text-base">
              CEO de NovaTech Africa, elle révolutionne l'accès à la technologie sur le continent et inspire une nouvelle génération d'entrepreneurs.
            </p>
            <div className="flex gap-3 mt-6">
              <Link to="/portraits">
                <Button className="bg-gold hover:bg-gold-dark text-primary font-semibold text-xs uppercase tracking-wider font-body gap-2">
                  Lire le portrait
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/videos">
                <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-xs uppercase tracking-wider font-body gap-2">
                  <Play className="w-4 h-4" />
                  Voir l'interview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top Ad Banner */}
      <div className="container mx-auto px-4 py-4">
        <AdBanner variant="horizontal" />
      </div>

      {/* À la Une */}
      <section className="container mx-auto px-4 py-12">
        <SectionTitle title="À la Une" subtitle="Les articles incontournables du moment" gold />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ArticleCard
              image={businessImg}
              category="Business & Leadership"
              title="Les 50 leaders africains qui transforment l'économie du continent"
              excerpt="Notre classement annuel des personnalités les plus influentes dans le monde des affaires en Afrique."
              author="Rédaction Nsango"
              date="2 Avril 2026"
              readTime="12 min"
              size="large"
            />
          </div>
          <div className="flex flex-col gap-6">
            <ArticleCard
              image={cultureImg}
              category="Culture & Lifestyle"
              title="Fashion Week de Lagos : les créateurs qui redéfinissent le style"
              size="small"
              premium
            />
            <ArticleCard
              image={talentImg}
              category="Talents émergents"
              title="Kofi Mensah, 24 ans, et sa startup qui cartonne"
              size="small"
            />
          </div>
        </div>
      </section>

      {/* Articles from database */}
      {dbArticles.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <SectionTitle title="Derniers articles" subtitle="Publiés par la rédaction" gold />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbArticles.slice(0, 6).map((a, i) => (
              <Link key={a.id} to={`/article/${a.id}`}>
                <ArticleCard
                  image={a.cover_url || fallbackImages[i % fallbackImages.length]}
                  category={a.category}
                  title={a.title}
                  excerpt={a.summary || undefined}
                  author={a.author_name || undefined}
                  date={new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  size={i === 0 ? "large" : "medium"}
                  premium={a.premium}
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tendances */}
      <section className="bg-secondary py-12">
        <div className="container mx-auto px-4">
          <SectionTitle title="Tendances" subtitle="Ce qui fait l'actualité" gold />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: featuredImg, cat: "Portraits", title: "Ngozi Okonjo-Iweala : une carrière exemplaire" },
              { img: businessImg, cat: "Politique", title: "Le sommet de l'Union Africaine en 5 points clés" },
              { img: cultureImg, cat: "Culture", title: "Les artistes africains qui conquièrent le monde" },
              { img: talentImg, cat: "Innovation", title: "FinTech en Afrique : l'essor des paiements mobiles" },
            ].map((a, i) => (
              <ArticleCard key={i} image={a.img} category={a.cat} title={a.title} size="small" />
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories + Sidebar */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SectionTitle title="Success Stories" subtitle="Des parcours inspirants" gold />
            <div className="space-y-6">
              {[
                { img: featuredImg, cat: "Entrepreneuriat", title: "De vendeur ambulant à PDG : l'histoire de Moussa Traoré", excerpt: "Un parcours hors du commun qui illustre la résilience africaine.", author: "Fatou Bamba", date: "1 Avril 2026" },
                { img: businessImg, cat: "Tech", title: "Aya Technologies lève 50 millions de dollars", excerpt: "La startup kényane confirme son ambition panafricaine.", author: "Jean Ekambi", date: "31 Mars 2026" },
              ].map((a, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                    <img src={a.img} alt={a.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div>
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em] font-body">{a.cat}</span>
                    <h3 className="font-display font-bold text-base mt-1 group-hover:text-gold transition-colors">{a.title}</h3>
                    <p className="text-sm text-muted-foreground font-body mt-1 line-clamp-1">{a.excerpt}</p>
                    <span className="text-xs text-muted-foreground/60 font-body mt-1 block">{a.author} · {a.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <AdBanner variant="inline" className="mt-8" />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <AdBanner variant="sidebar" />

            {/* Magazine du mois */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h4 className="text-gold text-xs uppercase tracking-[0.2em] font-body font-semibold mb-4">Magazine du mois</h4>
              <img src={magazineImg} alt="Nsango Magazine Avril 2026" loading="lazy" className="w-full rounded-lg shadow-elegant mb-4" />
              <h5 className="font-display font-bold text-lg">Édition Avril 2026</h5>
              <p className="text-sm text-muted-foreground font-body mt-1">Spécial : Les bâtisseurs de l'Afrique de demain</p>
              <div className="flex gap-2 mt-4">
                <Link to="/magazine" className="flex-1">
                  <Button size="sm" className="bg-gold hover:bg-gold-dark text-primary text-xs uppercase tracking-wider font-body w-full">
                    Lire
                  </Button>
                </Link>
                <Link to="/magazine" className="flex-1">
                  <Button size="sm" variant="outline" className="text-xs uppercase tracking-wider font-body w-full">
                    PDF
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Business & Leadership */}
      <section className="gradient-dark py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <SectionTitle title="Business & Leadership" gold />
            <Link to="/business" className="text-gold text-xs uppercase tracking-wider font-body hover:underline hidden sm:block">
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { img: businessImg, title: "L'essor du private equity en Afrique subsaharienne" },
              { img: featuredImg, title: "Interview exclusive : le patron de Dangote Group" },
              { img: talentImg, title: "Les jeunes CEO africains qui bousculent les codes" },
            ].map((a, i) => (
              <ArticleCard key={i} image={a.img} category="Business" title={a.title} size="medium" premium={i === 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Culture & Lifestyle */}
      <section className="container mx-auto px-4 py-12">
        <SectionTitle title="Culture & Lifestyle" subtitle="Art, mode, gastronomie et plus encore" gold />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { img: cultureImg, title: "Nollywood : les films africains à ne pas manquer en 2026" },
            { img: featuredImg, title: "Les chefs étoilés qui subliment la cuisine africaine" },
            { img: talentImg, title: "Afrobeats : la conquête mondiale continue" },
            { img: businessImg, title: "Architecture : les bâtiments iconiques du continent" },
          ].map((a, i) => (
            <ArticleCard key={i} image={a.img} category="Culture" title={a.title} size="small" />
          ))}
        </div>
      </section>

      {/* Ad between sections */}
      <div className="container mx-auto px-4">
        <AdBanner variant="horizontal" />
      </div>

      {/* Talents émergents */}
      <section className="container mx-auto px-4 py-12">
        <SectionTitle title="Talents émergents" subtitle="La relève africaine" gold />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { img: talentImg, title: "Aisha Bello, 22 ans, pionnière de l'IA au Nigeria" },
            { img: featuredImg, title: "De Dakar à la Silicon Valley : le parcours de Ibrahima Sow" },
            { img: cultureImg, title: "Les 10 jeunes africains à suivre en 2026" },
          ].map((a, i) => (
            <ArticleCard key={i} image={a.img} category="Talents" title={a.title} size="medium" />
          ))}
        </div>
      </section>

      {/* Video Section */}
      <section className="bg-secondary py-12">
        <div className="container mx-auto px-4">
          <SectionTitle title="Vidéos" subtitle="Interviews, reportages et documentaires" gold />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Interview : Amara Diallo sur l'avenir tech en Afrique", duration: "12:34" },
              { title: "Reportage : Les marchés émergents du continent", duration: "08:45" },
              { title: "Documentaire : L'entrepreneuriat féminin en Afrique de l'Est", duration: "25:12" },
            ].map((v, i) => (
              <Link key={i} to="/videos" className="group cursor-pointer block">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img src={i === 0 ? featuredImg : i === 1 ? businessImg : cultureImg} alt={v.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 gradient-hero opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-primary fill-primary ml-1" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded font-body">{v.duration}</span>
                </div>
                <h3 className="font-display font-bold text-sm mt-3 group-hover:text-gold transition-colors">{v.title}</h3>
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <AdBanner variant="inline" />
          </div>
        </div>
      </section>

      {/* Podcast Section */}
      <section className="container mx-auto px-4 py-12">
        <SectionTitle title="Podcasts" subtitle="Écoutez les voix de l'Afrique" gold />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Épisode 42 : Le leadership au féminin en Afrique", guest: "Dr. Amina Mohammed", duration: "45 min" },
            { title: "Épisode 41 : Investir en Afrique en 2026", guest: "Aliko Dangote", duration: "38 min" },
            { title: "Épisode 40 : L'art contemporain africain", guest: "El Anatsui", duration: "52 min" },
            { title: "Épisode 39 : Sport et business", guest: "Didier Drogba", duration: "41 min" },
          ].map((p, i) => (
            <Link key={i} to="/podcasts" className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:shadow-card transition-shadow cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-bold text-sm group-hover:text-gold transition-colors truncate">{p.title}</h4>
                <p className="text-xs text-muted-foreground font-body">Avec {p.guest} · {p.duration}</p>
              </div>
              <Play className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Sponsored Section */}
      <section className="border-y border-border py-12">
        <div className="container mx-auto px-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body mb-6">Contenu sponsorisé</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { img: businessImg, title: "Comment MTN transforme la connectivité en Afrique", sponsor: "MTN Group" },
              { img: cultureImg, title: "Découvrez les nouveaux hôtels de luxe du continent", sponsor: "Radisson Blu" },
              { img: talentImg, title: "Bourses d'études : les opportunités pour la jeunesse", sponsor: "Fondation MasterCard" },
            ].map((s, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[3/2] rounded-lg overflow-hidden">
                  <img src={s.img} alt={s.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <span className="text-[10px] text-muted-foreground/60 font-body uppercase tracking-wider mt-2 block">Sponsorisé par {s.sponsor}</span>
                <h4 className="font-display font-bold text-sm mt-1 group-hover:text-gold transition-colors">{s.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="gradient-dark py-16">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <Mail className="w-10 h-10 text-gold mx-auto mb-4" />
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">Restez informé</h2>
          <p className="text-sm text-primary-foreground/60 font-body mt-3">
            Recevez chaque semaine les portraits, interviews et articles qui font l'actualité africaine.
          </p>
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 mt-6">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Votre adresse email"
              className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            <Button type="submit" className="bg-gold hover:bg-gold-dark text-primary font-semibold text-xs uppercase tracking-wider font-body px-8">
              S'inscrire
            </Button>
          </form>
          <p className="text-[10px] text-primary-foreground/30 font-body mt-3">
            En vous inscrivant, vous acceptez notre politique de confidentialité.
          </p>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-card rounded-2xl p-8 md:p-12 shadow-elegant border border-gold/20 text-center max-w-3xl mx-auto">
          <Crown className="w-10 h-10 text-gold mx-auto mb-4" />
          <h2 className="font-display text-2xl md:text-3xl font-bold">Passez au Premium</h2>
          <p className="text-muted-foreground font-body mt-3 max-w-md mx-auto text-sm">
            Accédez à tous nos contenus exclusifs, au magazine mensuel et à des interviews inédites.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <div className="bg-secondary rounded-xl p-6 flex-1 max-w-xs border border-border">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-body">Mensuel</p>
              <p className="font-display text-3xl font-bold mt-2">9,99€</p>
              <p className="text-xs text-muted-foreground font-body">/mois</p>
              <Link to="/magazine" className="block">
                <Button className="w-full mt-4 bg-gold hover:bg-gold-dark text-primary text-xs uppercase tracking-wider font-body">
                  Choisir
                </Button>
              </Link>
            </div>
            <div className="bg-secondary rounded-xl p-6 flex-1 max-w-xs border-2 border-gold relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full font-body">
                Populaire
              </span>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-body">Annuel</p>
              <p className="font-display text-3xl font-bold mt-2">79,99€</p>
              <p className="text-xs text-muted-foreground font-body">/an — 2 mois offerts</p>
              <Link to="/magazine" className="block">
                <Button className="w-full mt-4 bg-gold hover:bg-gold-dark text-primary text-xs uppercase tracking-wider font-body">
                  Choisir
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
