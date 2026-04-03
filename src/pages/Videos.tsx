import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import { Play, Clock, Eye } from "lucide-react";

import featuredImg from "@/assets/personality-featured.jpg";
import businessImg from "@/assets/business-leadership.jpg";
import cultureImg from "@/assets/culture-lifestyle.jpg";
import talentImg from "@/assets/talent-emergent.jpg";
import heroImg from "@/assets/hero-personality.jpg";

const categories = ["Toutes", "Interviews", "Reportages", "Documentaires", "Événements", "Coulisses"];

const featuredVideo = {
  img: heroImg,
  title: "Documentaire : Les bâtisseurs de l'Afrique de demain",
  description: "Un voyage à travers le continent pour rencontrer ceux qui construisent l'avenir.",
  duration: "52:30",
  views: "125K",
  date: "2 Avril 2026",
};

const videos = [
  { img: featuredImg, title: "Interview : Amara Diallo sur l'avenir tech en Afrique", duration: "12:34", views: "45K", cat: "Interviews" },
  { img: businessImg, title: "Reportage : Les marchés émergents du continent", duration: "08:45", views: "32K", cat: "Reportages" },
  { img: cultureImg, title: "L'entrepreneuriat féminin en Afrique de l'Est", duration: "25:12", views: "78K", cat: "Documentaires" },
  { img: talentImg, title: "Les startups qui révolutionnent l'agriculture africaine", duration: "15:20", views: "28K", cat: "Reportages" },
  { img: heroImg, title: "Sommet Nsango Awards 2025 : les moments forts", duration: "35:00", views: "95K", cat: "Événements" },
  { img: featuredImg, title: "Coulisses : la production du magazine Nsango", duration: "10:15", views: "18K", cat: "Coulisses" },
  { img: businessImg, title: "Le boom immobilier en Afrique de l'Ouest", duration: "18:42", views: "41K", cat: "Reportages" },
  { img: cultureImg, title: "Mode africaine : dans l'atelier de Lisa Folawiyo", duration: "22:10", views: "56K", cat: "Documentaires" },
  { img: talentImg, title: "Tech Hub Tour : Nairobi, Lagos, Le Cap", duration: "30:05", views: "67K", cat: "Reportages" },
];

const Videos = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      {/* Featured Video */}
      <section className="relative h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden group cursor-pointer">
        <img src={featuredVideo.img} alt={featuredVideo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gold/90 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-9 h-9 text-primary fill-primary ml-1" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-10">
            <span className="inline-block bg-gold text-primary text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded mb-3 font-body">À la une</span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground max-w-2xl">{featuredVideo.title}</h1>
            <p className="text-primary-foreground/70 font-body mt-2 max-w-lg text-sm">{featuredVideo.description}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-primary-foreground/50 font-body">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featuredVideo.duration}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {featuredVideo.views} vues</span>
              <span>{featuredVideo.date}</span>
            </div>
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

      {/* Videos Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img src={v.img} alt={v.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 gradient-hero opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary fill-primary ml-1" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 bg-primary/80 text-primary-foreground text-xs px-2 py-0.5 rounded font-body">{v.duration}</span>
                <span className="absolute top-2 left-2 bg-gold/90 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-body">{v.cat}</span>
              </div>
              <h3 className="font-display font-bold text-sm mt-3 group-hover:text-gold transition-colors line-clamp-2">{v.title}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-body">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {v.views} vues</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="outline" className="text-xs uppercase tracking-wider font-body px-8">Charger plus de vidéos</Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Videos;
