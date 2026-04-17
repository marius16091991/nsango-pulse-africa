import { useState, useEffect } from "react";
import { Send, Clock, CheckCircle, Eye, Loader2, FileText, Tv, Youtube, Upload as UploadIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Publications = () => {
  const [tab, setTab] = useState<"articles" | "videos">("articles");
  const [articlesPending, setArticlesPending] = useState<any[]>([]);
  const [articlesPublished, setArticlesPublished] = useState<any[]>([]);
  const [videosPending, setVideosPending] = useState<any[]>([]);
  const [videosPublished, setVideosPublished] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [aP, aPub, vP, vPub] = await Promise.all([
      supabase.from("articles").select("id, title, status, views, created_at, category").in("status", ["draft", "scheduled", "review"]).order("created_at", { ascending: false }).limit(15),
      supabase.from("articles").select("id, title, status, views, created_at, category").eq("status", "published").order("created_at", { ascending: false }).limit(15),
      supabase.from("videos").select("id, title, status, views, created_at, category, source").in("status", ["draft", "scheduled"]).order("created_at", { ascending: false }).limit(15),
      supabase.from("videos").select("id, title, status, views, created_at, category, source").eq("status", "published").order("created_at", { ascending: false }).limit(15),
    ]);
    setArticlesPending(aP.data || []);
    setArticlesPublished(aPub.data || []);
    setVideosPending(vP.data || []);
    setVideosPublished(vPub.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const publishArticle = async (id: string, title: string) => {
    const { error } = await supabase.from("articles").update({ status: "published" }).eq("id", id);
    if (!error) { toast({ title: "Publié !", description: `"${title}" est en ligne` }); fetchAll(); }
  };

  const publishVideo = async (id: string, title: string) => {
    const { error } = await supabase.from("videos").update({ status: "published" }).eq("id", id);
    if (!error) { toast({ title: "Vidéo publiée !", description: `"${title}" est diffusée` }); fetchAll(); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">Publications & Diffusion</h1>
        <p className="text-sm text-muted-foreground">Gérez la mise en ligne des articles et des programmes vidéo</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid grid-cols-2 w-full sm:w-auto sm:inline-flex">
          <TabsTrigger value="articles" className="gap-1.5"><FileText className="w-3.5 h-3.5" /> Articles ({articlesPending.length + articlesPublished.length})</TabsTrigger>
          <TabsTrigger value="videos" className="gap-1.5"><Tv className="w-3.5 h-3.5" /> Vidéos ({videosPending.length + videosPublished.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold" /> En attente ({articlesPending.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {articlesPending.length > 0 ? articlesPending.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{item.category} · {new Date(item.created_at).toLocaleDateString("fr-FR")}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {item.status === "scheduled" ? "Programmé" : item.status === "review" ? "Révision" : "Brouillon"}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" className="bg-gold hover:bg-gold-dark text-primary text-xs gap-1 ml-4" onClick={() => publishArticle(item.id, item.title)}>
                    <Send className="w-3 h-3" /> Publier
                  </Button>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-6">Tous les articles sont publiés ✓</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" /> Publiés ({articlesPublished.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {articlesPublished.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <span className="text-xs text-muted-foreground">{item.category} · {new Date(item.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0"><Eye className="w-3 h-3" /> {item.views.toLocaleString()}</span>
                  </div>
                ))}
                {articlesPublished.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Aucun article publié</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold" /> En attente ({videosPending.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {videosPending.length > 0 ? videosPending.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{item.category} · {new Date(item.created_at).toLocaleDateString("fr-FR")}</span>
                      <Badge variant={item.source === "youtube" ? "destructive" : "secondary"} className="text-[10px] gap-1">
                        {item.source === "youtube" ? <><Youtube className="w-2.5 h-2.5" /> YouTube</> : <><UploadIcon className="w-2.5 h-2.5" /> Upload</>}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" className="bg-gold hover:bg-gold-dark text-primary text-xs gap-1 ml-4" onClick={() => publishVideo(item.id, item.title)}>
                    <Tv className="w-3 h-3" /> Diffuser
                  </Button>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-6">Aucune vidéo en attente. <a href="/admin/videos" className="text-gold hover:underline">Ajouter une vidéo →</a></p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" /> En diffusion ({videosPublished.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {videosPublished.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0 flex-1 flex items-center gap-2">
                      <Badge variant={item.source === "youtube" ? "destructive" : "secondary"} className="text-[10px] gap-1 shrink-0">
                        {item.source === "youtube" ? <Youtube className="w-2.5 h-2.5" /> : <UploadIcon className="w-2.5 h-2.5" />}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <span className="text-xs text-muted-foreground">{item.category}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0"><Eye className="w-3 h-3" /> {item.views.toLocaleString()}</span>
                  </div>
                ))}
                {videosPublished.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Aucune vidéo diffusée</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Publications;
