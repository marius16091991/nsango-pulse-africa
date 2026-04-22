import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Row { id: string; from_path: string; to_path: string; status_code: number; active: boolean; hits: number; notes: string; }

const SeoRedirectsTab = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({ from_path: "", to_path: "", status_code: 301, notes: "" });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("seo_redirects").select("*").order("created_at", { ascending: false });
    setRows((data || []) as Row[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!draft.from_path.startsWith("/") || !draft.to_path.startsWith("/")) {
      toast({ title: "Chemins invalides", description: "from_path et to_path doivent commencer par /", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("seo_redirects").insert({ ...draft, active: true });
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else { setDraft({ from_path: "", to_path: "", status_code: 301, notes: "" }); load(); }
  };

  const update = async (r: Row, patch: Partial<Row>) => {
    const { error } = await supabase.from("seo_redirects").update(patch).eq("id", r.id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette redirection ?")) return;
    await supabase.from("seo_redirects").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-semibold font-body">Nouvelle redirection</p>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <Input placeholder="/ancien-chemin" value={draft.from_path} onChange={(e) => setDraft({ ...draft, from_path: e.target.value })} className="md:col-span-4" />
            <Input placeholder="/nouveau-chemin" value={draft.to_path} onChange={(e) => setDraft({ ...draft, to_path: e.target.value })} className="md:col-span-4" />
            <Select value={String(draft.status_code)} onValueChange={(v) => setDraft({ ...draft, status_code: Number(v) })}>
              <SelectTrigger className="md:col-span-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="301">301 Permanent</SelectItem>
                <SelectItem value="302">302 Temporaire</SelectItem>
                <SelectItem value="307">307</SelectItem>
                <SelectItem value="308">308</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={add} className="bg-gold text-primary hover:bg-gold-dark gap-1.5 md:col-span-2"><Plus className="w-4 h-4" /> Ajouter</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gold" /></div> : (
            <div className="divide-y">
              {rows.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Aucune redirection</p>}
              {rows.map((r) => (
                <div key={r.id} className="p-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center hover:bg-secondary/30">
                  <code className="md:col-span-4 text-xs font-mono truncate">{r.from_path}</code>
                  <code className="md:col-span-4 text-xs font-mono truncate text-gold">→ {r.to_path}</code>
                  <span className="md:col-span-1 text-xs">{r.status_code}</span>
                  <span className="md:col-span-1 text-xs text-muted-foreground">{r.hits} hits</span>
                  <div className="md:col-span-2 flex items-center justify-end gap-2">
                    <Switch checked={r.active} onCheckedChange={(v) => update(r, { active: v })} />
                    <Button variant="ghost" size="icon" onClick={() => remove(r.id)} className="text-destructive hover:text-destructive h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SeoRedirectsTab;