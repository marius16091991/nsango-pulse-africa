import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Crown, Eye, Calendar, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReactionBar from "@/components/engagement/ReactionBar";
import CommentSection from "@/components/engagement/CommentSection";
import ShareBar from "@/components/social/ShareBar";

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const { data } = await supabase.from("articles").select("*").eq("id", id).single();
      if (data) {
        setArticle(data);
        // Increment views
        await supabase.from("articles").update({ views: (data.views || 0) + 1 }).eq("id", id);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />
      <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display font-bold">Article introuvable</h1>
        <Link to="/" className="text-gold hover:underline mt-4 inline-block">Retour à l'accueil</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      {article.cover_url && (
        <div className="relative h-[50vh] min-h-[300px] max-h-[500px] overflow-hidden">
          <img src={article.cover_url} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-hero" />
        </div>
      )}

      <article className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em]">{article.category}</span>
          {article.premium && (
            <span className="flex items-center gap-1 text-[10px] bg-gold/20 text-gold-dark px-2 py-0.5 rounded font-semibold">
              <Crown className="w-3 h-3" /> PREMIUM
            </span>
          )}
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">{article.title}</h1>

        {article.summary && (
          <p className="text-lg text-muted-foreground mt-4 leading-relaxed">{article.summary}</p>
        )}

        <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground border-y border-border py-4">
          {article.author_name && (
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {article.author_name}</span>
          )}
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(article.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {article.views} vues</span>
        </div>

        {article.content && (
          <div className="prose prose-lg max-w-none mt-8 font-body leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Que pensez-vous de cet article ?</p>
          <ReactionBar targetType="article" targetId={article.id} />
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <ShareBar title={article.title} articleId={article.id} />
        </div>

        <CommentSection articleId={article.id} />
      </article>

      <Footer />
    </div>
  );
};

export default ArticlePage;
