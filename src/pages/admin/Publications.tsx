import { useState, useEffect } from "react";
import { Send, Clock, CheckCircle, AlertCircle, Eye, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Publications = () => {
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [published, setPublished] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    const [schedRes, pubRes] = await Promise.all([
      supabase.from("articles").select("id, title, status, views, created_at, category")
        .in("status", ["draft", "scheduled", "review"]).order("created_at", { ascending: false }).limit(10),
      supabase.from("articles").select("id, title, status, views, created_at, category")
        .eq("status", "published").order("created_at", { ascending: false }).limit(10),
    ]);
    setScheduled(schedRes.data || []);
    setPublished(pubRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, []);

  const publishNow = async (id: string, title: string) => {
    const { error } = await supabase.from("articles").update({ status: "published" }).eq("id", id);
    if (!error) { toast({ title: "Publié !", description: `"${title}" est maintenant en ligne` }); fetchArticles(); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">Publications & Diffusion</h1>
        <p className="text-sm text-muted-foreground">Publiez et contrôlez la mise en ligne de vos articles</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold" /> En attente de publication ({scheduled.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduled.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{item.category} · {new Date(item.created_at).toLocaleDateString("fr-FR")}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.status === "scheduled" ? "bg-blue-100 text-blue-700" : item.status === "review" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>
                      {item.status === "scheduled" ? "Programmé" : item.status === "review" ? "En révision" : "Brouillon"}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs gap-1 ml-4" onClick={() => publishNow(item.id, item.title)}>
                  <Send className="w-3 h-3" /> Publier
                </Button>
              </div>
            ))}
            {scheduled.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Tous les articles sont publiés !</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" /> Récemment publiés ({published.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {published.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <span className="text-xs text-muted-foreground">{item.category} · {new Date(item.created_at).toLocaleDateString("fr-FR")}</span>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                  <Eye className="w-3 h-3" /> {item.views.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Publications;
