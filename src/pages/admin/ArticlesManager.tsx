import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit, Trash2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const categories = ["Portraits", "Business", "Culture", "Interviews", "Politique", "Talents", "Sport"];

const mockArticles = [
  { id: 1, title: "Aliko Dangote : L'empire qui redéfinit l'Afrique", category: "Business", author: "Jean Mabika", status: "published", premium: true, date: "2026-04-02", views: 12400 },
  { id: 2, title: "Les startups fintech au Kenya", category: "Business", author: "Amara Diallo", status: "draft", premium: false, date: "2026-04-01", views: 0 },
  { id: 3, title: "Fashion Week de Lagos", category: "Culture", author: "Fatou Ndiaye", status: "published", premium: false, date: "2026-03-31", views: 8200 },
  { id: 4, title: "Interview : Ngozi Okonjo-Iweala", category: "Interviews", author: "Paul Essomba", status: "scheduled", premium: true, date: "2026-04-05", views: 0 },
  { id: 5, title: "Le cinéma africain en 2026", category: "Culture", author: "Marie Kouassi", status: "review", premium: false, date: "2026-04-03", views: 0 },
  { id: 6, title: "Portrait : Wangari Maathai", category: "Portraits", author: "Jean Mabika", status: "published", premium: true, date: "2026-03-28", views: 15600 },
  { id: 7, title: "Le talent émergent : Burna Boy", category: "Talents", author: "Amara Diallo", status: "published", premium: false, date: "2026-03-25", views: 22300 },
];

const statusColors: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
};

const statusLabels: Record<string, string> = {
  published: "Publié", draft: "Brouillon", scheduled: "Programmé", review: "En révision",
};

const ArticlesManager = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = mockArticles.filter((a) => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterCategory !== "all" && a.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Gestion des articles</h1>
          <p className="text-sm text-muted-foreground font-body">{mockArticles.length} articles au total</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-primary font-body text-sm gap-1">
              <Plus className="w-4 h-4" /> Nouvel article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Créer un article</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="font-body text-sm">Titre</Label>
                <Input placeholder="Titre de l'article" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-body text-sm">Catégorie</Label>
                  <Select>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-body text-sm">Auteur</Label>
                  <Input placeholder="Nom de l'auteur" className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="font-body text-sm">Résumé</Label>
                <Textarea placeholder="Résumé de l'article..." className="mt-1" rows={3} />
              </div>
              <div>
                <Label className="font-body text-sm">Contenu</Label>
                <Textarea placeholder="Corps de l'article..." className="mt-1" rows={8} />
              </div>
              <div>
                <Label className="font-body text-sm">Image de couverture (URL)</Label>
                <Input placeholder="https://..." className="mt-1" />
              </div>
              <div className="flex items-center gap-3">
                <Switch id="premium" />
                <Label htmlFor="premium" className="font-body text-sm">Contenu premium</Label>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" className="font-body" onClick={() => setCreateOpen(false)}>Enregistrer brouillon</Button>
                <Button className="bg-gold hover:bg-gold-dark text-primary font-body gap-1">
                  <Send className="w-4 h-4" /> Publier
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher un article..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="published">Publiés</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
                <SelectItem value="scheduled">Programmés</SelectItem>
                <SelectItem value="review">En révision</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground font-body">
                  <th className="p-4">Article</th>
                  <th className="p-4 hidden md:table-cell">Catégorie</th>
                  <th className="p-4 hidden lg:table-cell">Auteur</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 hidden md:table-cell">Vues</th>
                  <th className="p-4 hidden lg:table-cell">Date</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{a.title}</span>
                        {a.premium && <span className="text-[10px] bg-gold/20 text-gold-dark px-1.5 py-0.5 rounded font-semibold">PREMIUM</span>}
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground font-body">{a.category}</td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground font-body">{a.author}</td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-body ${statusColors[a.status]}`}>
                        {statusLabels[a.status]}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground font-body">{a.views > 0 ? a.views.toLocaleString() : "—"}</td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground font-body">{a.date}</td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2"><Eye className="w-4 h-4" /> Voir</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2"><Edit className="w-4 h-4" /> Modifier</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2"><Send className="w-4 h-4" /> Publier</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive"><Trash2 className="w-4 h-4" /> Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticlesManager;
