import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Heart, Flame, Hand, Trash2, ExternalLink, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const EMOJI_META: Record<string, { icon: any; label: string; color: string }> = {
  heart: { icon: Heart, label: "J'aime", color: "text-rose-500" },
  fire: { icon: Flame, label: "Top", color: "text-orange-500" },
  clap: { icon: Hand, label: "Bravo", color: "text-amber-500" },
};

interface Row {
  id: string;
  target_type: string;
  target_id: string;
  emoji: string;
  user_id: string | null;
  voter_ip: string | null;
  created_at: string;
}

const ReactionsManager = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [articlesMap, setArticlesMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: reactions } = await supabase
      .from("reactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    const list = (reactions || []) as Row[];
    setRows(list);
    const articleIds = Array.from(
      new Set(list.filter(r => r.target_type === "article").map(r => r.target_id))
    );
    if (articleIds.length) {
      const { data: arts } = await supabase
        .from("articles")
        .select("id, title")
        .in("id", articleIds);
      const m: Record<string, string> = {};
      (arts || []).forEach((a: any) => { m[a.id] = a.title; });
      setArticlesMap(m);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const removeReaction = async (id: string) => {
    setBusy(id);
    const { error } = await supabase.from("reactions").delete().eq("id", id);
    setBusy(null);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Réaction supprimée" });
    setRows(rows.filter(r => r.id !== id));
  };

  // Aggregated counts per article
  const perArticle: Record<string, { heart: number; fire: number; clap: number; total: number }> = {};
  rows.forEach(r => {
    if (r.target_type !== "article") return;
    if (!perArticle[r.target_id]) perArticle[r.target_id] = { heart: 0, fire: 0, clap: 0, total: 0 };
    const k = r.emoji as "heart" | "fire" | "clap";
    if (perArticle[r.target_id][k] !== undefined) perArticle[r.target_id][k]++;
    perArticle[r.target_id].total++;
  });
  const ranked = Object.entries(perArticle)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 30);

  const totals = { heart: 0, fire: 0, clap: 0 };
  rows.forEach(r => { if ((totals as any)[r.emoji] !== undefined) (totals as any)[r.emoji]++; });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold">Réactions</h1>
          <p className="text-sm text-muted-foreground">Likes ❤️🔥👏 sur articles, vidéos et commentaires</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCcw className="w-4 h-4" /> Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {(["heart", "fire", "clap"] as const).map(k => {
          const M = EMOJI_META[k];
          const Icon = M.icon;
          return (
            <Card key={k}>
              <CardContent className="p-4 md:p-5">
                <div className={`w-9 h-9 rounded-lg bg-secondary flex items-center justify-center mb-3 ${M.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-display font-bold">{totals[k]}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{M.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="articles">
        <TabsList>
          <TabsTrigger value="articles">Top articles</TabsTrigger>
          <TabsTrigger value="recent">Réactions récentes</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-display">Articles les plus appréciés</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
              ) : ranked.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Aucune réaction pour le moment.</p>
              ) : (
                <div className="space-y-1">
                  {ranked.map(([id, c]) => (
                    <div key={id} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/50 border-b border-border last:border-0">
                      <div className="min-w-0 flex-1 mr-4">
                        <p className="text-sm font-medium truncate">{articlesMap[id] || `Article ${id.slice(0, 8)}…`}</p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                          <span>❤️ {c.heart}</span>
                          <span>🔥 {c.fire}</span>
                          <span>👏 {c.clap}</span>
                          <span className="font-semibold">· {c.total} au total</span>
                        </div>
                      </div>
                      <Link to={`/article/${id}`} target="_blank">
                        <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
                          <ExternalLink className="w-3.5 h-3.5" /> Voir
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-display">500 dernières réactions</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
              ) : rows.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Aucune réaction.</p>
              ) : (
                <div className="space-y-1 max-h-[600px] overflow-y-auto">
                  {rows.map(r => {
                    const M = EMOJI_META[r.emoji];
                    return (
                      <div key={r.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/50 border-b border-border last:border-0 text-sm">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-lg">{r.emoji === "heart" ? "❤️" : r.emoji === "fire" ? "🔥" : r.emoji === "clap" ? "👏" : r.emoji}</span>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {r.target_type === "article"
                                ? (articlesMap[r.target_id] || `Article ${r.target_id.slice(0, 8)}…`)
                                : `${r.target_type} ${r.target_id.slice(0, 8)}…`}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {M?.label || r.emoji} · {new Date(r.created_at).toLocaleString("fr-FR")} · {r.user_id ? "Membre" : "Visiteur"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {r.target_type === "article" && (
                            <Link to={`/article/${r.target_id}`} target="_blank">
                              <Button size="icon" variant="ghost" className="h-8 w-8"><ExternalLink className="w-3.5 h-3.5" /></Button>
                            </Link>
                          )}
                          <Button
                            size="icon" variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={busy === r.id}
                            onClick={() => removeReaction(r.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReactionsManager;
