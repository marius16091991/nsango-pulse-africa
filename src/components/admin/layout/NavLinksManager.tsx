import { useEffect, useState } from "react";
import { Plus, Save, Trash2, Eye, EyeOff, Star, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavLinks, type NavLink } from "@/hooks/useNavLinks";

interface Props { location: "header" | "footer"; }

const empty = (location: "header" | "footer"): Partial<NavLink> => ({
  location,
  column_key: "main",
  group_label: "",
  group_icon: "",
  label: "",
  href: "/",
  description: "",
  icon: "",
  highlight: false,
  visible: true,
  sort_order: 100,
});

const NavLinksManager = ({ location }: Props) => {
  const { links, loading, refresh } = useNavLinks(location, false);
  const [editing, setEditing] = useState<Partial<NavLink> | null>(null);
  const [saving, setSaving] = useState(false);

  const grouped = links.reduce<Record<string, NavLink[]>>((acc, l) => {
    const k = l.column_key || "main";
    (acc[k] ||= []).push(l);
    return acc;
  }, {});

  const handleSave = async () => {
    if (!editing?.label?.trim() || !editing?.href?.trim()) {
      toast({ title: "Champs requis", description: "Libellé et URL sont obligatoires", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload: any = {
      location,
      column_key: editing.column_key || "main",
      group_label: editing.group_label || "",
      group_icon: editing.group_icon || "",
      label: editing.label,
      href: editing.href,
      description: editing.description || "",
      icon: editing.icon || "",
      highlight: !!editing.highlight,
      visible: editing.visible !== false,
      sort_order: editing.sort_order ?? 100,
    };
    const { error } = editing.id
      ? await supabase.from("nav_links").update(payload).eq("id", editing.id)
      : await supabase.from("nav_links").insert(payload);
    setSaving(false);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    toast({ title: editing.id ? "Lien mis à jour" : "Lien créé" });
    setEditing(null);
    refresh();
  };

  const toggleVisible = async (l: NavLink) => {
    await supabase.from("nav_links").update({ visible: !l.visible }).eq("id", l.id);
    refresh();
  };

  const remove = async (l: NavLink) => {
    if (!confirm(`Supprimer « ${l.label} » ?`)) return;
    await supabase.from("nav_links").delete().eq("id", l.id);
    toast({ title: "Lien supprimé" });
    refresh();
  };

  const move = async (l: NavLink, dir: -1 | 1) => {
    const same = links.filter(x => x.column_key === l.column_key).sort((a,b) => a.sort_order - b.sort_order);
    const idx = same.findIndex(x => x.id === l.id);
    const swap = same[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("nav_links").update({ sort_order: swap.sort_order }).eq("id", l.id),
      supabase.from("nav_links").update({ sort_order: l.sort_order }).eq("id", swap.id),
    ]);
    refresh();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground font-body">
          {location === "header"
            ? "Liens regroupés par menu déroulant. La colonne « flat » affiche un lien direct dans la barre."
            : "Liens organisés par colonne dans le footer (rubriques, à propos, légal...)."
          }
        </p>
        <Button onClick={() => setEditing(empty(location))} className="bg-gold hover:bg-gold-dark text-primary gap-2">
          <Plus className="w-4 h-4" /> Nouveau lien
        </Button>
      </div>

      {Object.entries(grouped).map(([colKey, items]) => (
        <Card key={colKey}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px]">{colKey}</Badge>
              <span>{items[0]?.group_label || <em className="text-muted-foreground">Sans libellé</em>}</span>
              <span className="text-xs text-muted-foreground font-normal">— {items.length} lien(s)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.sort((a,b) => a.sort_order - b.sort_order).map((l) => (
              <div key={l.id} className={`flex items-center gap-2 p-2.5 rounded-lg border ${l.visible ? "bg-background" : "bg-muted/40 opacity-60"}`}>
                <div className="flex flex-col">
                  <button onClick={() => move(l, -1)} className="text-muted-foreground hover:text-foreground"><ArrowUp className="w-3 h-3" /></button>
                  <button onClick={() => move(l, 1)} className="text-muted-foreground hover:text-foreground"><ArrowDown className="w-3 h-3" /></button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm font-body truncate">{l.label}</span>
                    {l.highlight && <Star className="w-3 h-3 text-gold fill-gold" />}
                    <code className="text-[10px] text-muted-foreground">{l.href}</code>
                  </div>
                  {l.description && <p className="text-xs text-muted-foreground truncate">{l.description}</p>}
                </div>
                <Button size="sm" variant="ghost" onClick={() => toggleVisible(l)} title={l.visible ? "Masquer" : "Afficher"}>
                  {l.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(l)}>Modifier</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(l)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {links.length === 0 && (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground font-body">
          Aucun lien dans cette section. Cliquez sur « Nouveau lien » pour commencer.
        </CardContent></Card>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="font-display">{editing?.id ? "Modifier le lien" : "Nouveau lien"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Colonne / Groupe (clé technique) *</Label>
                  <Input value={editing.column_key || ""} onChange={(e) => setEditing({ ...editing, column_key: e.target.value })}
                    placeholder={location === "header" ? "discover, inspire, live, listen, flat" : "rubriques, about, legal"} className="mt-1" />
                  <p className="text-[10px] text-muted-foreground mt-1">Les liens partageant la même clé sont groupés ensemble.</p>
                </div>
                <div>
                  <Label className="text-xs">Libellé du groupe (visible)</Label>
                  <Input value={editing.group_label || ""} onChange={(e) => setEditing({ ...editing, group_label: e.target.value })}
                    placeholder="Découvrir, Rubriques..." className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Libellé du lien *</Label>
                <Input value={editing.label || ""} onChange={(e) => setEditing({ ...editing, label: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">URL (href) *</Label>
                <Input value={editing.href || ""} onChange={(e) => setEditing({ ...editing, href: e.target.value })} placeholder="/business ou https://..." className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Description (sous-titre dans le menu)</Label>
                <Textarea rows={2} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Icône Lucide (groupe / item)</Label>
                <Input value={editing.icon || ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="Tv, Crown, Sparkles..." className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Icône du groupe</Label>
                <Input value={editing.group_icon || ""} onChange={(e) => setEditing({ ...editing, group_icon: e.target.value })} placeholder="Compass, Newspaper..." className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Ordre</Label>
                <Input type="number" value={editing.sort_order ?? 100} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} className="mt-1" />
              </div>
              <div className="flex items-center gap-6 pt-6">
                <label className="flex items-center gap-2 text-xs"><Switch checked={!!editing.visible} onCheckedChange={(v) => setEditing({ ...editing, visible: v })} /> Visible</label>
                <label className="flex items-center gap-2 text-xs"><Switch checked={!!editing.highlight} onCheckedChange={(v) => setEditing({ ...editing, highlight: v })} /> Mis en avant</label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gold hover:bg-gold-dark text-primary gap-2">
              <Save className="w-4 h-4" /> {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NavLinksManager;
