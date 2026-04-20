import { useState, useEffect } from "react";
import { Plus, Pause, Play, Eye, MousePointerClick, DollarSign, Trash2, Loader2, Image as ImageIcon, Target, BarChart3, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PAGES = ["/", "/business", "/culture", "/portraits", "/interviews", "/videos", "/podcasts", "/actualites", "/evenements", "/magazine", "/article"];
const CATEGORIES = ["Business", "Culture", "Politique", "Sport", "Tech", "Lifestyle"];

const Advertising = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [creativesByCamp, setCreativesByCamp] = useState<Record<string, any[]>>({});
  const [statsByCamp, setStatsByCamp] = useState<Record<string, { impressions: number; clicks: number; daily: any[] }>>({});
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creativeOpen, setCreativeOpen] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [advertiser, setAdvertiser] = useState("");
  const [format, setFormat] = useState("Bannière horizontale");
  const [budget, setBudget] = useState("");
  const [clickUrl, setClickUrl] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [targetPages, setTargetPages] = useState<string[]>([]);
  const [targetCats, setTargetCats] = useState<string[]>([]);

  const fetchAll = async () => {
    const { data: cs } = await supabase.from("ad_campaigns").select("*").order("created_at", { ascending: false });
    setCampaigns(cs || []);
    if (cs?.length) {
      const ids = cs.map(c => c.id);
      const [{ data: cre }, { data: ev }] = await Promise.all([
        supabase.from("ad_creatives").select("*").in("campaign_id", ids),
        supabase.from("ad_events").select("campaign_id, event_type, created_at").in("campaign_id", ids).gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
      ]);
      const grouped: Record<string, any[]> = {};
      (cre || []).forEach(c => { (grouped[c.campaign_id] = grouped[c.campaign_id] || []).push(c); });
      setCreativesByCamp(grouped);
      const stats: Record<string, any> = {};
      (ev || []).forEach((e: any) => {
        if (!stats[e.campaign_id]) stats[e.campaign_id] = { impressions: 0, clicks: 0, daily: {} };
        if (e.event_type === "impression") stats[e.campaign_id].impressions++;
        else stats[e.campaign_id].clicks++;
        const day = e.created_at.slice(0, 10);
        stats[e.campaign_id].daily[day] = (stats[e.campaign_id].daily[day] || 0) + 1;
      });
      setStatsByCamp(stats);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const reset = () => { setName(""); setAdvertiser(""); setFormat("Bannière horizontale"); setBudget(""); setClickUrl(""); setStart(""); setEnd(""); setTargetPages([]); setTargetCats([]); };

  const create = async () => {
    if (!name.trim()) { toast({ title: "Nom requis", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("ad_campaigns").insert({
      name, advertiser: advertiser || "Annonceur", format, budget: Number(budget) || 1000,
      click_url: clickUrl, start_date: start || null, end_date: end || null,
      target_pages: targetPages, target_categories: targetCats, created_by: user?.id,
    });
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else toast({ title: "Campagne créée ✓ — ajoutez maintenant un visuel" });
    setSaving(false); reset(); setCreateOpen(false); fetchAll();
  };

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "paused" : "active";
    await supabase.from("ad_campaigns").update({ status: newStatus }).eq("id", id);
    toast({ title: newStatus === "active" ? "Reprise" : "En pause" }); fetchAll();
  };
  const remove = async (id: string) => { await supabase.from("ad_campaigns").delete().eq("id", id); toast({ title: "Supprimée" }); fetchAll(); };

  const uploadCreative = async (file: File, campaignId: string, click: string) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${campaignId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("ad-creatives").upload(path, file);
    if (upErr) { toast({ title: "Upload échoué", description: upErr.message, variant: "destructive" }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("ad-creatives").getPublicUrl(path);
    await supabase.from("ad_creatives").insert({ campaign_id: campaignId, image_url: publicUrl, click_url: click, alt: file.name });
    toast({ title: "Visuel ajouté ✓" }); setUploading(false); fetchAll();
  };

  const removeCreative = async (id: string) => { await supabase.from("ad_creatives").delete().eq("id", id); fetchAll(); };

  const totalImp = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const totalClk = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalRev = campaigns.reduce((s, c) => s + Number(c.spent || 0), 0);
  const ctr = totalImp > 0 ? ((totalClk / totalImp) * 100).toFixed(2) : "0";

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Campagnes pub</h1>
          <p className="text-sm text-muted-foreground">{campaigns.length} campagnes · CTR global {ctr}%</p>
        </div>
        <Dialog open={createOpen} onOpenChange={o => { if (!o) reset(); setCreateOpen(o); }}>
          <DialogTrigger asChild><Button className="bg-gold hover:bg-gold-dark text-primary text-sm gap-1.5"><Plus className="w-4 h-4" /> Nouvelle campagne</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display">Créer une campagne</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Nom *</Label><Input className="mt-1" value={name} onChange={e => setName(e.target.value)} /></div>
                <div><Label>Annonceur</Label><Input className="mt-1" value={advertiser} onChange={e => setAdvertiser(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bannière horizontale">Bannière horizontale</SelectItem>
                      <SelectItem value="Bannière latérale">Bannière latérale</SelectItem>
                      <SelectItem value="Bloc inline">Bloc inline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Budget (USD)</Label><Input type="number" className="mt-1" value={budget} onChange={e => setBudget(e.target.value)} /></div>
              </div>
              <div><Label>URL cliquable par défaut</Label><Input className="mt-1" placeholder="https://..." value={clickUrl} onChange={e => setClickUrl(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Début</Label><Input type="date" className="mt-1" value={start} onChange={e => setStart(e.target.value)} /></div>
                <div><Label>Fin</Label><Input type="date" className="mt-1" value={end} onChange={e => setEnd(e.target.value)} /></div>
              </div>
              <div>
                <Label className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Pages ciblées (vide = partout)</Label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {PAGES.map(p => (
                    <button type="button" key={p} onClick={() => setTargetPages(s => s.includes(p) ? s.filter(x => x !== p) : [...s, p])}
                      className={`text-xs px-2.5 py-1 rounded-full border ${targetPages.includes(p) ? "bg-gold text-primary border-gold" : "bg-secondary border-border"}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Catégories d'articles (vide = toutes)</Label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {CATEGORIES.map(c => (
                    <button type="button" key={c} onClick={() => setTargetCats(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c])}
                      className={`text-xs px-2.5 py-1 rounded-full border ${targetCats.includes(c) ? "bg-gold text-primary border-gold" : "bg-secondary border-border"}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
                <Button className="bg-gold hover:bg-gold-dark text-primary" onClick={create} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lancer"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><Eye className="w-7 h-7 text-gold" /><div><p className="text-xl font-bold font-display">{totalImp.toLocaleString()}</p><p className="text-[11px] text-muted-foreground">Impressions</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><MousePointerClick className="w-7 h-7 text-gold" /><div><p className="text-xl font-bold font-display">{totalClk.toLocaleString()}</p><p className="text-[11px] text-muted-foreground">Clics</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><BarChart3 className="w-7 h-7 text-gold" /><div><p className="text-xl font-bold font-display">{ctr}%</p><p className="text-[11px] text-muted-foreground">CTR</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><DollarSign className="w-7 h-7 text-gold" /><div><p className="text-xl font-bold font-display">${totalRev.toLocaleString()}</p><p className="text-[11px] text-muted-foreground">Revenus</p></div></CardContent></Card>
      </div>

      <div className="space-y-4">
        {campaigns.map(c => {
          const cre = creativesByCamp[c.id] || [];
          const stats = statsByCamp[c.id] || { impressions: 0, clicks: 0, daily: {} };
          const cCtr = stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(2) : "0";
          return (
            <Card key={c.id}>
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-medium text-sm">{c.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{c.status}</span>
                      <span className="text-[10px] text-muted-foreground">{cre.length} créa{cre.length > 1 ? "s" : ""}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.advertiser} · {c.format}</p>
                    {(c.target_pages?.length > 0 || c.target_categories?.length > 0) && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {c.target_pages?.length > 0 && <span>📍 {c.target_pages.join(", ")} </span>}
                        {c.target_categories?.length > 0 && <span>🏷️ {c.target_categories.join(", ")}</span>}
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                      <div><p className="text-muted-foreground">Impressions 7j</p><p className="font-bold tabular-nums">{stats.impressions.toLocaleString()}</p></div>
                      <div><p className="text-muted-foreground">Clics 7j</p><p className="font-bold tabular-nums">{stats.clicks.toLocaleString()}</p></div>
                      <div><p className="text-muted-foreground">CTR</p><p className="font-bold tabular-nums text-gold">{cCtr}%</p></div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={Number(c.budget) > 0 ? (Number(c.spent) / Number(c.budget)) * 100 : 0} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground tabular-nums">${Number(c.spent).toLocaleString()} / ${Number(c.budget).toLocaleString()}</span>
                    </div>
                    {cre.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {cre.map(cv => (
                          <div key={cv.id} className="relative w-20 h-14 rounded border border-border overflow-hidden group">
                            <img src={cv.image_url} className="w-full h-full object-cover" alt="" />
                            <button onClick={() => removeCreative(cv.id)} className="absolute inset-0 bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 flex items-center justify-center transition"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setCreativeOpen(c)}><ImageIcon className="w-3 h-3" /> Visuel</Button>
                    <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => toggleStatus(c.id, c.status)}>
                      {c.status === "active" ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Reprendre</>}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => remove(c.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {campaigns.length === 0 && <p className="text-center text-muted-foreground py-12">Aucune campagne. Lancez la première !</p>}
      </div>

      <Dialog open={!!creativeOpen} onOpenChange={(o) => !o && setCreativeOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter un visuel — {creativeOpen?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>Image (PNG/JPG/WebP)</Label>
            <Input type="file" accept="image/*" disabled={uploading} onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && creativeOpen) uploadCreative(f, creativeOpen.id, creativeOpen.click_url || "");
            }} />
            {uploading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</div>}
            <p className="text-xs text-muted-foreground">Plusieurs visuels possibles → rotation automatique côté site.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Advertising;
