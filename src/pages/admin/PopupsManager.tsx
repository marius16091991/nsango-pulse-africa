import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, BarChart3, Copy, Sparkles } from "lucide-react";

type Popup = any;

const empty: Popup = {
  name: "",
  title: "",
  content: "",
  display_type: "modal",
  position: "center",
  background_color: "#1a1a1a",
  text_color: "#ffffff",
  accent_color: "#D4A017",
  width: "md",
  border_radius: "lg",
  image_url: "",
  show_close_button: true,
  overlay: true,
  animation: "fade",
  animation_duration: 300,
  auto_close_seconds: 0,
  cta_label: "",
  cta_url: "",
  cta_style: "primary",
  target_pages: [],
  exclude_pages: [],
  trigger: "load",
  trigger_value: 0,
  frequency: "once_per_session",
  audience: "all",
  start_at: "",
  end_at: "",
  status: "draft",
  priority: 0,
};

const Preview = ({ p }: { p: Popup }) => (
  <div className="border rounded-lg p-6 bg-muted/30 flex items-center justify-center min-h-[280px]">
    <div
      className="relative shadow-xl border max-w-sm w-full rounded-lg"
      style={{ background: p.background_color, color: p.text_color, borderColor: `${p.accent_color}55` }}
    >
      {p.image_url && <img src={p.image_url} alt="" className="w-full h-32 object-cover rounded-t-lg" />}
      <div className="p-5">
        {p.title && <h3 className="font-bold text-lg mb-2" style={{ color: p.accent_color }}>{p.title}</h3>}
        {p.content && <div className="text-sm mb-4" dangerouslySetInnerHTML={{ __html: p.content }} />}
        {p.cta_label && (
          <button
            className="px-4 py-2 text-sm font-bold rounded-lg"
            style={
              p.cta_style === "outline"
                ? { border: `2px solid ${p.accent_color}`, color: p.accent_color, background: "transparent" }
                : p.cta_style === "ghost"
                ? { color: p.accent_color, background: "transparent" }
                : { background: p.accent_color, color: p.background_color }
            }
          >
            {p.cta_label}
          </button>
        )}
      </div>
    </div>
  </div>
);

