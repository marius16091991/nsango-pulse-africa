import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Mail, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/ArticleCard";
import SectionTitle from "@/components/SectionTitle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PageSection } from "@/hooks/usePageSections";

import heroImg from "@/assets/hero-personality.jpg";
import featuredImg from "@/assets/personality-featured.jpg";
import cultureImg from "@/assets/culture-lifestyle.jpg";
import businessImg from "@/assets/business-leadership.jpg";
import talentImg from "@/assets/talent-emergent.jpg";

const fallbackImages = [heroImg, featuredImg, cultureImg, businessImg, talentImg];

const bgClass = (style: any) => {
  if (style?.background === "secondary") return "bg-secondary";
  if (style?.background === "dark") return "gradient-dark";
  return "";
};

const colsClass = (n: number) => {
  const map: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };
  return map[n] || map[3];
};

export const PageSectionRenderer = ({ section }: { section: PageSection }) => {
  const [items, setItems] = useState<any[]>([]);
  const style = section.style || {};
  const limit = style.limit || 6;
  const columns = style.columns || 3;

  useEffect(() => {
    const ids = Array.isArray(section.content_ids) ? section.content_ids : [];
    const isVideo = section.section_type === "videos_grid";
    const table = isVideo ? "videos" : "articles";

    if (ids.length > 0) {
      supabase.from(table as any).select("*").in("id", ids).then(({ data }) => setItems(data || []));
    } else if (section.section_type === "articles_grid" || section.section_type === "videos_grid") {
      let q = supabase.from(table as any).select("*").eq("status", "published");
      // Priority: explicit style.category > inferred from page slug
      const explicitCat = (style as any)?.category;
      const pageCategoryMap: Record<string, string> = {
        business: "Business",
        culture: "Culture",
        interviews: "Interviews",
        portraits: "Portraits",
        magazine: "Magazine",
        evenements: "Événements",
        podcasts: "Podcasts",
      };
      const inferredCat = pageCategoryMap[section.page_slug];
      const cat = explicitCat || inferredCat;
      if (cat && cat !== "all") q = q.eq("category", cat);
      q.order("created_at", { ascending: false }).limit(limit).then(({ data }) => setItems(data || []));
    }
  }, [section.id, (style as any)?.category, limit]);

  // HERO
  if (section.section_type === "hero") {
    return (
      <section className="relative h-[80vh] min-h-[500px] max-h-[800px] overflow-hidden">
        <img src={section.media_url || heroImg} alt={section.title} width={1920} height={1080} className="w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12 md:pb-16">
            {section.subtitle && (
              <span className="inline-block bg-gold text-primary text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded mb-4 font-body">
                {section.subtitle}
              </span>
            )}
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground max-w-3xl leading-tight">
              {section.title}
            </h2>
            {section.body && <p className="text-primary-foreground/80 font-body mt-4 max-w-xl text-sm md:text-base">{section.body}</p>}
            {section.cta_label && (
              <div className="flex gap-3 mt-6">
                <Link to={section.cta_url || "/"}>
                  <Button className="bg-gold hover:bg-gold-dark text-primary font-semibold text-xs uppercase tracking-wider font-body gap-2">
                    {section.cta_label} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // NEWSLETTER
  if (section.section_type === "newsletter") {
    return <NewsletterBlock section={section} />;
  }

  // CTA
  if (section.section_type === "cta") {
    return (
      <section className={`py-16 ${bgClass(style)}`}>
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold">{section.title}</h2>
          {section.subtitle && <p className="text-muted-foreground font-body mt-2">{section.subtitle}</p>}
          {section.body && <p className="text-sm text-muted-foreground font-body mt-4">{section.body}</p>}
          {section.cta_label && (
            <Link to={section.cta_url || "/"}>
              <Button className="bg-gold hover:bg-gold-dark text-primary font-body mt-6 gap-2">{section.cta_label} <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          )}
        </div>
      </section>
    );
  }

  // TEXT BLOCK
  if (section.section_type === "text_block") {
    return (
      <section className={`py-12 ${bgClass(style)}`}>
        <div className="container mx-auto px-4 max-w-3xl">
          {section.title && <SectionTitle title={section.title} subtitle={section.subtitle} gold />}
          {section.body && <div className="prose prose-sm max-w-none font-body text-muted-foreground whitespace-pre-line">{section.body}</div>}
        </div>
      </section>
    );
  }

  // ARTICLES GRID
  if (section.section_type === "articles_grid") {
    if (items.length === 0) return null;
    return (
      <section className={`py-12 ${bgClass(style)}`}>
        <div className="container mx-auto px-4">
          {section.title && <SectionTitle title={section.title} subtitle={section.subtitle} gold />}
          <div className={`grid ${colsClass(columns)} gap-6`}>
            {items.slice(0, limit).map((a, i) => (
              <Link key={a.id} to={`/article/${a.id}`}>
                <ArticleCard
                  image={a.cover_url || fallbackImages[i % fallbackImages.length]}
                  category={a.category}
                  title={a.title}
                  excerpt={a.summary || undefined}
                  author={a.author_name || undefined}
                  date={new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  size={i === 0 && columns >= 3 ? "large" : "medium"}
                  premium={a.premium}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // VIDEOS GRID
  if (section.section_type === "videos_grid") {
    if (items.length === 0) return null;
    return (
      <section className={`py-12 ${bgClass(style)}`}>
        <div className="container mx-auto px-4">
          {section.title && <SectionTitle title={section.title} subtitle={section.subtitle} gold />}
          <div className={`grid ${colsClass(columns)} gap-6`}>
            {items.slice(0, limit).map((v, i) => (
              <Link key={v.id} to="/videos" className="group cursor-pointer block">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img src={v.thumbnail_url || fallbackImages[i % fallbackImages.length]} alt={v.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 gradient-hero opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-primary fill-primary ml-1" />
                    </div>
                  </div>
                  {v.duration && <span className="absolute bottom-3 right-3 bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded font-body">{v.duration}</span>}
                </div>
                <h3 className="font-display font-bold text-sm mt-3 group-hover:text-gold transition-colors">{v.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // GENERIC
  return (
    <section className={`py-12 ${bgClass(style)}`}>
      <div className="container mx-auto px-4">
        {section.title && <SectionTitle title={section.title} subtitle={section.subtitle} gold />}
        {section.body && <p className="font-body text-muted-foreground max-w-3xl">{section.body}</p>}
      </div>
    </section>
  );
};

const NewsletterBlock = ({ section }: { section: PageSection }) => {
  const [email, setEmail] = useState("");
  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { toast.error("Adresse email invalide"); return; }
    toast.success("Merci ! Vous êtes inscrit.");
    setEmail("");
  };
  return (
    <section className="gradient-dark py-16">
      <div className="container mx-auto px-4 text-center max-w-xl">
        <Mail className="w-10 h-10 text-gold mx-auto mb-4" />
        <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">{section.title || "Restez informé"}</h2>
        {(section.subtitle || section.body) && (
          <p className="text-sm text-primary-foreground/60 font-body mt-3">{section.body || section.subtitle}</p>
        )}
        <form onSubmit={handle} className="flex flex-col sm:flex-row gap-3 mt-6">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Votre adresse email"
            className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gold/50" />
          <Button type="submit" className="bg-gold hover:bg-gold-dark text-primary font-semibold text-xs uppercase tracking-wider font-body px-8">
            {section.cta_label || "S'inscrire"}
          </Button>
        </form>
      </div>
    </section>
  );
};
