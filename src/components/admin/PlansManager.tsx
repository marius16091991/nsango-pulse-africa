import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  duration: string;
  price: number;
  currency: string;
  features: string[];
  sort_order: number;
  highlighted: boolean;
  active: boolean;
}

const empty: Omit<Plan, "id"> = {
  name: "", duration: "1 mois", price: 0, currency: "XAF",
  features: [], sort_order: 0, highlighted: false, active: true,
};

const PlansManager = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Plan, "id">>(empty);
  const [featuresText, setFeaturesText] = useState("");

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("premium_plans").select("*").order("sort_order");
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else setPlans((data || []).map((p: any) => ({ ...p, features: Array.isArray(p.features) ? p.features : [] })));
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty, sort_order: plans.length + 1 });
    setFeaturesText("");
    setOpen(true);
  };

  const openEdit = (p: Plan) => {
    setEditing(p);
    setForm({ name: p.name, duration: p.duration, price: p.price, currency: p.currency, features: p.features, sort_order: p.sort_order, highlighted: p.highlighted, active: p.active });
    setFeaturesText(p.features.join("\n"));
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast({ title: "Nom requis", variant: "destructive" }); return; }
    const features = featuresText.split("\n").map(s => s.trim()).filter(Boolean);
    const payload = { ...form, features };
    const { error } = editing
      ? await supabase.from("premium_plans").update(payload).eq("id", editing.id)
      : await supabase.from("premium_plans").insert(payload);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Plan modifié" : "Plan créé" });
    setOpen(false);
    fetchPlans();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce plan ?")) return;
    const { error } = await supabase.from("premium_plans").delete().eq("id", id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else { toast({ title: "Plan supprimé" }); fetchPlans(); }
  };

  const toggleActive = async (p: Plan) => {
    await supabase.from("premium_plans").update({ active: !p.active }).eq("id", p.id);
    fetchPlans();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold">Plans Premium</h3>
          <p className="text-xs text-muted-foreground font-body">Configurez les offres visibles dans le modal Premium</p>
        </div>
        <Button onClick={openNew} className="bg-gold hover:bg-gold-dark text-primary gap-2">
          <Plus className="w-4 h-4" /> Nouveau plan
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => (
            <Card key={p.id} className={p.highlighted ? "border-gold/50 ring-1 ring-gold/20" : ""}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-display font-bold">{p.name}</p>
                      {p.highlighted && <Star className="w-3.5 h-3.5 text-gold fill-gold" />}
                    </div>
                    <p className="text-xs text-muted-foreground font-body">{p.duration}</p>
                  </div>
                  <Switch checked={p.active} onCheckedChange={() => toggleActive(p)} />
                </div>
                <p className="text-2xl font-bold font-display">{p.price.toLocaleString("fr-FR")} <span className="text-sm font-normal text-muted-foreground">{p.currency}</span></p>
                <ul className="space-y-1">
                  {p.features.slice(0, 3).map((f, i) => <li key={i} className="text-xs text-muted-foreground font-body">✓ {f}</li>)}
                  {p.features.length > 3 && <li className="text-xs text-muted-foreground font-body">+ {p.features.length - 3} autres</li>}
                </ul>
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="ghost" size="sm" className="flex-1 gap-1.5" onClick={() => openEdit(p)}>
                    <Pencil className="w-3.5 h-3.5" /> Modifier
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => remove(p.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editing ? "Modifier le plan" : "Nouveau plan"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Nom *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Mensuel" /></div>
              <div><Label>Durée</Label><Input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="1 mois" /></div>
              <div><Label>Prix</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} /></div>
              <div><Label>Devise</Label><Input value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} placeholder="XAF" /></div>
              <div><Label>Ordre d'affichage</Label><Input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: Number(e.target.value)})} /></div>
            </div>
            <div>
              <Label>Avantages (un par ligne)</Label>
              <Textarea rows={5} value={featuresText} onChange={e => setFeaturesText(e.target.value)} placeholder="Articles illimités&#10;Magazine PDF&#10;Sans publicité" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2"><Switch checked={form.highlighted} onCheckedChange={v => setForm({...form, highlighted: v})} /><Label className="text-sm">Mis en avant (badge populaire)</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={v => setForm({...form, active: v})} /><Label className="text-sm">Actif</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} className="bg-gold hover:bg-gold-dark text-primary">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlansManager;
