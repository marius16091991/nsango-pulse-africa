import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/SectionTitle";
import ArticleCard from "@/components/ArticleCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

import heroImg from "@/assets/hero-personality.jpg";
import featuredImg from "@/assets/personality-featured.jpg";
import cultureImg from "@/assets/culture-lifestyle.jpg";
import businessImg from "@/assets/business-leadership.jpg";
import talentImg from "@/assets/talent-emergent.jpg";

const fallbackImages = [heroImg, featuredImg, cultureImg, businessImg, talentImg];

interface CategoryPageProps {
  category: string;
  title: string;
  subtitle: string;
}

const CategoryPage = ({ category, title, subtitle }: CategoryPageProps) => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("articles").select("*")
      .eq("status", "published").eq("category", category)
      .order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { setArticles(data || []); setLoading(false); });
  }, [category]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />
      <div className="container mx-auto px-4 py-12">
        <SectionTitle title={title} subtitle={subtitle} gold />
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a, i) => (
              <Link key={a.id} to={`/article/${a.id}`}>
                <ArticleCard
                  image={a.cover_url || fallbackImages[i % fallbackImages.length]}
                  category={a.category}
                  title={a.title}
                  excerpt={a.summary || undefined}
                  author={a.author_name || undefined}
                  date={new Date(a.created_at).toLocaleDateString("fr-FR")}
                  size={i === 0 ? "large" : "medium"}
                  premium={a.premium}
                />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-16">Aucun article publié dans cette catégorie pour le moment.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