const PopupsManager = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Popup>(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_popups").select("*").order("created_at", { ascending: false });
    if (!error) setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setForm({ ...empty }); setOpen(true); };
  const startEdit = (p: Popup) => {
    setForm({
      ...p,
      target_pages: (p.target_pages || []).join("\n"),
      exclude_pages: (p.exclude_pages || []).join("\n"),
      start_at: p.start_at ? new Date(p.start_at).toISOString().slice(0, 16) : "",
      end_at: p.end_at ? new Date(p.end_at).toISOString().slice(0, 16) : "",
    });
    setOpen(true);
  };

  const save = async () => {
    const payload: any = {
      ...form,
      target_pages: typeof form.target_pages === "string"
        ? form.target_pages.split("\n").map((s: string) => s.trim()).filter(Boolean)
        : form.target_pages,
      exclude_pages: typeof form.exclude_pages === "string"
        ? form.exclude_pages.split("\n").map((s: string) => s.trim()).filter(Boolean)
        : form.exclude_pages,
      start_at: form.start_at || null,
      end_at: form.end_at || null,
      trigger_value: Number(form.trigger_value) || 0,
      priority: Number(form.priority) || 0,
    };
    delete payload.impressions; delete payload.clicks; delete payload.dismissals;
    delete payload.created_at; delete payload.updated_at;

    if (!payload.name) { toast({ title: "Nom requis", variant: "destructive" }); return; }

    const { error } = form.id
      ? await supabase.from("site_popups").update(payload).eq("id", form.id)
      : await supabase.from("site_popups").insert(payload);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: form.id ? "Pop-up mis à jour" : "Pop-up créé" });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce pop-up ?")) return;
    const { error } = await supabase.from("site_popups").delete().eq("id", id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Pop-up supprimé" }); load();
  };

  const toggleStatus = async (p: Popup) => {
    const newStatus = p.status === "active" ? "paused" : "active";
    await supabase.from("site_popups").update({ status: newStatus }).eq("id", p.id);
    load();
  };

  const duplicate = async (p: Popup) => {
    const { id, created_at, updated_at, impressions, clicks, dismissals, ...rest } = p;
    await supabase.from("site_popups").insert({ ...rest, name: `${p.name} (copie)`, status: "draft" });
    toast({ title: "Pop-up dupliqué" }); load();
  };

  const set = (k: string, v: any) => setForm((f: Popup) => ({ ...f, [k]: v }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold" />
            Pop-ups & Info-bulles
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Créez, programmez et diffusez des messages contextuels sur le site.</p>
        </div>
        <Button onClick={startNew} className="bg-gold hover:bg-gold-dark text-primary">
          <Plus className="w-4 h-4 mr-2" /> Nouveau pop-up
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement…</div>
      ) : !items.length ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Sparkles className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-semibold">Aucun pop-up pour l'instant</p>
          <p className="text-sm text-muted-foreground mt-1">Créez votre premier message contextuel.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((p) => (
            <div key={p.id} className="border rounded-lg p-4 bg-card flex flex-wrap items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: p.background_color, color: p.accent_color }}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{p.name}</span>
                  <Badge variant={p.status === "active" ? "default" : "secondary"} className={p.status === "active" ? "bg-green-600" : ""}>{p.status}</Badge>
                  <Badge variant="outline">{p.display_type}</Badge>
                  <Badge variant="outline">{p.trigger}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.title || "Sans titre"}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span title="Impressions"><Eye className="w-3 h-3 inline mr-1" />{p.impressions}</span>
                <span title="Clics"><BarChart3 className="w-3 h-3 inline mr-1" />{p.clicks}</span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => toggleStatus(p)}>{p.status === "active" ? "Pause" : "Activer"}</Button>
                <Button size="sm" variant="ghost" onClick={() => duplicate(p)}><Copy className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => startEdit(p)}><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Modifier le pop-up" : "Nouveau pop-up"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="content">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="targeting">Ciblage</TabsTrigger>
              <TabsTrigger value="schedule">Programmation</TabsTrigger>
              <TabsTrigger value="preview">Aperçu</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 pt-4">
              <div>
                <Label>Nom interne *</Label>
                <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="ex: Promo CAN 2025" />
              </div>
              <div>
                <Label>Titre affiché</Label>
                <Input value={form.title} onChange={e => set("title", e.target.value)} />
              </div>
              <div>
                <Label>Contenu (HTML autorisé)</Label>
                <Textarea rows={5} value={form.content} onChange={e => set("content", e.target.value)} />
              </div>
              <div>
                <Label>URL image (optionnel)</Label>
                <Input value={form.image_url} onChange={e => set("image_url", e.target.value)} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Texte du bouton</Label>
                  <Input value={form.cta_label} onChange={e => set("cta_label", e.target.value)} />
                </div>
                <div>
                  <Label>Lien du bouton</Label>
                  <Input value={form.cta_url} onChange={e => set("cta_url", e.target.value)} />
                </div>
                <div>
                  <Label>Style du bouton</Label>
                  <Select value={form.cta_style} onValueChange={v => set("cta_style", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Plein</SelectItem>
                      <SelectItem value="outline">Contour</SelectItem>
                      <SelectItem value="ghost">Discret</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type d'affichage</Label>
                  <Select value={form.display_type} onValueChange={v => set("display_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modal">Modale (centrale)</SelectItem>
                      <SelectItem value="banner">Bannière</SelectItem>
                      <SelectItem value="corner">Coin</SelectItem>
                      <SelectItem value="toast">Toast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Position</Label>
                  <Select value={form.position} onValueChange={v => set("position", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Centre</SelectItem>
                      <SelectItem value="top">Haut</SelectItem>
                      <SelectItem value="bottom">Bas</SelectItem>
                      <SelectItem value="top-left">Haut gauche</SelectItem>
                      <SelectItem value="top-right">Haut droite</SelectItem>
                      <SelectItem value="bottom-left">Bas gauche</SelectItem>
                      <SelectItem value="bottom-right">Bas droite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Couleur de fond</Label>
                  <Input type="color" value={form.background_color} onChange={e => set("background_color", e.target.value)} />
                </div>
                <div>
                  <Label>Couleur du texte</Label>
                  <Input type="color" value={form.text_color} onChange={e => set("text_color", e.target.value)} />
                </div>
                <div>
                  <Label>Couleur d'accent</Label>
                  <Input type="color" value={form.accent_color} onChange={e => set("accent_color", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Largeur</Label>
                  <Select value={form.width} onValueChange={v => set("width", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Petite</SelectItem>
                      <SelectItem value="md">Moyenne</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                      <SelectItem value="xl">Très large</SelectItem>
                      <SelectItem value="full">Pleine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Coins arrondis</Label>
                  <Select value={form.border_radius} onValueChange={v => set("border_radius", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      <SelectItem value="sm">Léger</SelectItem>
                      <SelectItem value="md">Moyen</SelectItem>
                      <SelectItem value="lg">Grand</SelectItem>
                      <SelectItem value="xl">Très grand</SelectItem>
                      <SelectItem value="full">Maximum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Animation</Label>
                  <Select value={form.animation} onValueChange={v => set("animation", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fade">Fondu</SelectItem>
                      <SelectItem value="slide">Glissement</SelectItem>
                      <SelectItem value="slide-down">Glissement (haut)</SelectItem>
                      <SelectItem value="slide-left">Glissement (gauche)</SelectItem>
                      <SelectItem value="slide-right">Glissement (droite)</SelectItem>
                      <SelectItem value="zoom">Zoom</SelectItem>
                      <SelectItem value="bounce">Rebond</SelectItem>
                      <SelectItem value="flip">Flip</SelectItem>
                      <SelectItem value="none">Aucune</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Durée d'animation (ms)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={50}
                    value={form.animation_duration ?? 300}
                    onChange={e => set("animation_duration", Number(e.target.value) || 0)}
                    placeholder="300"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Vitesse d'apparition (par défaut 300ms).</p>
                </div>
                <div>
                  <Label>Fermeture automatique (sec)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={form.auto_close_seconds ?? 0}
                    onChange={e => set("auto_close_seconds", Number(e.target.value) || 0)}
                    placeholder="0 = désactivé"
                  />
                  <p className="text-xs text-muted-foreground mt-1">0 = le pop-up reste affiché jusqu'à fermeture manuelle.</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.show_close_button} onCheckedChange={v => set("show_close_button", v)} />
                  <Label>Bouton fermer</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.overlay} onCheckedChange={v => set("overlay", v)} />
                  <Label>Fond sombre (modale)</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="targeting" className="space-y-4 pt-4">
              <div>
                <Label>Pages ciblées (une par ligne, vide = toutes)</Label>
                <Textarea rows={3} value={form.target_pages as any} onChange={e => set("target_pages", e.target.value)} placeholder="/&#10;/sport&#10;/article/*" />
              </div>
              <div>
                <Label>Pages exclues (une par ligne)</Label>
                <Textarea rows={2} value={form.exclude_pages as any} onChange={e => set("exclude_pages", e.target.value)} placeholder="/auth&#10;/compte" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Audience</Label>
                  <Select value={form.audience} onValueChange={v => set("audience", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tout le monde</SelectItem>
                      <SelectItem value="guests">Visiteurs non connectés</SelectItem>
                      <SelectItem value="authenticated">Utilisateurs connectés</SelectItem>
                      <SelectItem value="premium">Abonnés premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fréquence</Label>
                  <Select value={form.frequency} onValueChange={v => set("frequency", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">À chaque visite</SelectItem>
                      <SelectItem value="once_per_session">Une fois par session</SelectItem>
                      <SelectItem value="once_per_day">Une fois par jour</SelectItem>
                      <SelectItem value="once_per_user">Une seule fois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Déclencheur</Label>
                  <Select value={form.trigger} onValueChange={v => set("trigger", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="load">Au chargement</SelectItem>
                      <SelectItem value="delay">Après délai</SelectItem>
                      <SelectItem value="scroll">Au scroll (%)</SelectItem>
                      <SelectItem value="exit_intent">Sortie de page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valeur (sec ou %)</Label>
                  <Input type="number" value={form.trigger_value} onChange={e => set("trigger_value", e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date de début</Label>
                  <Input type="datetime-local" value={form.start_at} onChange={e => set("start_at", e.target.value)} />
                </div>
                <div>
                  <Label>Date de fin</Label>
                  <Input type="datetime-local" value={form.end_at} onChange={e => set("end_at", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Statut</Label>
                  <Select value={form.status} onValueChange={v => set("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="paused">En pause</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priorité (plus haut = prioritaire)</Label>
                  <Input type="number" value={form.priority} onChange={e => set("priority", e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="pt-4">
              <Preview p={form} />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} className="bg-gold hover:bg-gold-dark text-primary">
              {form.id ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PopupsManager;