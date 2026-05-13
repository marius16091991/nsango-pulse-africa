import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/SectionTitle";
import ArticleCard from "@/components/ArticleCard";
import { usePageSections } from "@/hooks/usePageSections";
import { PageSectionRenderer } from "@/components/PageSectionRenderer";
import { supabase } from "@/integrations/supabase/client";

import heroImg from "@/assets/hero-personality.jpg";
import featuredImg from "@/assets/personality-featured.jpg";
import cultureImg from "@/assets/culture-lifestyle.jpg";
import businessImg from "@/assets/business-leadership.jpg";
import talentImg from "@/assets/talent-emergent.jpg";

const FALLBACK_IMAGES = [heroImg, featuredImg, cultureImg, businessImg, talentImg];

interface Props { slug: string; defaultTitle?: string; }

// Mapping slug → catégorie d'article (et alias possibles)
const SLUG_TO_CATEGORIES: Record<string, string[]> = {
  business: ["Business"],
  culture: ["Culture", "Culture & Lifestyle"],
  politique: ["Politique"],
  sport: ["Sport", "Sports"],
  lifestyle: ["Lifestyle", "Culture & Lifestyle"],
  tech: ["Tech", "Tech & Innovation", "Technologie"],
  actualites: ["Actualités", "Actualité", "News"],
  evenements: ["Événements", "Evenements"],
  interviews: ["Interviews", "Interview"],
  portraits: ["Portraits", "Portrait"],
  podcasts: ["Podcasts"],
};

const DynamicPage = ({ slug, defaultTitle }: Props) => {
  const { sections, loading } = usePageSections(slug);
  const [pageMeta, setPageMeta] = useState<{ title: string; meta_description: string } | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  useEffect(() => {
    supabase.from("pages").select("title,meta_description").eq("slug", slug).maybeSingle().then(({ data }) => {
      const title = data?.title || defaultTitle || "Nsango Magazine";
      setPageMeta({ title, meta_description: data?.meta_description || "" });
      document.title = `${title} — Nsango Magazine`;
      if (data?.meta_description) {
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
        meta.setAttribute("content", data.meta_description);
      }
    });
  }, [slug, defaultTitle]);

  // Charge les articles de la catégorie correspondante
  useEffect(() => {
    const cats = SLUG_TO_CATEGORIES[slug];
    if (!cats || cats.length === 0) { setArticlesLoading(false); return; }
    setArticlesLoading(true);
    supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .in("category", cats)
      .order("created_at", { ascending: false })
      .limit(24)
      .then(({ data }) => {
        setArticles(data || []);
        setArticlesLoading(false);
      });
  }, [slug]);

  const hasSections = sections.length > 0;
  const title = pageMeta?.title || defaultTitle || slug;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      {(loading || articlesLoading) && !hasSections && articles.length === 0 && (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      )}

      {/* Sections configurées dans l'admin */}
      {sections.map(section => <PageSectionRenderer key={section.id} section={section} />)}

      {/* Si pas de sections OU à compléter avec les articles de la catégorie */}
      {!loading && (
        <div className="container mx-auto px-4 py-12">
          {!hasSections && (
            <SectionTitle title={title} subtitle={pageMeta?.meta_description || ""} gold />
          )}

          {!articlesLoading && articles.length > 0 && (
            <>
              {hasSections && (
                <div className="mt-8">
                  <SectionTitle title="Tous les articles" subtitle={`Retrouvez l'actualité ${title}`} />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {articles.map((a, i) => (
                  <Link key={a.id} to={`/article/${a.id}`}>
                    <ArticleCard
                      image={a.cover_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                      category={a.category}
                      title={a.title}
                      excerpt={a.summary || undefined}
                      author={a.author_name || undefined}
                      date={new Date(a.created_at).toLocaleDateString("fr-FR")}
                      size={i === 0 && !hasSections ? "large" : "medium"}
                      premium={a.premium}
                    />
                  </Link>
                ))}
              </div>
            </>
          )}

          {!articlesLoading && !hasSections && articles.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <p className="text-muted-foreground font-body">
                Aucun contenu publié pour le moment dans cette rubrique.
              </p>
              <p className="text-sm text-muted-foreground/70 font-body">
                Revenez bientôt — la rédaction prépare de nouveaux articles ✨
              </p>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DynamicPage;
