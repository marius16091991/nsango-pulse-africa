import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Play, Clock, Eye, Radio, Tv, Sunrise, Sun, Sunset, Moon, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getYouTubeEmbed, getYouTubeThumbnail } from "@/components/MediaUpload";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import featuredImg from "@/assets/personality-featured.jpg";
import businessImg from "@/assets/business-leadership.jpg";
import cultureImg from "@/assets/culture-lifestyle.jpg";
import talentImg from "@/assets/talent-emergent.jpg";
import heroImg from "@/assets/hero-personality.jpg";

const fallbacks = [heroImg, featuredImg, businessImg, cultureImg, talentImg];

interface VideoRow {
  id: string;
  title: string;
  description: string | null;
  source: string;
  url: string;
  thumbnail_url: string | null;
  category: string;
  duration: string | null;
  views: number;
  program_slot: string | null;
  featured: boolean;
  created_at: string;
}

const slots = [
  { key: "morning", label: "Matinale", time: "06h — 12h", icon: Sunrise, color: "from-amber-500/20 to-orange-500/10" },
  { key: "afternoon", label: "Journée", time: "12h — 18h", icon: Sun, color: "from-yellow-500/20 to-amber-500/10" },
  { key: "prime", label: "Prime time", time: "18h — 23h", icon: Sunset, color: "from-rose-500/20 to-red-500/10" },
  { key: "night", label: "Nocturne", time: "23h — 06h", icon: Moon, color: "from-indigo-500/20 to-purple-500/10" },
];

const getThumb = (v: VideoRow, idx: number) => {
  if (v.thumbnail_url) return v.thumbnail_url;
  if (v.source === "youtube") return getYouTubeThumbnail(v.url);
  return fallbacks[idx % fallbacks.length];
};

const getVideoSrc = (v: VideoRow) =>
  v.source === "youtube" ? getYouTubeEmbed(v.url) : v.url;

