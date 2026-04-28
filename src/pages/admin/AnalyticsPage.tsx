import { useState, useEffect } from "react";
import { BarChart3, Eye, FileText, MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

const AnalyticsPage = () => {
  const [topArticles, setTopArticles] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalViews: 0, articles: 0, comments: 0, published: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [topRes, artRes, comRes, pubRes] = await Promise.all([
        supabase.from("articles").select("id, title, views, category").order("views", { ascending: false }).limit(10),
        supabase.from("articles").select("views"),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
      ]);
      setTopArticles(topRes.data || []);
      const totalViews = (topRes.data || []).reduce((s: number, a: any) => s + (a.views || 0), 0);
      setStats({
        totalViews,
        articles: (artRes.data || []).length,
        comments: comRes.count || 0,
        published: pubRes.count || 0,
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>;

  const maxViews = topArticles[0]?.views || 1;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">Analytiques</h1>
        <p className="text-sm text-muted-foreground">Performances réelles de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Vues totales", value: stats.totalViews.toLocaleString(), icon: Eye },
          { label: "Articles", value: stats.articles.toString(), icon: FileText },
          { label: "Publiés", value: stats.published.toString(), icon: BarChart3 },
          { label: "Commentaires", value: stats.comments.toString(), icon: MessageSquare },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <s.icon className="w-5 h-5 text-gold" />
              </div>
              <p className="text-2xl font-bold font-display">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gold" /> Articles les plus lus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topArticles.map((a, i) => (
              <div key={a.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                    <span className="text-sm font-medium truncate">{a.title}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{a.category}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{a.views.toLocaleString()} vues</span>
                </div>
                <Progress value={(a.views / maxViews) * 100} className="h-1.5" />
              </div>
            ))}
            {topArticles.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
