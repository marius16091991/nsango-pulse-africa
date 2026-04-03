import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import ArticleCard from "@/components/ArticleCard";
import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";

import cultureImg from "@/assets/culture-lifestyle.jpg";
import featuredImg from "@/assets/personality-featured.jpg";
import talentImg from "@/assets/talent-emergent.jpg";
import heroImg from "@/assets/hero-personality.jpg";
import businessImg from "@/assets/business-leadership.jpg";

const categories = ["Tous", "Musique", "Cinéma", "Mode", "Art", "Gastronomie", "Littérature"];

const articles = [
  { img: cultureImg, cat: "Mode", title: "Fashion Week de Lagos : les créateurs qui redéfinissent le style", excerpt: "Les tendances africaines s'imposent sur la scène internationale.", author: "Amina Diop", date: "2 Avril 2026", readTime: "8 min", premium: true },
  { img: featuredImg, cat: "Gastronomie", title: "Les chefs étoilés qui subliment la cuisine africaine", excerpt: "De Dakar à Nairobi, la gastronomie africaine brille dans le monde.", author: "Fatou Bamba", date: "1 Avril 2026", readTime: "10 min" },
  { img: talentImg, cat: "Musique", title: "Afrobeats : la conquête mondiale continue", excerpt: "Comment le genre musical africain domine les charts internationaux.", author: "Kofi Asante", date: "31 Mars 2026", readTime: "7 min" },
  { img: heroImg, cat: "Cinéma", title: "Nollywood : les films africains à ne pas manquer en 2026", excerpt: "Notre sélection des productions les plus attendues de l'année.", author: "Jean Ekambi", date: "30 Mars 2026", readTime: "9 min", premium: true },
  { img: businessImg, cat: "Art", title: "Architecture : les bâtiments iconiques du continent", excerpt: "L'architecture africaine contemporaine repousse les limites du design.", author: "David Ndungu", date: "29 Mars 2026", readTime: "12 min" },
  { img: cultureImg, cat: "Littérature", title: "Les 10 livres africains incontournables de 2026", excerpt: "Notre sélection littéraire pour découvrir les voix du continent.", author: "Amina Diop", date: "28 Mars 2026", readTime: "6 min" },
  { img: featuredImg, cat: "Mode", title: "Haute couture africaine : tradition et modernité", excerpt: "Les designers qui fusionnent héritage culturel et innovation.", author: "Fatou Bamba", date: "27 Mars 2026", readTime: "8 min" },
  { img: talentImg, cat: "Musique", title: "Tems, Rema, Ayra Starr : la nouvelle garde de l'Afrobeats", excerpt: "Portrait de la génération qui porte la musique africaine au sommet.", author: "Kofi Asante", date: "26 Mars 2026", readTime: "10 min" },
];

const Culture = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] max-h-[500px] overflow-hidden">
        <img src={cultureImg} alt="Culture & Lifestyle" className="w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">Culture & Lifestyle</h1>
            <p className="text-primary-foreground/70 font-body mt-3 max-w-lg text-sm md:text-base">
              Art, mode, musique, gastronomie et plus encore — la richesse culturelle de l'Afrique.
            </p>
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

export default Culture;
