import { useEffect, useState } from "react";
import { Loader2, Pencil, Save, Sparkles, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { computeSeoScore } from "@/lib/seoScore";
import { useSeoSettings } from "@/hooks/useSeoSettings";
import SerpPreview from "./SerpPreview";
import SocialPreview from "./SocialPreview";
import { cn } from "@/lib/utils";

interface Item {
  type: "article" | "video" | "page";
  id: string;
  title: string;
  description: string;
  image: string;
  category?: string;
  content?: string;
  route: string;
}

interface Override {
  id?: string;
  route_pattern: string;
  target_type: string;
  target_id: string;
  title: string;
  description: string;
  og_image: string;
  canonical: string;
  robots: string;
  keywords: string;
}

const SeoOverridesTab = () => {
  const settings = useSeoSettings();
  const [items, setItems] = useState<Item[]>([]);
  const [overrides, setOverrides] = useState<Map<string, Override>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "article" | "video" | "page">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ item: Item; ov: Override } | null>(null);
  const [aiBusy, setAiBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const [aRes, vRes, pRes, oRes] = await Promise.all([
      supabase.from("articles").select("id, title, summary, cover_url, category, content").order("created_at", { ascending: false }).limit(200),
      supabase.from("videos").select("id, title, description, thumbnail_url, category").order("created_at", { ascending: false }).limit(100),
      supabase.from("pages").select("id, slug, title, meta_description").order("sort_order").limit(100),
      supabase.from("seo_overrides").select("*"),
    ]);
    const all: Item[] = [
      ...((aRes.data || []) as any[]).map((a) => ({ type: "article" as const, id: a.id, title: a.title, description: a.summary || "", image: a.cover_url || "", category: a.category, content: a.content, route: `/article/${a.id}` })),
      ...((vRes.data || []) as any[]).map((v) => ({ type: "video" as const, id: v.id, title: v.title, description: v.description || "", image: v.thumbnail_url || "", category: v.category, route: `/videos/${v.id}` })),
      ...((pRes.data || []) as any[]).map((p) => ({ type: "page" as const, id: p.id, title: p.title, description: p.meta_description || "", image: "", route: `/${p.slug}` })),
    ];
    const map = new Map<string, Override>();
    (oRes.data || []).forEach((o: any) => {
      if (o.target_id) map.set(`${o.target_type}:${o.target_id}`, o as Override);
    });
    setItems(all);
    setOverrides(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const visible = items
    .filter((i) => filter === "all" || i.type === filter)
    .filter((i) => !search || i.title.toLowerCase().includes(search.toLowerCase()));

  const stats = (() => {
    let bad = 0, warn = 0, good = 0;
    items.forEach((i) => {
      const ov = overrides.get(`${i.type}:${i.id}`);
      const r = computeSeoScore({ title: ov?.title || i.title, description: ov?.description || i.description, image: ov?.og_image || i.image });
      if (r.level === "good") good++; else if (r.level === "warn") warn++; else bad++;
    });
    return { bad, warn, good };
  })();

  const openEdit = (item: Item) => {
    const existing = overrides.get(`${item.type}:${item.id}`);
    setEditing({
      item,
      ov: existing || {
        route_pattern: item.route,
        target_type: item.type,
        target_id: item.id,
        title: "", description: "", og_image: "", canonical: "", robots: "", keywords: "",
      },
    });
  };

  const saveOverride = async () => {
    if (!editing) return;
    const { ov, item } = editing;
    const payload = { ...ov, route_pattern: item.route, target_type: item.type, target_id: item.id, active: true };
    const res = ov.id
      ? await supabase.from("seo_overrides").update(payload).eq("id", ov.id)
      : await supabase.from("seo_overrides").insert(payload);
    if (res.error) toast({ title: "Erreur", description: res.error.message, variant: "destructive" });
    else { toast({ title: "SEO mis à jour" }); setEditing(null); load(); }
  };

  const generateAi = async () => {
    if (!editing) return;
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("seo-meta-ai", {
        body: { title: editing.item.title, content: editing.item.content || editing.item.description, category: editing.item.category },
      });
      if (error) throw error;
      setEditing({ ...editing, ov: { ...editing.ov, title: data.title || editing.ov.title, description: data.description || editing.ov.description, keywords: data.keywords || editing.ov.keywords } });
      toast({ title: "IA — meta générées" });
    } catch (e: any) {
      toast({ title: "Erreur IA", description: e.message, variant: "destructive" });
    }
    setAiBusy(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gold" /></div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Optimisés</p><p className="text-2xl font-display font-bold text-emerald-600">{stats.good}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">À améliorer</p><p className="text-2xl font-display font-bold text-amber-600">{stats.warn}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Critiques</p><p className="text-2xl font-display font-bold text-destructive">{stats.bad}</p></CardContent></Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 items-center">
        {(["all", "article", "video", "page"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className={filter === f ? "bg-gold text-primary hover:bg-gold-dark" : ""}>
            {f === "all" ? "Tout" : f === "article" ? "Articles" : f === "video" ? "Vidéos" : "Pages"}
          </Button>
        ))}
        <Input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs ml-auto" />
        <Button variant="ghost" size="sm" onClick={load} className="gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Recharger</Button>
      </div>

      {/* Liste */}
      <Card>
        <CardContent className="p-0 divide-y">
          {visible.slice(0, 100).map((i) => {
            const ov = overrides.get(`${i.type}:${i.id}`);
            const t = ov?.title || i.title;
            const d = ov?.description || i.description;
            const img = ov?.og_image || i.image;
            const score = computeSeoScore({ title: t, description: d, image: img });
            return (
              <div key={`${i.type}-${i.id}`} className="p-3 flex items-center gap-3 hover:bg-secondary/30">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  score.level === "good" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
                  score.level === "warn" && "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
                  score.level === "bad" && "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300")}>{score.score}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase">{i.type}</Badge>
                    {ov && <Badge className="text-[10px] bg-gold text-primary">override</Badge>}
                    <p className="text-sm font-semibold truncate font-body">{t}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{i.route}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openEdit(i)} className="gap-1.5"><Pencil className="w-3.5 h-3.5" /> SEO</Button>
              </div>
            );
          })}
          {visible.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Aucun contenu</p>}
        </CardContent>
      </Card>

      {/* Dialog édition */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">SEO — {editing?.item.title}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={generateAi} disabled={aiBusy} className="gap-1.5">
                  {aiBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-gold" />} Générer via IA
                </Button>
              </div>
              <div>
                <Label className="text-xs">Meta title (laisser vide pour utiliser le titre original)</Label>
                <Input value={editing.ov.title} onChange={(e) => setEditing({ ...editing, ov: { ...editing.ov, title: e.target.value } })} placeholder={editing.item.title} maxLength={70} />
                <p className="text-[10px] text-muted-foreground mt-0.5">{editing.ov.title.length}/60c</p>
              </div>
              <div>
                <Label className="text-xs">Meta description</Label>
                <Textarea value={editing.ov.description} onChange={(e) => setEditing({ ...editing, ov: { ...editing.ov, description: e.target.value } })} placeholder={editing.item.description} maxLength={200} rows={3} />
                <p className="text-[10px] text-muted-foreground mt-0.5">{editing.ov.description.length}/160c</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Image OG (URL)</Label>
                  <Input value={editing.ov.og_image} onChange={(e) => setEditing({ ...editing, ov: { ...editing.ov, og_image: e.target.value } })} placeholder={editing.item.image} />
                </div>
                <div>
                  <Label className="text-xs">Canonical (optionnel)</Label>
                  <Input value={editing.ov.canonical} onChange={(e) => setEditing({ ...editing, ov: { ...editing.ov, canonical: e.target.value } })} />
                </div>
                <div>
                  <Label className="text-xs">Robots</Label>
                  <Input value={editing.ov.robots} onChange={(e) => setEditing({ ...editing, ov: { ...editing.ov, robots: e.target.value } })} placeholder="index,follow" />
                </div>
                <div>
                  <Label className="text-xs">Mots-clés</Label>
                  <Input value={editing.ov.keywords} onChange={(e) => setEditing({ ...editing, ov: { ...editing.ov, keywords: e.target.value } })} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aperçu Google</p>
                <SerpPreview title={editing.ov.title || editing.item.title} description={editing.ov.description || editing.item.description} url={`${settings.canonical_base_url}${editing.item.route}`} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aperçu cartes sociales</p>
                <SocialPreview title={editing.ov.title || editing.item.title} description={editing.ov.description || editing.item.description} image={editing.ov.og_image || editing.item.image} url={`${settings.canonical_base_url}${editing.item.route}`} />
              </div>
              <div className="flex justify-between gap-2 pt-2 border-t">
                {editing.ov.id && (
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive gap-1.5" onClick={async () => {
                    await supabase.from("seo_overrides").delete().eq("id", editing.ov.id!);
                    toast({ title: "Override supprimé" }); setEditing(null); load();
                  }}><X className="w-3.5 h-3.5" /> Supprimer override</Button>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
                  <Button onClick={saveOverride} className="bg-gold text-primary hover:bg-gold-dark gap-1.5"><Save className="w-3.5 h-3.5" /> Enregistrer</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeoOverridesTab;