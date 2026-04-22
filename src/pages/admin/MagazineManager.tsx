import { useEffect, useState } from "react";
import { Plus, Eye, Download, Crown, Trash2, Edit, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MediaUpload from "@/components/MediaUpload";
import magazineCover from "@/assets/magazine-cover.jpg";
import { Link } from "react-router-dom";

interface Issue {
  id: string;
  title: string;
  cover_url: string | null;
  summary: string | null;
  issue_date: string | null;
  status: string;
  premium: boolean;
  downloads: number;
  pdf_url: string | null;
  sort_order: number;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  current: "Édition courante",
  archived: "Archivée",
  draft: "Brouillon",
};

const MagazineManager = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Issue | null>(null);
  const [form, setForm] = useState({
    title: "",
    cover_url: "",
    pdf_url: "",
    summary: "",
    issue_date: "",
    status: "draft" as "draft" | "current" | "archived",
    premium: true,
  });

  const fetchIssues = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("magazine_issues")
      .select("*")
      .order("issue_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else setIssues(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchIssues(); }, []);

  const resetForm = () => {
    setForm({ title: "", cover_url: "", pdf_url: "", summary: "", issue_date: "", status: "draft", premium: true });
    setEditing(null);
  };

  const openCreate = () => { resetForm(); setOpen(true); };
  const openEdit = (i: Issue) => {
    setEditing(i);
    setForm({
      title: i.title,
      cover_url: i.cover_url || "",
      pdf_url: i.pdf_url || "",
      summary: i.summary || "",
      issue_date: i.issue_date || "",
      status: (i.status as any) || "draft",
      premium: i.premium,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Titre requis", variant: "destructive" });
      return;
    }
    // S'il s'agit d'une "current", repasser les autres en archived pour n'avoir qu'une seule édition courante.
    if (form.status === "current") {
      await supabase.from("magazine_issues").update({ status: "archived" }).eq("status", "current");
    }
    const payload = {
      title: form.title.trim(),
      cover_url: form.cover_url || null,
      pdf_url: form.pdf_url || null,
      summary: form.summary || null,
      issue_date: form.issue_date || null,
      status: form.status,
      premium: form.premium,
      created_by: user?.id ?? null,
    };
    const { error } = editing
      ? await supabase.from("magazine_issues").update(payload).eq("id", editing.id)
      : await supabase.from("magazine_issues").insert(payload);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "Édition mise à jour ✓" : "Édition créée ✓" });
    setOpen(false);
    resetForm();
    fetchIssues();
  };

  const handleDelete = async (i: Issue) => {
    if (!confirm(`Supprimer "${i.title}" ?`)) return;
    const { error } = await supabase.from("magazine_issues").delete().eq("id", i.id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else { toast({ title: "Édition supprimée" }); fetchIssues(); }
  };

  const setStatus = async (i: Issue, status: string) => {
    if (status === "current") {
      await supabase.from("magazine_issues").update({ status: "archived" }).eq("status", "current");
    }
    await supabase.from("magazine_issues").update({ status }).eq("id", i.id);
    fetchIssues();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Magazine mensuel</h1>
          <p className="text-sm text-muted-foreground font-body">
            {issues.length} édition(s) — visibles instantanément sur <Link to="/magazine" className="text-gold hover:underline inline-flex items-center gap-1">/magazine <ExternalLink className="w-3 h-3" /></Link>
          </p>
        </div>
        <Button onClick={openCreate} className="bg-gold hover:bg-gold-dark text-primary font-body text-sm gap-1">
          <Plus className="w-4 h-4" /> Nouvelle édition
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
      ) : issues.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-sm text-muted-foreground font-body">
          Aucune édition. Cliquez sur « Nouvelle édition » pour publier votre première parution.
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {issues.map((i) => (
            <Card key={i.id} className="overflow-hidden flex flex-col">
              <div className="relative aspect-[3/4] bg-muted">
                <img src={i.cover_url || magazineCover} alt={i.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <Badge variant={i.status === "current" ? "default" : i.status === "draft" ? "outline" : "secondary"} className="text-[10px]">
                    {STATUS_LABEL[i.status] || i.status}
                  </Badge>
                  {i.premium && <Badge className="bg-gold text-primary text-[10px] gap-1"><Crown className="w-2.5 h-2.5" /> Premium</Badge>}
                </div>
              </div>
              <CardContent className="p-3 flex-1 flex flex-col gap-2">
                <p className="text-sm font-display font-semibold line-clamp-2">{i.title}</p>
                <p className="text-[11px] text-muted-foreground font-body flex items-center gap-2">
                  {i.issue_date && <span>{new Date(i.issue_date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>}
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {i.downloads}</span>
                </p>
                <div className="mt-auto flex items-center gap-1">
                  <Select value={i.status} onValueChange={(v) => setStatus(i, v)}>
                    <SelectTrigger className="h-7 text-[11px] flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="current">Courante</SelectItem>
                      <SelectItem value="archived">Archivée</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(i)}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(i)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editing ? "Modifier l'édition" : "Nouvelle édition"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="font-body text-xs">Titre *</Label>
              <Input className="mt-1" placeholder="Nsango Magazine — Mai 2026" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-body text-xs">Date de parution</Label>
                <Input type="date" className="mt-1" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} />
              </div>
              <div>
                <Label className="font-body text-xs">Statut</Label>
                <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="current">Édition courante</SelectItem>
                    <SelectItem value="archived">Archivée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="font-body text-xs">Couverture</Label>
              <div className="mt-1">
                <MediaUpload accept="image/*" initialUrl={form.cover_url} initialSource="upload" onChange={({ url }) => setForm({ ...form, cover_url: url })} />
              </div>
            </div>
            <div>
              <Label className="font-body text-xs">URL du PDF (optionnel)</Label>
              <Input className="mt-1" placeholder="https://..." value={form.pdf_url} onChange={e => setForm({ ...form, pdf_url: e.target.value })} />
            </div>
            <div>
              <Label className="font-body text-xs">Sommaire</Label>
              <Textarea rows={4} className="mt-1" placeholder="Résumé du contenu..." value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="prem" checked={form.premium} onCheckedChange={v => setForm({ ...form, premium: v })} />
              <Label htmlFor="prem" className="font-body text-sm">Réservé aux abonnés Premium</Label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark text-primary gap-1.5">
                <Eye className="w-4 h-4" /> {editing ? "Enregistrer" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MagazineManager;