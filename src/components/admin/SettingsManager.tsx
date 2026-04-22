import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Setting { key: string; value: string; label: string; category: string; }

interface Props { category: "payment" | "text" | "site" | "distribution"; description: string; }

const SettingsManager = ({ category, description }: Props) => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("premium_settings").select("*").eq("category", category).order("key");
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else {
      setSettings(data || []);
      const map: Record<string, string> = {};
      (data || []).forEach((s: any) => { map[s.key] = s.value; });
      setValues(map);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, [category]);

  const saveAll = async () => {
    setSaving(true);
    const updates = settings
      .filter(s => values[s.key] !== s.value)
      .map(s => supabase.from("premium_settings").update({ value: values[s.key] ?? "" }).eq("key", s.key));
    if (updates.length === 0) {
      toast({ title: "Aucun changement" });
      setSaving(false);
      return;
    }
    const results = await Promise.all(updates);
    const failed = results.filter(r => r.error);
    setSaving(false);
    if (failed.length) toast({ title: "Erreur partielle", description: failed[0].error?.message, variant: "destructive" });
    else { toast({ title: "Paramètres enregistrés", description: `${updates.length} valeur(s) mise(s) à jour` }); fetchSettings(); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display font-semibold">
            {category === "payment" ? "Coordonnées de paiement"
              : category === "text" ? "Textes du modal"
              : category === "site" ? "Informations du site"
              : "Règles de distribution"}
          </h3>
          <p className="text-xs text-muted-foreground font-body">{description}</p>
        </div>
        <Button onClick={saveAll} disabled={saving} className="bg-gold hover:bg-gold-dark text-primary gap-2">
          <Save className="w-4 h-4" /> {saving ? "Enregistrement..." : "Tout enregistrer"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          {settings.map((s) => {
            const isLong = s.key.includes("message") || s.key.includes("subtitle");
            return (
              <div key={s.key}>
                <Label htmlFor={s.key} className="text-xs font-body">{s.label}</Label>
                {isLong ? (
                  <Textarea id={s.key} rows={3} value={values[s.key] || ""} onChange={e => setValues({...values, [s.key]: e.target.value})} className="mt-1" />
                ) : (
                  <Input id={s.key} value={values[s.key] || ""} onChange={e => setValues({...values, [s.key]: e.target.value})} className="mt-1" />
                )}
                <p className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">{s.key}</p>
              </div>
            );
          })}
          {settings.length === 0 && <p className="text-sm text-muted-foreground font-body text-center py-6">Aucun paramètre dans cette catégorie.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManager;
