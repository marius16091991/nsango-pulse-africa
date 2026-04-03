import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import ArticleCard from "@/components/ArticleCard";
import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Globe, Briefcase } from "lucide-react";

import businessImg from "@/assets/business-leadership.jpg";
import featuredImg from "@/assets/personality-featured.jpg";
import talentImg from "@/assets/talent-emergent.jpg";
import heroImg from "@/assets/hero-personality.jpg";

const categories = ["Tous", "Entrepreneuriat", "Finance", "Tech", "Industrie", "Leadership", "Startups"];

const stats = [
  { icon: TrendingUp, label: "Croissance PIB Afrique", value: "+4.2%" },
  { icon: BarChart3, label: "Investissements IDE", value: "$83B" },
  { icon: Globe, label: "Startups financées", value: "1,200+" },
  { icon: Briefcase, label: "Emplois créés", value: "2.5M" },
];

const articles = [
  { img: businessImg, cat: "Finance", title: "Les 50 leaders africains qui transforment l'économie du continent", excerpt: "Notre classement annuel des personnalités les plus influentes dans le monde des affaires.", author: "Rédaction Nsango", date: "2 Avril 2026", readTime: "12 min", premium: true },
  { img: featuredImg, cat: "Entrepreneuriat", title: "De vendeur ambulant à PDG : l'histoire de Moussa Traoré", excerpt: "Un parcours hors du commun qui illustre la résilience africaine.", author: "Fatou Bamba", date: "1 Avril 2026", readTime: "10 min" },
  { img: talentImg, cat: "Tech", title: "Aya Technologies lève 50 millions de dollars", excerpt: "La startup kényane confirme son ambition panafricaine.", author: "Jean Ekambi", date: "31 Mars 2026", readTime: "8 min" },
  { img: heroImg, cat: "Industrie", title: "L'essor du private equity en Afrique subsaharienne", excerpt: "Les fonds d'investissement misent sur le potentiel du continent.", author: "Kofi Asante", date: "30 Mars 2026", readTime: "14 min", premium: true },
  { img: businessImg, cat: "Leadership", title: "Interview exclusive : le patron de Dangote Group", excerpt: "Aliko Dangote partage sa vision stratégique pour la prochaine décennie.", author: "David Ndungu", date: "29 Mars 2026", readTime: "15 min" },
  { img: talentImg, cat: "Startups", title: "Les jeunes CEO africains qui bousculent les codes", excerpt: "Nouvelle génération d'entrepreneurs audacieux sur le continent.", author: "Amina Diop", date: "28 Mars 2026", readTime: "9 min" },
  { img: featuredImg, cat: "Finance", title: "FinTech en Afrique : l'essor des paiements mobiles", excerpt: "Comment la technologie financière transforme les économies africaines.", author: "Jean Ekambi", date: "27 Mars 2026", readTime: "11 min" },
  { img: heroImg, cat: "Entrepreneuriat", title: "Le sommet africain de l'entrepreneuriat 2026", excerpt: "Les moments forts de cet événement rassemblant les meilleurs talents.", author: "Fatou Bamba", date: "26 Mars 2026", readTime: "7 min" },
];

const Business = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] max-h-[500px] overflow-hidden">
        <img src={businessImg} alt="Business & Leadership" className="w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">Business & Leadership</h1>
            <p className="text-primary-foreground/70 font-body mt-3 max-w-lg text-sm md:text-base">
              L'actualité économique et entrepreneuriale du continent africain.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="gradient-dark py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="text-center p-4">
                <s.icon className="w-6 h-6 text-gold mx-auto mb-2" />
                <p className="font-display text-2xl font-bold text-primary-foreground">{s.value}</p>
                <p className="text-xs text-primary-foreground/50 font-body uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((c, i) => (
            <Button key={c} variant={i === 0 ? "default" : "outline"} size="sm"
              className={i === 0 ? "bg-gold hover:bg-gold-dark text-primary text-xs uppercase tracking-wider font-body" : "text-xs uppercase tracking-wider font-body"}>
              {c}
            </Button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <AdBanner variant="horizontal" />
      </div>

      {/* Articles */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a, i) => (
            <ArticleCard key={i} image={a.img} category={a.cat} title={a.title} excerpt={a.excerpt} author={a.author} date={a.date} readTime={a.readTime} size="medium" premium={a.premium} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="outline" className="text-xs uppercase tracking-wider font-body px-8">Charger plus d'articles</Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Business;
