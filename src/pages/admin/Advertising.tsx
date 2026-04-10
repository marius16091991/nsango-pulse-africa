import { useState } from "react";
import { Plus, Pause, Play, Eye, MousePointerClick, DollarSign, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Campaign {
  id: number; name: string; advertiser: string; status: string; format: string;
  impressions: number; clicks: number; budget: number; spent: number; start: string; end: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-100 text-green-700" },
  paused: { label: "En pause", color: "bg-amber-100 text-amber-700" },
  completed: { label: "Terminée", color: "bg-muted text-muted-foreground" },
};

const Advertising = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: 1, name: "MTN Nigeria — Campagne Q2", advertiser: "MTN Nigeria", status: "active", format: "Bannière horizontale", impressions: 145000, clicks: 3200, budget: 5000, spent: 3400, start: "2026-03-15", end: "2026-04-15" },
    { id: 2, name: "Dangote Cement — Premium", advertiser: "Dangote Group", status: "active", format: "Zone sponsorisée", impressions: 89000, clicks: 1800, budget: 8000, spent: 5200, start: "2026-03-01", end: "2026-04-30" },
    { id: 3, name: "Ethiopian Airlines — Printemps", advertiser: "Ethiopian Airlines", status: "paused", format: "Bannière latérale", impressions: 32000, clicks: 700, budget: 3000, spent: 1200, start: "2026-03-10", end: "2026-04-10" },
    { id: 4, name: "Safaricom — Innovation", advertiser: "Safaricom", status: "completed", format: "Bloc inline", impressions: 210000, clicks: 5600, budget: 6000, spent: 6000, start: "2026-02-01", end: "2026-03-31" },
  ]);
  const [createOpen, setCreateOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formAdvertiser, setFormAdvertiser] = useState("");
  const [formFormat, setFormFormat] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");

  const resetForm = () => { setFormName(""); setFormAdvertiser(""); setFormFormat(""); setFormBudget(""); setFormStart(""); setFormEnd(""); };

  const handleCreate = () => {
    if (!formName.trim()) { toast({ title: "Erreur", description: "Le nom est requis", variant: "destructive" }); return; }
    const newCampaign: Campaign = {
      id: Date.now(), name: formName, advertiser: formAdvertiser || "Annonceur",
      status: "active", format: formFormat || "Bannière horizontale",
      impressions: 0, clicks: 0, budget: Number(formBudget) || 1000, spent: 0,
      start: formStart || new Date().toISOString().split("T")[0], end: formEnd || "Non défini",
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    toast({ title: "Campagne lancée", description: formName });
    resetForm(); setCreateOpen(false);
  };

  const toggleStatus = (id: number) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newStatus = c.status === "active" ? "paused" : "active";
      toast({ title: newStatus === "active" ? "Campagne reprise" : "Campagne mise en pause" });
      return { ...c, status: newStatus };
    }));
  };

  const deleteCampaign = (id: number) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    toast({ title: "Campagne supprimée" });
  };

  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.spent, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Campagnes publicitaires</h1>
          <p className="text-sm text-muted-foreground font-body">{campaigns.length} campagnes</p>
        </div>
        <Dialog open={createOpen} onOpenChange={o => { if (!o) resetForm(); setCreateOpen(o); }}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-primary font-body text-sm gap-1"><Plus className="w-4 h-4" /> Nouvelle campagne</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">Créer une campagne</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label className="font-body text-sm">Nom</Label><Input className="mt-1" placeholder="MTN — Campagne été" value={formName} onChange={e => setFormName(e.target.value)} /></div>
              <div><Label className="font-body text-sm">Annonceur</Label><Input className="mt-1" placeholder="Nom de l'annonceur" value={formAdvertiser} onChange={e => setFormAdvertiser(e.target.value)} /></div>
              <div><Label className="font-body text-sm">Format</Label>
                <Select value={formFormat} onValueChange={setFormFormat}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bannière horizontale">Bannière horizontale</SelectItem>
                    <SelectItem value="Bannière latérale">Bannière latérale</SelectItem>
                    <SelectItem value="Bloc inline">Bloc inline</SelectItem>
                    <SelectItem value="Zone sponsorisée">Zone sponsorisée</SelectItem>
                    <SelectItem value="Publicité vidéo">Publicité vidéo</SelectItem>
                    <SelectItem value="Publicité magazine">Publicité magazine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="font-body text-sm">Date début</Label><Input type="date" className="mt-1" value={formStart} onChange={e => setFormStart(e.target.value)} /></div>
                <div><Label className="font-body text-sm">Date fin</Label><Input type="date" className="mt-1" value={formEnd} onChange={e => setFormEnd(e.target.value)} /></div>
              </div>
              <div><Label className="font-body text-sm">Budget (USD)</Label><Input type="number" className="mt-1" placeholder="5000" value={formBudget} onChange={e => setFormBudget(e.target.value)} /></div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" className="font-body" onClick={() => setCreateOpen(false)}>Annuler</Button>
                <Button className="bg-gold hover:bg-gold-dark text-primary font-body" onClick={handleCreate}>Lancer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 flex items-center gap-4"><Eye className="w-8 h-8 text-gold" /><div><p className="text-2xl font-bold font-display">{(totalImpressions / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground font-body">Impressions</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><MousePointerClick className="w-8 h-8 text-gold" /><div><p className="text-2xl font-bold font-display">{(totalClicks / 1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground font-body">Clics</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><DollarSign className="w-8 h-8 text-gold" /><div><p className="text-2xl font-bold font-display">${totalRevenue.toLocaleString()}</p><p className="text-xs text-muted-foreground font-body">Revenus</p></div></CardContent></Card>
      </div>

      <div className="space-y-4">
        {campaigns.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-sm truncate">{c.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-body ${statusConfig[c.status]?.color}`}>
                      {statusConfig[c.status]?.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-body">
                    <span>{c.advertiser}</span><span>{c.format}</span><span>{c.start} → {c.end}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={c.budget > 0 ? (c.spent / c.budget) * 100 : 0} className="flex-1 h-2" />
                    <span className="text-xs font-body text-muted-foreground">${c.spent.toLocaleString()} / ${c.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs font-body text-muted-foreground">
                    <span>{c.impressions.toLocaleString()} impressions</span>
                    <span>{c.clicks.toLocaleString()} clics</span>
                    <span>CTR {c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(1) : 0}%</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {(c.status === "active" || c.status === "paused") && (
                    <Button size="sm" variant="outline" className="text-xs font-body gap-1" onClick={() => toggleStatus(c.id)}>
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
      </div>
    </div>
  );
};

export default Advertising;
