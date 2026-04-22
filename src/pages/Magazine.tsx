import { useEffect, useState } from "react";
import { Crown, Download, BookOpen, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/SectionTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { usePageSections } from "@/hooks/usePageSections";
import { PageSectionRenderer } from "@/components/PageSectionRenderer";
import magazineCover from "@/assets/magazine-cover.jpg";

interface Issue {
  id: string;
  title: string;
  cover_url: string | null;
  summary: string | null;
  issue_date: string | null;
  status: string;
  premium: boolean;
  pdf_url: string | null;
  downloads: number;
}

const Magazine = () => {
  const { sections } = usePageSections("magazine");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("magazine_issues")
      .select("*")
      .in("status", ["current", "archived"])
      .order("issue_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => { setIssues((data as any) || []); setLoading(false); });
  }, []);

  const current = issues.find(i => i.status === "current") || issues[0];
  const archives = issues.filter(i => i.id !== current?.id);

  const handleRead = (i: Issue) => {
    if (!i.pdf_url) return;
    supabase.from("magazine_issues").update({ downloads: (i.downloads || 0) + 1 }).eq("id", i.id).then(() => {});
    window.open(i.pdf_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      {sections.map(section => <PageSectionRenderer key={section.id} section={section} />)}

      <section className="container mx-auto px-4 py-12">
        <SectionTitle title="Le magazine" subtitle="Toutes les éditions Nsango" gold />

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
        ) : issues.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 font-body">
            Aucune édition publiée pour le moment.
          </p>
        ) : (
          <>
            {current && (
              <Card className="overflow-hidden mb-10 border-gold/40">
                <div className="grid md:grid-cols-2">
                  <div className="relative aspect-[3/4] md:aspect-auto bg-muted">
                    <img src={current.cover_url || magazineCover} alt={current.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 md:p-10 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className="bg-gold text-primary text-[10px]">À la une</Badge>
                      {current.premium && <Badge variant="outline" className="text-[10px] gap-1"><Crown className="w-2.5 h-2.5 text-gold" /> Premium</Badge>}
                      {current.issue_date && <span className="text-xs text-muted-foreground font-body">{new Date(current.issue_date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>}
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">{current.title}</h2>
                    {current.summary && <p className="text-sm md:text-base text-muted-foreground font-body mb-6 whitespace-pre-line">{current.summary}</p>}
                    {current.pdf_url ? (
                      <Button onClick={() => handleRead(current)} className="bg-gold hover:bg-gold-dark text-primary gap-2 w-fit">
                        <BookOpen className="w-4 h-4" /> Lire ce numéro
                      </Button>
                    ) : (
                      <p className="text-xs text-muted-foreground font-body">Disponible bientôt en lecture en ligne.</p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {archives.length > 0 && (
              <>
                <h3 className="font-display text-lg font-semibold mb-4">Archives</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {archives.map(i => (
                    <Card key={i.id} className="overflow-hidden group">
                      <div className="relative aspect-[3/4] bg-muted">
                        <img src={i.cover_url || magazineCover} alt={i.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                        {i.premium && <Badge className="absolute top-2 left-2 bg-gold text-primary text-[10px] gap-1"><Crown className="w-2.5 h-2.5" /> Premium</Badge>}
                      </div>
                      <CardContent className="p-3">
                        <p className="text-xs font-display font-semibold line-clamp-2">{i.title}</p>
                        {i.issue_date && <p className="text-[10px] text-muted-foreground font-body mt-1">{new Date(i.issue_date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>}
                        {i.pdf_url && (
                          <Button size="sm" variant="ghost" className="text-[11px] gap-1 h-7 mt-2 px-2" onClick={() => handleRead(i)}>
                            <Download className="w-3 h-3" /> Lire
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Magazine;
