import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { Play, Clock, Calendar } from "lucide-react";

import featuredImg from "@/assets/personality-featured.jpg";
import businessImg from "@/assets/business-leadership.jpg";
import cultureImg from "@/assets/culture-lifestyle.jpg";
import talentImg from "@/assets/talent-emergent.jpg";
import heroImg from "@/assets/hero-personality.jpg";

const categories = ["Toutes", "Business", "Culture", "Politique", "Sport", "Innovation"];

const interviews = [
  { img: heroImg, guest: "Amara Diallo", role: "CEO de NovaTech Africa", title: "L'avenir de la tech en Afrique", duration: "45 min", date: "2 Avril 2026", type: "video", premium: true },
  { img: featuredImg, guest: "Ngozi Okonjo-Iweala", role: "Directrice générale de l'OMC", title: "Le commerce africain dans un monde en mutation", duration: "38 min", date: "28 Mars 2026", type: "video" },
  { img: businessImg, guest: "Aliko Dangote", role: "Président, Dangote Group", title: "Ma vision pour l'industrialisation de l'Afrique", duration: "52 min", date: "25 Mars 2026", type: "video", premium: true },
  { img: cultureImg, guest: "Burna Boy", role: "Artiste musical", title: "De Lagos aux scènes mondiales", duration: "30 min", date: "22 Mars 2026", type: "audio" },
  { img: talentImg, guest: "Juliana Rotich", role: "Co-fondatrice d'Ushahidi", title: "L'innovation sociale par la technologie", duration: "42 min", date: "20 Mars 2026", type: "video" },
  { img: heroImg, guest: "Didier Drogba", role: "Ancien footballeur & entrepreneur", title: "Sport, business et philanthropie", duration: "35 min", date: "18 Mars 2026", type: "audio" },
  { img: featuredImg, guest: "Chimamanda Ngozi Adichie", role: "Écrivaine", title: "La littérature comme arme de changement", duration: "48 min", date: "15 Mars 2026", type: "video", premium: true },
  { img: businessImg, guest: "Mo Ibrahim", role: "Fondateur, Mo Ibrahim Foundation", title: "Gouvernance et avenir de l'Afrique", duration: "55 min", date: "12 Mars 2026", type: "video" },
];

const Interviews = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      {/* Hero */}
      <section className="gradient-dark py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">Interviews</h1>
          <p className="text-primary-foreground/60 font-body mt-3 max-w-lg mx-auto text-sm md:text-base">
            Rencontres exclusives avec les personnalités qui façonnent le continent.
          </p>
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

      {/* Interview Cards */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interviews.map((item, i) => (
            <div key={i} className="group cursor-pointer bg-card rounded-xl overflow-hidden border border-border hover:shadow-card transition-shadow">
              <div className="relative aspect-video overflow-hidden">
                <img src={item.img} alt={item.guest} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 gradient-hero opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gold/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 text-primary fill-primary ml-1" />
                  </div>
                </div>
                {item.premium && (
                  <span className="absolute top-3 right-3 bg-gold text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded font-body">Premium</span>
                )}
                <span className="absolute bottom-3 right-3 bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded font-body flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.duration}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img src={item.img} alt={item.guest} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm">{item.guest}</p>
                    <p className="text-xs text-muted-foreground font-body">{item.role}</p>
                  </div>
                </div>
                <h3 className="font-display font-bold text-lg group-hover:text-gold transition-colors">{item.title}</h3>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground font-body">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
                  <span className="uppercase tracking-wider text-gold">{item.type === "video" ? "Vidéo" : "Audio"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="outline" className="text-xs uppercase tracking-wider font-body px-8">Charger plus d'interviews</Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Interviews;
