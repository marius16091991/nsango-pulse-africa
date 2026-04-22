import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { invalidateSeoCache } from "@/hooks/useSeoSettings";

interface Setting { key: string; value: string; label: string; category: string; }

const SeoSettingsTab = ({ category }: { category: string }) => {
  const [rows, setRows] = useState<Setting[]>([]);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("seo_settings").select("*").eq("category", category).order("key");
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else {
      setRows(data || []);
      const m: Record<string, string> = {};
      (data || []).forEach((r: any) => { m[r.key] = r.value; });
      setVals(m);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [category]);

  const save = async () => {
    setSaving(true);
    const updates = rows.filter(r => vals[r.key] !== r.value)
      .map(r => supabase.from("seo_settings").update({ value: vals[r.key] ?? "" }).eq("key", r.key));
    if (!updates.length) { toast({ title: "Aucun changement" }); setSaving(false); return; }
    const res = await Promise.all(updates);
    setSaving(false);
    const fail = res.filter(r => r.error);
    if (fail.length) toast({ title: "Erreur partielle", description: fail[0].error?.message, variant: "destructive" });
    else { toast({ title: "Paramètres SEO enregistrés", description: `${updates.length} valeur(s)` }); invalidateSeoCache(); fetchAll(); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gold" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-gold hover:bg-gold-dark text-primary gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Enregistrer
        </Button>
      </div>
      <Card>
        <CardContent className="p-5 space-y-4">
          {rows.map((r) => {
            const isLong = r.key.includes("description") || r.key.includes("robots_txt") || r.key.includes("sameas");
            return (
              <div key={r.key}>
                <Label htmlFor={r.key} className="text-xs font-body">{r.label}</Label>
                {isLong ? (
                  <Textarea id={r.key} rows={r.key === "robots_txt" ? 8 : 3} value={vals[r.key] || ""} onChange={e => setVals({ ...vals, [r.key]: e.target.value })} className="mt-1 font-mono text-xs" />
                ) : (
                  <Input id={r.key} value={vals[r.key] || ""} onChange={e => setVals({ ...vals, [r.key]: e.target.value })} className="mt-1" />
                )}
                <p className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">{r.key}</p>
              </div>
            );
          })}
          {rows.length === 0 && <p className="text-sm text-muted-foreground font-body text-center py-6">Aucun paramètre.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default SeoSettingsTab;