const Videos = () => {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("Toutes");
  const [playing, setPlaying] = useState<VideoRow | null>(null);

  const fetchVideos = async () => {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    setVideos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
    const channel = supabase
      .channel("videos-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "videos" }, fetchVideos)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const featured = useMemo(() => videos.find((v) => v.featured) || videos[0], [videos]);
  const categories = useMemo(() => ["Toutes", ...Array.from(new Set(videos.map((v) => v.category)))], [videos]);
  const filtered = useMemo(
    () => (filter === "Toutes" ? videos : videos.filter((v) => v.category === filter)),
    [videos, filter]
  );

  const playVideo = async (v: VideoRow) => {
    setPlaying(v);
    await supabase.from("videos").update({ views: v.views + 1 }).eq("id", v.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      {/* Channel banner */}
      <section className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground py-4 border-b border-gold/20">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-destructive/90 px-3 py-1 rounded-full">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest font-body">En direct</span>
          </div>
          <div className="flex items-center gap-2 text-gold">
            <Tv className="w-5 h-5" />
            <h2 className="font-display text-lg font-bold">Nsango TV</h2>
          </div>
          <p className="text-xs text-primary-foreground/70 font-body hidden md:block ml-2">
            La chaîne 100% africaine — programmes, reportages et interviews 24h/24
          </p>
        </div>
      </section>

      {/* Featured / Now playing */}
      {featured ? (
        <section className="relative bg-gradient-to-b from-primary to-background pb-8">
          <div className="container mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted shadow-elegant group cursor-pointer" onClick={() => playVideo(featured)}>
                <img src={getThumb(featured, 0)} alt={featured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gold/95 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                    <Play className="w-9 h-9 text-primary fill-primary ml-1" />
                  </div>
                </div>
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-destructive text-destructive-foreground text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded font-body flex items-center gap-1.5">
                    <Radio className="w-3 h-3 animate-pulse" /> Programme du jour
                  </span>
                </div>
                {featured.duration && (
                  <span className="absolute bottom-4 right-4 bg-primary/90 text-primary-foreground text-xs px-2.5 py-1 rounded font-body">
                    {featured.duration}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em] font-body">{featured.category}</span>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mt-2">{featured.title}</h1>
                {featured.description && (
                  <p className="text-primary-foreground/70 font-body mt-2 max-w-2xl text-sm">{featured.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-primary-foreground/60 font-body">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {featured.views.toLocaleString()} vues</span>
                  <span>{new Date(featured.created_at).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
            </div>

            {/* Up next sidebar */}
            <aside className="bg-card/10 backdrop-blur-sm rounded-xl p-4 border border-gold/20">
              <p className="text-gold text-[10px] uppercase tracking-[0.2em] font-bold font-body mb-3 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> À suivre
              </p>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {videos.slice(0, 6).map((v, i) => (
                  <div key={v.id} className="flex gap-3 cursor-pointer group" onClick={() => playVideo(v)}>
                    <div className="relative w-24 aspect-video shrink-0 rounded overflow-hidden bg-muted">
                      <img src={getThumb(v, i)} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-5 h-5 text-gold fill-gold" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-display font-semibold text-primary-foreground line-clamp-2 group-hover:text-gold transition-colors">{v.title}</p>
                      <p className="text-[10px] text-primary-foreground/60 font-body mt-0.5">{v.category} · {v.duration || "—"}</p>
                    </div>
                  </div>
                ))}
                {videos.length === 0 && (
                  <p className="text-xs text-primary-foreground/50 font-body text-center py-4">Aucune programmation</p>
                )}
              </div>
            </aside>
          </div>
        </section>
      ) : (
        <div className="container mx-auto px-4 py-16 text-center">
          <Tv className="w-16 h-16 text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground font-body mt-4">
            {loading ? "Chargement de la programmation..." : "La grille est en cours de préparation. Revenez bientôt !"}
          </p>
        </div>
      )}

      {/* TV Programming Grid */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-gold" />
          <h2 className="font-display text-2xl font-bold">Grille des programmes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {slots.map((slot) => {
            const slotVideos = videos.filter((v) => v.program_slot === slot.key).slice(0, 3);
            return (
              <div key={slot.key} className={cn("rounded-xl border border-border bg-gradient-to-br p-4", slot.color)}>
                <div className="flex items-center gap-2 mb-3">
                  <slot.icon className="w-4 h-4 text-gold" />
                  <div>
                    <p className="font-display font-bold text-sm">{slot.label}</p>
                    <p className="text-[10px] text-muted-foreground font-body">{slot.time}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {slotVideos.length > 0 ? slotVideos.map((v, i) => (
                    <div key={v.id} className="flex gap-2 cursor-pointer group" onClick={() => playVideo(v)}>
                      <div className="w-12 aspect-video rounded shrink-0 overflow-hidden bg-muted">
                        <img src={getThumb(v, i)} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <p className="text-xs font-body line-clamp-2 group-hover:text-gold transition-colors">{v.title}</p>
                    </div>
                  )) : (
                    <p className="text-[11px] text-muted-foreground/70 font-body italic">Aucun programme planifié</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="container mx-auto px-4">
        <AdBanner variant="horizontal" />
      </div>

      {/* Filters + Catalog */}
      <section className="container mx-auto px-4 py-8">
        <Tabs value={filter} onValueChange={setFilter}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="font-display text-2xl font-bold">Catalogue complet</h2>
            <TabsList className="flex-wrap h-auto">
              {categories.map((c) => (
                <TabsTrigger key={c} value={c} className="text-xs uppercase tracking-wider font-body">{c}</TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value={filter}>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((v, i) => (
                  <div key={v.id} className="group cursor-pointer" onClick={() => playVideo(v)}>
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <img src={getThumb(v, i)} alt={v.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-gold/95 flex items-center justify-center">
                          <Play className="w-6 h-6 text-primary fill-primary ml-1" />
                        </div>
                      </div>
                      {v.duration && (
                        <span className="absolute bottom-2 right-2 bg-primary/80 text-primary-foreground text-xs px-2 py-0.5 rounded font-body">{v.duration}</span>
                      )}
                      <span className="absolute top-2 left-2 bg-gold/95 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-body">{v.category}</span>
                    </div>
                    <h3 className="font-display font-bold text-sm mt-2.5 group-hover:text-gold transition-colors line-clamp-2">{v.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-body">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {v.views.toLocaleString()} vues</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Tv className="w-12 h-12 text-muted-foreground/40 mx-auto" />
                <p className="text-muted-foreground font-body mt-3 text-sm">Aucune vidéo dans cette catégorie pour le moment.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Player Dialog */}
      <Dialog open={!!playing} onOpenChange={() => setPlaying(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-primary border-gold/20">
          {playing && (
            <div>
              <div className="aspect-video bg-black">
                {playing.source === "youtube" ? (
                  <iframe
                    src={getVideoSrc(playing) + "?autoplay=1"}
                    title={playing.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={getVideoSrc(playing)} controls autoPlay className="w-full h-full" />
                )}
              </div>
              <div className="p-5 text-primary-foreground">
                <span className="text-gold text-[10px] uppercase tracking-widest font-bold font-body">{playing.category}</span>
                <h3 className="font-display text-xl font-bold mt-1">{playing.title}</h3>
                {playing.description && <p className="text-sm text-primary-foreground/70 font-body mt-2">{playing.description}</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Videos;
