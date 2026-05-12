import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SeoHead from "@/components/seo/SeoHead";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";

interface Article {
  id: string;
  title: string;
  summary: string | null;
  category: string;
  cover_url: string | null;
  author_name: string | null;
  created_at: string;
}

const Recherche = () => {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") || "";
  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = params.get("q")?.trim() || "";
    setQuery(q);
    if (!q) { setResults([]); return; }
    setLoading(true);
    supabase
      .from("articles")
      .select("id,title,summary,category,cover_url,author_name,created_at")
      .eq("status", "published")
      .or(`title.ilike.%${q}%,summary.ilike.%${q}%,content.ilike.%${q}%,category.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(40)
      .then(({ data }) => {
        setResults((data as Article[]) || []);
        setLoading(false);
      });
  }, [params]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setParams(q ? { q } : {});
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHead route="/recherche" type="website" />
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />
      <main className="container mx-auto px-4 py-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-6">Recherche</h1>
        <form onSubmit={submit} className="relative max-w-2xl mb-10">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article, une catégorie…"
            className="w-full bg-secondary pl-11 pr-4 py-3 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-gold/50"
            autoFocus
          />
        </form>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && params.get("q") && results.length === 0 && (
          <p className="text-muted-foreground font-body">Aucun résultat pour « {params.get("q")} ».</p>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((a) => (
              <Link key={a.id} to={`/article/${a.id}`} className="group block bg-card border border-border rounded-lg overflow-hidden hover:border-gold/60 transition">
                {a.cover_url && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={a.cover_url} alt={a.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-4">
                  <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em] font-body">{a.category}</span>
                  <h3 className="font-display font-bold mt-1 line-clamp-2">{a.title}</h3>
                  {a.summary && <p className="text-sm text-muted-foreground mt-2 line-clamp-2 font-body">{a.summary}</p>}
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

export default Recherche;
