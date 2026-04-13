import { useState, useEffect } from "react";
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit, Trash2, Send, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const categories = ["Portraits", "Business", "Culture", "Interviews", "Politique", "Talents", "Sport"];

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
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Business");
  const [formAuthor, setFormAuthor] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCover, setFormCover] = useState("");
  const [formPremium, setFormPremium] = useState(false);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setArticles(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, []);

  const resetForm = () => {
    setFormTitle(""); setFormCategory("Business"); setFormAuthor(""); setFormSummary("");
    setFormContent(""); setFormCover(""); setFormPremium(false); setEditId(null);
  };

  const openEdit = (a: any) => {
    setFormTitle(a.title); setFormCategory(a.category); setFormAuthor(a.author_name || "");
    setFormSummary(a.summary || ""); setFormContent(a.content || ""); setFormCover(a.cover_url || "");
    setFormPremium(a.premium); setEditId(a.id); setCreateOpen(true);
  };

  const handleSave = async (status: string) => {
    if (!formTitle.trim()) { toast({ title: "Erreur", description: "Le titre est requis", variant: "destructive" }); return; }
    setSaving(true);
    const payload = {
      title: formTitle, category: formCategory, author_name: formAuthor || "Admin",
      summary: formSummary, content: formContent, cover_url: formCover,
      premium: formPremium, status, created_by: user?.id,
    };
    if (editId) {
      const { error } = await supabase.from("articles").update(payload).eq("id", editId);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Article modifié ✓" }); }
    } else {
      const { error } = await supabase.from("articles").insert(payload);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); }
      else { toast({ title: status === "published" ? "Article publié ✓" : "Brouillon enregistré ✓" }); }
    }
    setSaving(false); resetForm(); setCreateOpen(false); fetchArticles();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else { toast({ title: "Article supprimé" }); fetchArticles(); }
  };

  const handlePublish = async (id: string) => {
    const { error } = await supabase.from("articles").update({ status: "published" }).eq("id", id);
    if (!error) { toast({ title: "Article publié ✓" }); fetchArticles(); }
  };

  const filtered = articles.filter((a) => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterCategory !== "all" && a.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Gestion des articles</h1>
          <p className="text-sm text-muted-foreground">{articles.length} articles au total</p>
        </div>
        <Dialog open={createOpen} onOpenChange={(open) => { if (!open) resetForm(); setCreateOpen(open); }}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-primary text-sm gap-1.5">
              <Plus className="w-4 h-4" /> Nouvel article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editId ? "Modifier l'article" : "Créer un article"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label className="text-sm">Titre *</Label><Input placeholder="Titre de l'article" className="mt-1" value={formTitle} onChange={e => setFormTitle(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm">Catégorie</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-sm">Auteur</Label><Input placeholder="Nom de l'auteur" className="mt-1" value={formAuthor} onChange={e => setFormAuthor(e.target.value)} /></div>
              </div>
              <div><Label className="text-sm">Résumé</Label><Textarea placeholder="Résumé court..." className="mt-1" rows={3} value={formSummary} onChange={e => setFormSummary(e.target.value)} /></div>
              <div><Label className="text-sm">Contenu</Label><Textarea placeholder="Corps de l'article..." className="mt-1" rows={8} value={formContent} onChange={e => setFormContent(e.target.value)} /></div>
              <div><Label className="text-sm">Image de couverture (URL)</Label><Input placeholder="https://..." className="mt-1" value={formCover} onChange={e => setFormCover(e.target.value)} /></div>
              <div className="flex items-center gap-3">
                <Switch id="premium" checked={formPremium} onCheckedChange={setFormPremium} />
                <Label htmlFor="premium" className="text-sm">Contenu premium</Label>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving}>Enregistrer brouillon</Button>
                <Button className="bg-gold hover:bg-gold-dark text-primary gap-1.5" onClick={() => handleSave("published")} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Publier
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher un article..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
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
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
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
                      <td className="p-4 hidden md:table-cell text-muted-foreground">{a.category}</td>
                      <td className="p-4 hidden lg:table-cell text-muted-foreground">{a.author_name}</td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColors[a.status] || "bg-muted text-muted-foreground"}`}>
                          {statusLabels[a.status] || a.status}
                        </span>
                      </td>
                      <td className="p-4 hidden md:table-cell text-muted-foreground">{a.views > 0 ? a.views.toLocaleString() : "—"}</td>
                      <td className="p-4 hidden lg:table-cell text-muted-foreground">{new Date(a.created_at).toLocaleDateString("fr-FR")}</td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onClick={() => openEdit(a)}><Edit className="w-4 h-4" /> Modifier</DropdownMenuItem>
                            {a.status !== "published" && (
                              <DropdownMenuItem className="gap-2" onClick={() => handlePublish(a.id)}><Send className="w-4 h-4" /> Publier</DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(a.id)}><Trash2 className="w-4 h-4" /> Supprimer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Aucun article trouvé</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticlesManager;
