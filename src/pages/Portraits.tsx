import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import ArticleCard from "@/components/ArticleCard";
import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";

import featuredImg from "@/assets/personality-featured.jpg";
import heroImg from "@/assets/hero-personality.jpg";
import businessImg from "@/assets/business-leadership.jpg";
import cultureImg from "@/assets/culture-lifestyle.jpg";
import talentImg from "@/assets/talent-emergent.jpg";

const categories = ["Tous", "Politique", "Business", "Culture", "Sport", "Innovation", "Médias"];

const portraits = [
  { img: heroImg, cat: "Business", title: "Amara Diallo, la visionnaire qui transforme la tech africaine", excerpt: "CEO de NovaTech Africa, elle révolutionne l'accès à la technologie sur le continent.", author: "Rédaction Nsango", date: "2 Avril 2026", readTime: "12 min", premium: true },
  { img: featuredImg, cat: "Politique", title: "Ngozi Okonjo-Iweala : une carrière au service du continent", excerpt: "Retour sur le parcours exceptionnel de cette figure majeure de la diplomatie africaine.", author: "Fatou Bamba", date: "1 Avril 2026", readTime: "10 min" },
  { img: businessImg, cat: "Business", title: "Aliko Dangote : l'homme le plus riche d'Afrique se confie", excerpt: "Interview exclusive avec le magnat nigérian sur sa vision pour le continent.", author: "Jean Ekambi", date: "31 Mars 2026", readTime: "15 min", premium: true },
  { img: cultureImg, cat: "Culture", title: "Burna Boy : de Lagos aux Grammy Awards", excerpt: "L'artiste nigérian raconte son ascension fulgurante sur la scène mondiale.", author: "Amina Diop", date: "30 Mars 2026", readTime: "8 min" },
  { img: talentImg, cat: "Innovation", title: "Juliana Rotich : la pionnière tech du Kenya", excerpt: "Co-fondatrice d'Ushahidi, elle redéfinit l'innovation sociale par la technologie.", author: "Kofi Asante", date: "29 Mars 2026", readTime: "9 min" },
  { img: heroImg, cat: "Sport", title: "Eliud Kipchoge : l'homme qui a brisé la barrière des 2h au marathon", excerpt: "Le champion kényan partage sa philosophie de vie et d'entraînement.", author: "David Ndungu", date: "28 Mars 2026", readTime: "11 min" },
  { img: featuredImg, cat: "Médias", title: "Chimamanda Ngozi Adichie : la voix littéraire de l'Afrique", excerpt: "L'écrivaine nigériane parle de son engagement et de l'avenir de la littérature africaine.", author: "Fatou Bamba", date: "27 Mars 2026", readTime: "10 min" },
  { img: businessImg, cat: "Business", title: "Mo Ibrahim : le philanthrope qui veut changer la gouvernance africaine", excerpt: "Sa fondation continue de promouvoir la bonne gouvernance sur le continent.", author: "Jean Ekambi", date: "26 Mars 2026", readTime: "13 min" },
];

const Portraits = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] max-h-[500px] overflow-hidden">
        <img src={heroImg} alt="Portraits" className="w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">Portraits</h1>
            <p className="text-primary-foreground/70 font-body mt-3 max-w-lg text-sm md:text-base">
              Découvrez les personnalités qui façonnent l'Afrique d'aujourd'hui et de demain.
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

      <div className="container mx-auto px-4 py-4">
        <AdBanner variant="horizontal" />
      </div>

      {/* Articles Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portraits.map((a, i) => (
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

export default Portraits;
