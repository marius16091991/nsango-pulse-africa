import { useState } from "react";
import { Plus, Megaphone, Pause, Play, Eye, MousePointerClick, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

const campaigns = [
  { id: 1, name: "MTN Nigeria — Campagne Q2", advertiser: "MTN Nigeria", status: "active", format: "Bannière horizontale", impressions: 145000, clicks: 3200, budget: 5000, spent: 3400, start: "2026-03-15", end: "2026-04-15" },
  { id: 2, name: "Dangote Cement — Premium", advertiser: "Dangote Group", status: "active", format: "Zone sponsorisée", impressions: 89000, clicks: 1800, budget: 8000, spent: 5200, start: "2026-03-01", end: "2026-04-30" },
  { id: 3, name: "Ethiopian Airlines — Printemps", advertiser: "Ethiopian Airlines", status: "paused", format: "Bannière latérale", impressions: 32000, clicks: 700, budget: 3000, spent: 1200, start: "2026-03-10", end: "2026-04-10" },
  { id: 4, name: "Safaricom — Innovation", advertiser: "Safaricom", status: "completed", format: "Bloc inline", impressions: 210000, clicks: 5600, budget: 6000, spent: 6000, start: "2026-02-01", end: "2026-03-31" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-100 text-green-700" },
  paused: { label: "En pause", color: "bg-amber-100 text-amber-700" },
  completed: { label: "Terminée", color: "bg-muted text-muted-foreground" },
};

const Advertising = () => {
  const [createOpen, setCreateOpen] = useState(false);

  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.spent, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Campagnes publicitaires</h1>
          <p className="text-sm text-muted-foreground font-body">Gérez vos annonceurs et campagnes</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-primary font-body text-sm gap-1">
              <Plus className="w-4 h-4" /> Nouvelle campagne
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">Créer une campagne</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label className="font-body text-sm">Nom de la campagne</Label><Input className="mt-1" placeholder="Ex: MTN — Campagne été" /></div>
              <div><Label className="font-body text-sm">Annonceur</Label><Input className="mt-1" placeholder="Nom de l'annonceur" /></div>
              <div>
                <Label className="font-body text-sm">Format publicitaire</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choisir un format" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner-h">Bannière horizontale</SelectItem>
                    <SelectItem value="banner-side">Bannière latérale</SelectItem>
                    <SelectItem value="inline">Bloc inline (entre articles)</SelectItem>
                    <SelectItem value="sponsored">Zone sponsorisée (accueil)</SelectItem>
                    <SelectItem value="video">Publicité vidéo</SelectItem>
                    <SelectItem value="magazine">Publicité magazine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="font-body text-sm">Date début</Label><Input type="date" className="mt-1" /></div>
                <div><Label className="font-body text-sm">Date fin</Label><Input type="date" className="mt-1" /></div>
              </div>
              <div><Label className="font-body text-sm">Budget (USD)</Label><Input type="number" className="mt-1" placeholder="5000" /></div>
              <div><Label className="font-body text-sm">Visuel (URL)</Label><Input className="mt-1" placeholder="https://..." /></div>
              <div><Label className="font-body text-sm">Lien de redirection</Label><Input className="mt-1" placeholder="https://..." /></div>
              <div><Label className="font-body text-sm">Notes</Label><Textarea className="mt-1" rows={2} /></div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" className="font-body" onClick={() => setCreateOpen(false)}>Annuler</Button>
                <Button className="bg-gold hover:bg-gold-dark text-primary font-body">Lancer la campagne</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 flex items-center gap-4"><Eye className="w-8 h-8 text-gold" /><div><p className="text-2xl font-bold font-display">{(totalImpressions / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground font-body">Impressions totales</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><MousePointerClick className="w-8 h-8 text-gold" /><div><p className="text-2xl font-bold font-display">{(totalClicks / 1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground font-body">Clics totaux</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><DollarSign className="w-8 h-8 text-gold" /><div><p className="text-2xl font-bold font-display">${totalRevenue.toLocaleString()}</p><p className="text-xs text-muted-foreground font-body">Revenus publicitaires</p></div></CardContent></Card>
      </div>

      {/* Campaigns */}
      <div className="space-y-4">
        {campaigns.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-sm truncate">{c.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-body ${statusConfig[c.status].color}`}>
                      {statusConfig[c.status].label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-body">
                    <span>{c.advertiser}</span>
                    <span>{c.format}</span>
                    <span>{c.start} → {c.end}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={(c.spent / c.budget) * 100} className="flex-1 h-2" />
                    <span className="text-xs font-body text-muted-foreground">${c.spent.toLocaleString()} / ${c.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs font-body text-muted-foreground">
                    <span>{c.impressions.toLocaleString()} impressions</span>
                    <span>{c.clicks.toLocaleString()} clics</span>
                    <span>CTR {((c.clicks / c.impressions) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {c.status === "active" && <Button size="sm" variant="outline" className="text-xs font-body gap-1"><Pause className="w-3 h-3" /> Pause</Button>}
                  {c.status === "paused" && <Button size="sm" variant="outline" className="text-xs font-body gap-1"><Play className="w-3 h-3" /> Reprendre</Button>}
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
