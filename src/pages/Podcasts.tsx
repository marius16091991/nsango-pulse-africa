import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/SectionTitle";
import { Headphones, Play, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Media {
  id: string;
  name: string;
  url: string;
  created_at: string;
  type: string;
}

const Podcasts = () => {
  const [audios, setAudios] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<Media | null>(null);

  useEffect(() => {
    document.title = "Podcasts — Nsango Magazine";
    const load = async () => {
      const { data } = await supabase
        .from("media")
        .select("id, name, url, created_at, type")
        .eq("type", "audio")
        .order("created_at", { ascending: false });
      setAudios(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 lg:pt-32 pb-20 container mx-auto px-4">
        <SectionTitle title="Podcasts" subtitle="Écouter Nsango partout" />

        {current && (
          <div className="bg-gradient-to-br from-gold/10 to-card border border-gold/30 rounded-xl p-6 mt-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Headphones className="w-5 h-5 text-gold" />
              <h3 className="font-display text-lg font-bold">{current.name}</h3>
            </div>
            <audio controls src={current.url} className="w-full" autoPlay />
          </div>
        )}

        <div className="mt-8 max-w-3xl mx-auto">
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
          ) : audios.length === 0 ? (
            <div className="text-center py-20">
              <Headphones className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-body">Aucun podcast disponible pour le moment.</p>
              <p className="text-xs text-muted-foreground mt-2 font-body">Les contenus audio apparaîtront ici dès leur publication.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {audios.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => setCurrent(a)}
                    className="w-full flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:border-gold transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                      <Play className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold font-body truncate">{a.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-body">
                        <Clock className="w-3 h-3" />{new Date(a.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Podcasts;
