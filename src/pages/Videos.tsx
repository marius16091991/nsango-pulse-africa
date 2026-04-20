import { useEffect, useMemo, useState } from "react";
import { Play, Radio, Clock, Tv, Eye, Star, Calendar } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-personality.jpg";

type Video = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  duration: string | null;
  source: string;
  url: string;
  thumbnail_url: string | null;
  program_slot: string | null;
  featured: boolean;
  views: number;
  created_at: string;
  scheduled_at: string | null;
};

const SLOTS = [
  { value: "morning", label: "Matinale", time: "06h — 12h", icon: "☀️" },
  { value: "afternoon", label: "Journée", time: "12h — 18h", icon: "🌤️" },
  { value: "prime", label: "Prime time", time: "18h — 23h", icon: "🌆" },
  { value: "night", label: "Nocturne", time: "23h — 06h", icon: "🌙" },
];

const getEmbedUrl = (v: Video) => {
  if (v.source === "youtube") {
    const m = v.url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0` : v.url;
  }
  return v.url;
};

const currentSlot = () => {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 23) return "prime";
  return "night";
};

const Videos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Video | null>(null);
  const [filterCat, setFilterCat] = useState<string>("all");

  useEffect(() => {
    document.title = "Nsango TV — La télévision en ligne";
    supabase
      .from("videos")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const list = (data || []) as Video[];
        setVideos(list);
        const featured = list.find(v => v.featured) || list[0];
        if (featured) setActive(featured);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const set = new Set(videos.map(v => v.category));
    return ["all", ...Array.from(set)];
  }, [videos]);

  const filtered = useMemo(
    () => (filterCat === "all" ? videos : videos.filter(v => v.category === filterCat)),
    [videos, filterCat]
  );

  const nowSlot = currentSlot();
  const onAir = videos.find(v => v.program_slot === nowSlot) || videos[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      {/* Brand strip */}
      <div className="gradient-dark border-b border-gold/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gold flex items-center justify-center">
              <Tv className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold text-primary-foreground">Nsango TV</h1>
              <p className="text-[11px] uppercase tracking-widest text-gold font-body">La télévision du magazine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-semibold text-primary-foreground uppercase tracking-wider font-body">En direct</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && videos.length === 0 && (
        <div className="container mx-auto px-4 py-32 text-center">
          <Tv className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-body">Aucune vidéo programmée pour le moment.</p>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <>
          {/* PLAYER + ON AIR */}
          <section className="bg-primary py-8">
            <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black shadow-2xl">
                  {active ? (
                    active.source === "youtube" ? (
                      <iframe
                        key={active.id}
                        src={getEmbedUrl(active)}
                        title={active.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video key={active.id} src={active.url} controls autoPlay poster={active.thumbnail_url || undefined} className="w-full h-full object-contain bg-black" />
                    )
                  ) : (
                    <img src={heroImg} alt="Nsango TV" className="w-full h-full object-cover" />
                  )}
                </div>
                {active && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-gold text-primary hover:bg-gold-dark font-body text-[10px] uppercase tracking-wider">{active.category}</Badge>
                      {active.featured && <Badge variant="outline" className="border-gold text-gold"><Star className="w-3 h-3 mr-1" /> À la une</Badge>}
                      {active.duration && <span className="text-xs text-primary-foreground/60 font-body flex items-center gap-1"><Clock className="w-3 h-3" /> {active.duration}</span>}
                      <span className="text-xs text-primary-foreground/60 font-body flex items-center gap-1 ml-auto"><Eye className="w-3 h-3" /> {active.views} vues</span>
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">{active.title}</h2>
                    {active.description && <p className="text-sm text-primary-foreground/70 font-body mt-2">{active.description}</p>}
                  </div>
                )}
              </div>

              {/* On Air panel */}
              <aside className="bg-primary-foreground/5 border border-gold/20 rounded-lg p-5 self-start">
                <div className="flex items-center gap-2 mb-4">
                  <Radio className="w-4 h-4 text-gold" />
                  <h3 className="font-display font-bold text-primary-foreground uppercase tracking-wider text-sm">À l'antenne maintenant</h3>
                </div>
                {onAir && (
                  <button onClick={() => setActive(onAir)} className="text-left group block w-full">
                    <div className="aspect-video rounded overflow-hidden bg-black mb-3 relative">
                      <img src={onAir.thumbnail_url || heroImg} alt={onAir.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center">
                          <Play className="w-5 h-5 text-primary fill-primary ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-gold font-body mb-1">{SLOTS.find(s => s.value === nowSlot)?.label} · {SLOTS.find(s => s.value === nowSlot)?.time}</p>
                    <h4 className="font-display font-bold text-primary-foreground text-sm group-hover:text-gold transition-colors">{onAir.title}</h4>
                  </button>
                )}

                <div className="mt-5 pt-5 border-t border-primary-foreground/10">
                  <h4 className="text-xs uppercase tracking-wider text-primary-foreground/60 font-body mb-3 flex items-center gap-1"><Calendar className="w-3 h-3" /> Prochaine diffusion</h4>
                  <div className="space-y-2">
                    {videos.slice(1, 4).map(v => (
                      <button key={v.id} onClick={() => setActive(v)} className="w-full text-left flex gap-3 group">
                        <img src={v.thumbnail_url || heroImg} alt={v.title} className="w-16 h-10 object-cover rounded flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-primary-foreground line-clamp-2 group-hover:text-gold font-body">{v.title}</p>
                          <p className="text-[10px] text-primary-foreground/50 font-body">{v.duration || "—"}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </section>

          {/* PROGRAM GUIDE */}
          <section className="py-12 bg-secondary">
            <div className="container mx-auto px-4">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-body">Grille des programmes</p>
                  <h2 className="font-display text-2xl md:text-3xl font-bold mt-1">La journée sur Nsango TV</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {SLOTS.map(slot => {
                  const slotVideos = videos.filter(v => v.program_slot === slot.value);
                  const isNow = slot.value === nowSlot;
                  return (
                    <div key={slot.value} className={`rounded-lg p-4 border ${isNow ? "border-gold bg-gold/5" : "border-border bg-background"}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xl">{slot.icon}</p>
                          <h3 className="font-display font-bold">{slot.label}</h3>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">{slot.time}</p>
                        </div>
                        {isNow && <Badge className="bg-red-500 text-white hover:bg-red-600 text-[9px]">LIVE</Badge>}
                      </div>
                      <div className="space-y-2">
                        {slotVideos.slice(0, 3).map(v => (
                          <button key={v.id} onClick={() => { setActive(v); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full text-left text-xs hover:text-gold transition-colors font-body line-clamp-2 border-l-2 border-gold/40 pl-2">
                            {v.title}
                          </button>
                        ))}
                        {slotVideos.length === 0 && <p className="text-xs text-muted-foreground italic font-body">Pas de programme</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CATALOG */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-body">Catalogue</p>
                  <h2 className="font-display text-2xl md:text-3xl font-bold mt-1">Toutes nos émissions</h2>
                </div>
                <Tabs value={filterCat} onValueChange={setFilterCat}>
                  <TabsList className="flex-wrap h-auto">
                    {categories.map(c => (
                      <TabsTrigger key={c} value={c} className="font-body text-xs uppercase tracking-wider">
                        {c === "all" ? "Tout" : c}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map(v => (
                  <button key={v.id} onClick={() => { setActive(v); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="group text-left">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <img src={v.thumbnail_url || heroImg} alt={v.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 gradient-hero opacity-50" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-primary fill-primary ml-1" />
                        </div>
                      </div>
                      {v.duration && <span className="absolute bottom-3 right-3 bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded font-body">{v.duration}</span>}
                      {v.featured && <Badge className="absolute top-3 left-3 bg-gold text-primary text-[9px]"><Star className="w-2.5 h-2.5 mr-1" />À la une</Badge>}
                    </div>
                    <div className="mt-3">
                      <p className="text-[10px] uppercase tracking-wider text-gold font-body">{v.category}</p>
                      <h3 className="font-display font-bold text-sm mt-1 group-hover:text-gold transition-colors line-clamp-2">{v.title}</h3>
                      <p className="text-[11px] text-muted-foreground font-body mt-1 flex items-center gap-2">
                        <Eye className="w-3 h-3" /> {v.views} vues
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Videos;
