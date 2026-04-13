import { useState, useEffect } from "react";
import { Plus, Pause, Play, Eye, MousePointerClick, DollarSign, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-100 text-green-700" },
  paused: { label: "En pause", color: "bg-amber-100 text-amber-700" },
  completed: { label: "Terminée", color: "bg-muted text-muted-foreground" },
};

const Advertising = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [formAdvertiser, setFormAdvertiser] = useState("");
  const [formFormat, setFormFormat] = useState("Bannière horizontale");
  const [formBudget, setFormBudget] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");

  const fetchCampaigns = async () => {
    const { data } = await supabase.from("ad_campaigns").select("*").order("created_at", { ascending: false });
    setCampaigns(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const resetForm = () => { setFormName(""); setFormAdvertiser(""); setFormFormat("Bannière horizontale"); setFormBudget(""); setFormStart(""); setFormEnd(""); };

  const handleCreate = async () => {
    if (!formName.trim()) { toast({ title: "Erreur", description: "Le nom est requis", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("ad_campaigns").insert({
      name: formName, advertiser: formAdvertiser || "Annonceur", format: formFormat,
      budget: Number(formBudget) || 1000, start_date: formStart || null, end_date: formEnd || null,
      created_by: user?.id,
    });
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else toast({ title: "Campagne lancée ✓" });
    setSaving(false); resetForm(); setCreateOpen(false); fetchCampaigns();
  };

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "paused" : "active";
    await supabase.from("ad_campaigns").update({ status: newStatus }).eq("id", id);
    toast({ title: newStatus === "active" ? "Campagne reprise" : "Campagne en pause" }); fetchCampaigns();
  };

  const deleteCampaign = async (id: string) => {
    await supabase.from("ad_campaigns").delete().eq("id", id);
    toast({ title: "Campagne supprimée" }); fetchCampaigns();
  };

  const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalRevenue = campaigns.reduce((s, c) => s + Number(c.spent || 0), 0);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Campagnes publicitaires</h1>
          <p className="text-sm text-muted-foreground">{campaigns.length} campagnes</p>
        </div>
        <Dialog open={createOpen} onOpenChange={o => { if (!o) resetForm(); setCreateOpen(o); }}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-primary text-sm gap-1.5"><Plus className="w-4 h-4" /> Nouvelle campagne</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">Créer une campagne</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label className="text-sm">Nom</Label><Input className="mt-1" placeholder="MTN — Campagne été" value={formName} onChange={e => setFormName(e.target.value)} /></div>
              <div><Label className="text-sm">Annonceur</Label><Input className="mt-1" placeholder="Nom de l'annonceur" value={formAdvertiser} onChange={e => setFormAdvertiser(e.target.value)} /></div>
              <div><Label className="text-sm">Format</Label>
                <Select value={formFormat} onValueChange={setFormFormat}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bannière horizontale">Bannière horizontale</SelectItem>
                    <SelectItem value="Bannière latérale">Bannière latérale</SelectItem>
                    <SelectItem value="Bloc inline">Bloc inline</SelectItem>
                    <SelectItem value="Zone sponsorisée">Zone sponsorisée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm">Date début</Label><Input type="date" className="mt-1" value={formStart} onChange={e => setFormStart(e.target.value)} /></div>
                <div><Label className="text-sm">Date fin</Label><Input type="date" className="mt-1" value={formEnd} onChange={e => setFormEnd(e.target.value)} /></div>
              </div>
              <div><Label className="text-sm">Budget (USD)</Label><Input type="number" className="mt-1" placeholder="5000" value={formBudget} onChange={e => setFormBudget(e.target.value)} /></div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
                <Button className="bg-gold hover:bg-gold-dark text-primary" onClick={handleCreate} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lancer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 flex items-center gap-4"><Eye className="w-8 h-8 text-gold" /><div><p className="text-2xl font-bold font-display">{(totalImpressions / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Impressions</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><MousePointerClick className="w-8 h-8 text-gold" /><div><p className="text-2xl font-bold font-display">{(totalClicks / 1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Clics</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><DollarSign className="w-8 h-8 text-gold" /><div><p className="text-2xl font-bold font-display">${totalRevenue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Revenus</p></div></CardContent></Card>
      </div>

      <div className="space-y-4">
        {campaigns.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-sm truncate">{c.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusConfig[c.status]?.color || "bg-muted text-muted-foreground"}`}>
                      {statusConfig[c.status]?.label || c.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{c.advertiser}</span><span>{c.format}</span>
                    {c.start_date && <span>{c.start_date} → {c.end_date || "..."}</span>}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={Number(c.budget) > 0 ? (Number(c.spent) / Number(c.budget)) * 100 : 0} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground">${Number(c.spent).toLocaleString()} / ${Number(c.budget).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {(c.status === "active" || c.status === "paused") && (
                    <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => toggleStatus(c.id, c.status)}>
                      {c.status === "active" ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Reprendre</>}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => deleteCampaign(c.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {campaigns.length === 0 && <p className="text-center text-muted-foreground py-12">Aucune campagne. Lancez la première !</p>}
      </div>
    </div>
  );
};

export default Advertising;
