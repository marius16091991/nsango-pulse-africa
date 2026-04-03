import { Plus, Newspaper, Eye, Download, Calendar, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import magazineCover from "@/assets/magazine-cover.jpg";

const issues = [
  { id: 1, title: "Nsango Magazine — Avril 2026", cover: magazineCover, status: "current", date: "Avril 2026", articles: 18, downloads: 3200, premium: true },
  { id: 2, title: "Nsango Magazine — Mars 2026", cover: magazineCover, status: "archived", date: "Mars 2026", articles: 16, downloads: 5400, premium: true },
  { id: 3, title: "Nsango Magazine — Février 2026", cover: magazineCover, status: "archived", date: "Février 2026", articles: 15, downloads: 4800, premium: false },
  { id: 4, title: "Nsango Magazine — Janvier 2026", cover: magazineCover, status: "archived", date: "Janvier 2026", articles: 14, downloads: 4200, premium: false },
];

const MagazineManager = () => (
  <div className="p-6 lg:p-8 space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-display font-bold">Magazine mensuel</h1>
        <p className="text-sm text-muted-foreground font-body">Gérez les éditions du magazine numérique</p>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-gold hover:bg-gold-dark text-primary font-body text-sm gap-1"><Plus className="w-4 h-4" /> Nouvelle édition</Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Créer une édition</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label className="font-body text-sm">Titre</Label><Input className="mt-1" placeholder="Nsango Magazine — Mai 2026" /></div>
            <div><Label className="font-body text-sm">Image de couverture (URL)</Label><Input className="mt-1" placeholder="https://..." /></div>
            <div><Label className="font-body text-sm">Fichier PDF (URL)</Label><Input className="mt-1" placeholder="https://..." /></div>
            <div><Label className="font-body text-sm">Sommaire</Label><Textarea className="mt-1" rows={4} placeholder="Résumé du contenu du numéro..." /></div>
            <div className="flex items-center gap-3">
              <Switch id="prem" defaultChecked />
              <Label htmlFor="prem" className="font-body text-sm">Réservé aux abonnés premium</Label>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="font-body">Enregistrer brouillon</Button>
              <Button className="bg-gold hover:bg-gold-dark text-primary font-body">Publier</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {issues.map((issue) => (
        <Card key={issue.id} className={issue.status === "current" ? "border-gold/50 ring-1 ring-gold/20" : ""}>
          <CardContent className="p-5">
            <div className="flex gap-4">
              <img src={issue.cover} alt={issue.title} className="w-24 h-32 object-cover rounded-md shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium truncate">{issue.title}</h3>
                  {issue.status === "current" && <span className="text-[10px] bg-gold/20 text-gold-dark px-2 py-0.5 rounded font-semibold font-body">EN COURS</span>}
                </div>
                <div className="space-y-1 text-xs text-muted-foreground font-body">
                  <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {issue.date}</p>
                  <p className="flex items-center gap-1"><Newspaper className="w-3 h-3" /> {issue.articles} articles</p>
                  <p className="flex items-center gap-1"><Download className="w-3 h-3" /> {issue.downloads.toLocaleString()} téléchargements</p>
                  {issue.premium && <p className="flex items-center gap-1"><Crown className="w-3 h-3 text-gold" /> Premium uniquement</p>}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="text-xs font-body gap-1"><Eye className="w-3 h-3" /> Voir</Button>
                  <Button size="sm" variant="outline" className="text-xs font-body gap-1"><Download className="w-3 h-3" /> PDF</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default MagazineManager;
