import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/SectionTitle";
import { Calendar, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Article {
  id: string;
  title: string;
  summary: string | null;
  cover_url: string | null;
  category: string;
  created_at: string;
  views: number;
}

const Actualites = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Actualités — Kibafood";
    const load = async () => {
      const { data } = await supabase
        .from("articles")
        .select("id, title, summary, cover_url, category, created_at, views")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(30);
      setArticles(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 lg:pt-32 pb-20 container mx-auto px-4">
        <SectionTitle title="Actualités" subtitle="Toutes les dernières nouvelles" />
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72 rounded-lg" />)}
          </div>
        ) : articles.length === 0 ? (
          <p className="text-center text-muted-foreground py-20 font-body">Aucune actualité publiée pour le moment.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {articles.map((a) => (
              <Link to={`/article/${a.id}`} key={a.id} className="group bg-card border border-border rounded-lg overflow-hidden hover:border-gold transition-all">
                <div className="aspect-video bg-secondary overflow-hidden">
                  {a.cover_url && (
                    <img src={a.cover_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  )}
                </div>
                <div className="p-5">
                  <span className="text-[10px] uppercase tracking-widest text-gold font-semibold font-body">{a.category}</span>
                  <h3 className="font-display text-lg font-bold mt-2 group-hover:text-gold transition-colors line-clamp-2">{a.title}</h3>
                  {a.summary && <p className="text-sm text-muted-foreground mt-2 line-clamp-2 font-body">{a.summary}</p>}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-body">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(a.created_at).toLocaleDateString("fr-FR")}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Actualites;
